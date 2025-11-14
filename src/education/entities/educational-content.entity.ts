import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { Language } from '../../common/enums/language.enum';
import { TargetAudience } from '../../common/enums/target-audience.enum';

@Entity('educational_content')
export class EducationalContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    name: 'content_type',
  })
  contentType: ContentType;

  @Column({ name: 'content_url', nullable: true })
  contentUrl: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.EN,
  })
  language: Language;

  @Column({
    type: 'enum',
    enum: TargetAudience,
    name: 'target_audience',
    default: TargetAudience.GENERAL,
  })
  targetAudience: TargetAudience;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
