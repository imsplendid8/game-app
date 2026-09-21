import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';

@ApiTags('Experiences')
@Controller('api/experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new experience program' })
  async create(@Body() createExperienceDto: CreateExperienceDto) {
    return await this.experiencesService.create(createExperienceDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and filter experiences' })
  async search(
    @Query('search') search?: string,
    @Query('ageGroup') ageGroup?: string,
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
    @Query('category') category?: string,
    @Query('sort') sort?: 'recent' | 'price-low' | 'price-high' | 'name',
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return await this.experiencesService.search({
      search,
      ageGroup,
      priceMin,
      priceMax,
      category,
      sort,
      limit,
      offset,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all active experience programs' })
  async findAll() {
    return await this.experiencesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get experience program by ID' })
  async findOne(@Param('id') id: string) {
    return await this.experiencesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update experience program' })
  async update(@Param('id') id: string, @Body() data: any) {
    return await this.experiencesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete experience program (soft delete)' })
  async remove(@Param('id') id: string) {
    return await this.experiencesService.remove(id);
  }
}
