import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  ParseUUIDPipe
} from '@nestjs/common';
import { Request } from 'express';
import { EventService } from '../services/event.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthTenantGuard } from 'src/auth/guards/auth-tenant.guard';
import { AuthSaasGuard } from 'src/auth/guards/auth-saas.guard';
import { CreateEventDto } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';

@Controller('event')
@UseGuards(AuthTenantGuard, AuthSaasGuard)
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Get()
  findAll(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto
  ) {
    return this.eventService.findAll(req.userId, req.memberTenantId, paginationDto);
  }

  @Get(':id')
  findOne(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.eventService.findOne(id, req.userId, req.memberTenantId);
  }

  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: Request
  ) {
    return this.eventService.create(createEventDto, req.userId, req.memberTenantId);
  }

  @Patch(':id')
  patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: Request
  ) {
    return this.eventService.patch(id, updateEventDto, req.userId, req.memberTenantId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    return this.eventService.remove(id, req.userId, req.memberTenantId);
  }

  @Get('faculty/:facultyId')
  findByFaculty(
    @Param('facultyId', ParseUUIDPipe) facultyId: string,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto
  ) {
    return this.eventService.findByFaculty(facultyId, req.userId, req.memberTenantId, paginationDto);
  }

  @Get('statistics/tenant')
  getEventStatistics(@Req() req: Request) {
    return this.eventService.getEventStatistics(req.userId, req.memberTenantId);
  }
}