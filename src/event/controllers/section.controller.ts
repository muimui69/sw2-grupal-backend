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
import { SectionService } from '../services/section.service';
import { CreateSectionDto } from '../dto/section/create-section.dto';
import { UpdateSectionDto } from '../dto/section/update-section.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthTenantGuard } from 'src/auth/guards/auth-tenant.guard';
import { AuthSaasGuard } from 'src/auth/guards/auth-saas.guard';
import { EventExistsPipe } from 'src/common/pipes/entity-exists.pipe';
import { Event } from '../entities/event.entity';
import { IOptionPipe } from '../interfaces/params/option.pipe';
import { OptionalFieldPipe } from 'src/common/pipes/optional-field.pipe';

@Controller('section')
@UseGuards(AuthTenantGuard, AuthSaasGuard)
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }

    @Get()
    findAll(
        @Req() req: Request,
        @Query() paginationDto: PaginationDto
    ) {
        return this.sectionService.findAll(req.userId, req.memberTenantId, paginationDto);
    }

    @Get('event/:eventId')
    findAllSectionByEvent(
        @Param('eventId', ParseUUIDPipe) eventId: string,
        @Req() req: Request,
        @Query() paginationDto: PaginationDto
    ) {
        return this.sectionService.findAllSectionByEvent(eventId, req.userId, req.memberTenantId, paginationDto);
    }

    @Get(':id')
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        return this.sectionService.findOne(id, req.userId, req.memberTenantId);
    }

    @Post()
    create(
        @Body() createSectionDto: CreateSectionDto,
        @Body('eventId', EventExistsPipe) eventResult: IOptionPipe<Event>,
        @Req() req: Request
    ) {
        return this.sectionService.create(
            { ...createSectionDto, event: eventResult.entity },
            req.userId,
            req.memberTenantId
        );
    }

    @Patch(':id')
    patch(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateSectionDto: UpdateSectionDto,
        @Req() req: Request,
        @Body('eventId', new OptionalFieldPipe(EventExistsPipe)) eventResult?: IOptionPipe<Event>,
    ) {
        return this.sectionService.patch(id, { ...updateSectionDto, ...(eventResult ? { event: eventResult.entity } : {}) }, req.userId, req.memberTenantId);
    }

    @Delete(':id')
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request
    ) {
        return this.sectionService.remove(id, req.userId, req.memberTenantId);
    }

    @Get('statistics/:eventId')
    getSectionStatistics(
        @Param('eventId', ParseUUIDPipe) eventId: string,
        @Req() req: Request
    ) {
        return this.sectionService.getSectionStatistics(eventId, req.userId, req.memberTenantId);
    }
}