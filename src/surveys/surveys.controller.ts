import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Surveys')
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all surveys' })
  async findAll(
    @Query('targetGroup') targetGroup?: string,
    @Query('active') isActive?: boolean,
  ) {
    return this.surveysService.findAllSurveys(targetGroup, isActive);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get survey by ID' })
  async findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create survey (Admin only)' })
  async create(@Body() createDto: any) {
    return this.surveysService.createSurvey(createDto);
  }

  @Post(':id/responses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit survey response' })
  async submitResponse(
    @Param('id') surveyId: string,
    @CurrentUser('sub') userId: string,
    @Body('answers') answers: any,
  ) {
    return this.surveysService.submitResponse(surveyId, userId, answers);
  }

  @Get(':id/responses')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.HYSACAM, Role.COUNCIL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get survey responses (Admin/HYSACAM/Council)' })
  async getResponses(@Param('id') surveyId: string) {
    return this.surveysService.getResponses(surveyId);
  }
}
