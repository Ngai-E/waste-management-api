import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { AlertStatus } from '../common/enums/alert-status.enum';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async create(userId: string, createDto: any): Promise<Alert> {
    const alert = this.alertRepository.create({
      createdById: userId,
      type: createDto.type,
      binId: createDto.binId,
      description: createDto.description,
      photoUrl: createDto.photoUrl,
      gpsLat: createDto.gpsLat,
      gpsLng: createDto.gpsLng,
      status: AlertStatus.OPEN,
    });

    return this.alertRepository.save(alert);
  }

  async findAll(status?: AlertStatus, type?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    return this.alertRepository.find({
      where,
      relations: ['createdBy', 'bin', 'resolvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: ['createdBy', 'bin', 'resolvedBy'],
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    return alert;
  }

  async updateStatus(id: string, userId: string, updateDto: any): Promise<Alert> {
    const alert = await this.findOne(id);

    alert.status = updateDto.status;
    alert.resolutionNotes = updateDto.resolutionNotes;

    if (updateDto.status === AlertStatus.RESOLVED) {
      alert.resolvedById = userId;
      alert.resolvedAt = new Date();
    }

    return this.alertRepository.save(alert);
  }
}
