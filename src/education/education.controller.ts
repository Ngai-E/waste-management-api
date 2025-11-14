import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EducationService } from './education.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Education')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get educational content' })
  async findAll(
    @Query('audience') audience?: string,
    @Query('language') language?: string,
  ) {
    return this.educationService.findAll(audience, language);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get educational content by ID' })
  async findOne(@Param('id') id: string) {
    return this.educationService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create educational content (Admin only)' })
  async create(@Body() createDto: any) {
    return this.educationService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update educational content (Admin only)' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.educationService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete educational content (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.educationService.remove(id);
  }
}
