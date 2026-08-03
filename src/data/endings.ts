// 4개 엔딩 콘텐츠 (제품 기획서 8장). 정적 콘텐츠만 둔다.
import type { Ending } from "@/types/game";
import type { EndingId } from "@/features/game/endingResolver";

export const ENDINGS: Record<EndingId, Ending> = {
  "ending-ace": {
    id: "ending-ace",
    title: "눈치백단 에이스",
    grade: "S",
    emoji: "🏆",
    story:
      "회사어를 능숙하게 해석하고, 확인할 건 확인하며 결과까지 챙겼어요. 팀은 김넵을 든든한 동료로 기억합니다. 일과 관계의 균형을 갖춘 멋진 수습 통과예요.",
  },
  "ending-trusted": {
    id: "ending-trusted",
    title: "믿고 맡기는 신입",
    grade: "A",
    emoji: "🌟",
    story:
      "결과와 신뢰 중 하나가 뚜렷하게 빛났어요. '이건 김넵한테 맡기면 되겠다'는 말을 듣는 안정적인 수습 통과입니다. 남은 축을 조금 더 키우면 에이스도 멀지 않아요.",
  },
  "ending-my-pace": {
    id: "ending-my-pace",
    title: "마이웨이 성장형",
    grade: "B",
    emoji: "🌱",
    story:
      "아직 서툰 부분도 있지만 김넵만의 속도로 꾸준히 나아갔어요. 큰 사고 없이 수습을 통과했고, 경험이 쌓일수록 더 단단해질 성장형입니다.",
  },
  "ending-survival": {
    id: "ending-survival",
    title: "조용한 생존자",
    grade: "C",
    emoji: "🫧",
    story:
      "쉽지 않은 5일이었지만 어쨌든 수습은 통과했어요. 기본기 한두 가지만 보완하면 다음엔 훨씬 편해질 거예요. 오늘의 성장 포인트를 기억해 두면 충분합니다.",
  },
};

export function getEnding(id: EndingId): Ending {
  return ENDINGS[id];
}
