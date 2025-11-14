import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BinsService } from './bins.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Bins')
@Controller('bins')
export class BinsController {
  constructor(private readonly binsService: BinsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create bin (Admin only)' })
  async create(@Body() createDto: any) {
    return this.binsService.create(createDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all bins' })
  async findAll() {
    return this.binsService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get bin by ID' })
  async findOne(@Param('id') id: string) {
    return this.binsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.HYSACAM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update bin (Admin/HYSACAM)' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.binsService.update(id, updateDto);
  }
}
