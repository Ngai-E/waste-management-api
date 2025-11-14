import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityBin } from './entities/community-bin.entity';

@Injectable()
export class BinsService {
  constructor(
    @InjectRepository(CommunityBin)
    private binRepository: Repository<CommunityBin>,
  ) {}

  async create(createDto: any): Promise<CommunityBin> {
    const bin = this.binRepository.create(createDto);
    return this.binRepository.save(bin);
  }

  async findAll(): Promise<CommunityBin[]> {
    return this.binRepository.find({
      order: { locationName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CommunityBin> {
    const bin = await this.binRepository.findOne({ where: { id } });

    if (!bin) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    return bin;
  }

  async update(id: string, updateDto: any): Promise<CommunityBin> {
    await this.binRepository.update(id, updateDto);
    return this.findOne(id);
  }
}
