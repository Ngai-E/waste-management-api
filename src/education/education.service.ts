import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducationalContent } from './entities/educational-content.entity';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(EducationalContent)
    private educationRepository: Repository<EducationalContent>,
  ) {}

  async create(createDto: Partial<EducationalContent>): Promise<EducationalContent> {
    const content = this.educationRepository.create(createDto);
    return await this.educationRepository.save(content);
  }

  async findAll(audience?: string, language?: string): Promise<EducationalContent[]> {
    const where: any = { isPublished: true };
    if (audience) where.targetAudience = audience;
    if (language) where.language = language;

    return this.educationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EducationalContent> {
    const content = await this.educationRepository.findOne({ where: { id } });

    if (!content) {
      throw new NotFoundException(`Educational content with ID ${id} not found`);
    }

    return content;
  }

  async update(id: string, updateDto: any): Promise<EducationalContent> {
    await this.educationRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.educationRepository.delete(id);
  }
}
