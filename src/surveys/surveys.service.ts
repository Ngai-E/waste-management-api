import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { SurveyResponse } from './entities/survey-response.entity';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyResponse)
    private responseRepository: Repository<SurveyResponse>,
  ) {}

  async createSurvey(createDto: any): Promise<Survey> {
    const survey = this.surveyRepository.create(createDto);
    // TypeORM save returns the saved entity
    return this.surveyRepository.save(survey);
  }

  async findAllSurveys(targetGroup?: string, isActive?: boolean): Promise<Survey[]> {
    const where: any = {};
    if (targetGroup) where.targetGroup = targetGroup;
    if (isActive !== undefined) where.isActive = isActive;

    return this.surveyRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async submitResponse(surveyId: string, userId: string, answers: any): Promise<SurveyResponse> {
    const response = this.responseRepository.create({
      surveyId,
      userId,
      answers,
    });
    return this.responseRepository.save(response);
  }

  async getResponses(surveyId: string): Promise<SurveyResponse[]> {
    return this.responseRepository.find({
      where: { surveyId },
      relations: ['user'],
      order: { submittedAt: 'DESC' },
    });
  }
}
