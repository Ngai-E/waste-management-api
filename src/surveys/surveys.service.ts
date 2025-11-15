import { Injectable, NotFoundException } from '@nestjs/common';
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
    const saved = await this.surveyRepository.save(survey);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAllSurveys(targetGroup?: string, isActive?: boolean): Promise<Survey[]> {
    const where: any = {};
    if (targetGroup) where.targetGroup = targetGroup;
    if (isActive !== undefined) where.isActive = isActive;

    return this.surveyRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({ where: { id } });
    
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    
    return survey;
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
