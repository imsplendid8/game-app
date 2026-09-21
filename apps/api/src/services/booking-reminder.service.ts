import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../modules/bookings/entities/booking.entity';
import {
  BookingReminder,
  ReminderType,
} from '../modules/bookings/entities/booking-reminder.entity';
import { EmailService } from './email.service';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class BookingReminderService {
  private readonly logger = new Logger(BookingReminderService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(BookingReminder)
    private remindersRepository: Repository<BookingReminder>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  // 매일 아침 8시에 실행 (한국 시간)
  @Cron('0 8 * * *', { timeZone: 'Asia/Seoul' })
  async scheduleDailyReminders() {
    this.logger.log('매일 알림 스케줄 시작');

    try {
      // 7일 후 예약 찾기
      await this.processRemindersForDaysAhead(7, ReminderType.SEVEN_DAYS_BEFORE);

      // 1일 후 예약 찾기
      await this.processRemindersForDaysAhead(1, ReminderType.ONE_DAY_BEFORE);

      // 오늘 예약 찾기
      await this.processRemindersForDaysAhead(0, ReminderType.DAY_OF);

      this.logger.log('매일 알림 스케줄 완료');
    } catch (error) {
      this.logger.error(
        '알림 스케줄 처리 중 오류',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async processRemindersForDaysAhead(
    daysAhead: number,
    reminderType: ReminderType,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysAhead);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    this.logger.log(
      `${daysAhead}일 후 알림 처리: ${targetDate.toDateString()}`,
    );

    // 해당 날짜의 예약 찾기
    const bookings = await this.bookingsRepository.find({
      where: {
        experienceDate: MoreThanOrEqual(targetDate),
        status: BookingStatus.CONFIRMED,
      },
      relations: ['experience', 'experience.institution', 'user'],
    });

    for (const booking of bookings) {
      const experienceDate = new Date(booking.experienceDate);

      if (
        experienceDate.getFullYear() === targetDate.getFullYear() &&
        experienceDate.getMonth() === targetDate.getMonth() &&
        experienceDate.getDate() === targetDate.getDate()
      ) {
        await this.sendReminder(booking, reminderType);
      }
    }
  }

  private async sendReminder(booking: Booking, reminderType: ReminderType) {
    try {
      // 이미 보낸 알림인지 확인
      const existingReminder = await this.remindersRepository.findOne({
        where: {
          bookingId: booking.id,
          type: reminderType,
          sent: true,
        },
      });

      if (existingReminder) {
        this.logger.log(
          `이미 보낸 알림입니다: ${booking.id} (${reminderType})`,
        );
        return;
      }

      // 사용자 이메일 가져오기
      const user = await this.usersRepository.findOne({
        where: { id: booking.userId },
      });

      if (!user || !user.email) {
        this.logger.warn(`사용자 이메일 없음: ${booking.userId}`);
        return;
      }

      // 알림 이메일 생성
      const daysUntil = this.getDaysUntil(booking.experienceDate);
      const emailHtml = this.emailService.generateReminderEmail({
        programName: booking.experience?.programName || '프로그램',
        institutionName: booking.experience?.institution?.institutionName || '-',
        experienceDate: booking.experienceDate.toISOString(),
        daysUntil,
        confirmationNumber: booking.confirmationNumber,
      });

      let subject = '';
      if (daysUntil === 7) {
        subject = `[알림] 예약하신 프로그램이 7일 후에 있습니다`;
      } else if (daysUntil === 1) {
        subject = `[알림] 예약하신 프로그램이 내일 있습니다`;
      } else if (daysUntil === 0) {
        subject = `[알림] 오늘이 예약하신 프로그램 날입니다`;
      }

      // 이메일 전송
      const sent = await this.emailService.sendEmail({
        to: user.email,
        subject,
        html: emailHtml,
      });

      // 알림 기록 저장
      const reminder = new BookingReminder();
      reminder.bookingId = booking.id;
      reminder.booking = booking;
      reminder.type = reminderType;
      reminder.sent = sent;
      reminder.email = user.email;
      reminder.sentAt = sent ? new Date() : null;
      reminder.errorMessage = sent ? null : '이메일 전송 실패';

      await this.remindersRepository.save(reminder);

      this.logger.log(
        `알림 ${sent ? '전송' : '실패'}: ${booking.id} (${reminderType})`,
      );
    } catch (error) {
      this.logger.error(
        `알림 처리 중 오류: ${booking.id}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private getDaysUntil(experienceDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(experienceDate);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  // 수동 알림 트리거 (테스트용)
  async triggerReminderForBooking(bookingId: string, type: ReminderType) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['experience', 'experience.institution', 'user'],
    });

    if (!booking) {
      throw new Error('예약을 찾을 수 없습니다');
    }

    await this.sendReminder(booking, type);
  }

  // 예약 확인 이메일 전송 (예약 직후)
  async sendBookingConfirmationEmail(booking: Booking) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: booking.userId },
      });

      if (!user || !user.email) {
        this.logger.warn(`사용자 이메일 없음: ${booking.userId}`);
        return;
      }

      const emailHtml = this.emailService.generateBookingConfirmationEmail({
        programName: booking.experience?.programName || '프로그램',
        institutionName: booking.experience?.institution?.institutionName || '-',
        experienceDate: booking.experienceDate.toISOString(),
        confirmationNumber: booking.confirmationNumber,
        childrenCount: booking.selectedChildren?.length || 0,
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: `[예약 확인] ${booking.experience?.programName || '프로그램'} 예약이 확인되었습니다`,
        html: emailHtml,
      });

      this.logger.log(`예약 확인 이메일 전송: ${booking.id}`);
    } catch (error) {
      this.logger.error(
        `예약 확인 이메일 전송 실패: ${booking.id}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
