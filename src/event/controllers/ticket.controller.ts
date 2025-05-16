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
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dto/ticket/create-ticket.dto';
import { UpdateTicketDto } from '../dto/ticket/update-ticket.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthTenantGuard } from 'src/auth/guards/auth-tenant.guard';
import { AuthSaasGuard } from 'src/auth/guards/auth-saas.guard';
import { SectionExistsPipe } from 'src/common/pipes/entity-exists.pipe';
import { Section } from '../entities/section.entity';
import { IOptionPipe } from '../interfaces/params/option.pipe';
import { TicketExistsPipe } from 'src/common/pipes/entity-exists.pipe';

@Controller('ticket')
@UseGuards(AuthTenantGuard, AuthSaasGuard)
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    @Get()
    findAll(
        @Req() req: Request,
        @Query() paginationDto: PaginationDto
    ) {
        return this.ticketService.findAll(req.userId, req.memberTenantId, paginationDto);
    }

    @Get('section/:sectionId')
    findBySection(
        @Param('sectionId', ParseUUIDPipe) sectionId: string,
        @Req() req: Request,
        @Query() paginationDto: PaginationDto
    ) {
        return this.ticketService.findBySection(sectionId, req.userId, req.memberTenantId, paginationDto);
    }

    @Get(':id')
    findOne(
        @Param('id', TicketExistsPipe) id: string,
        @Req() req: Request
    ) {
        return this.ticketService.findOne(id, req.userId, req.memberTenantId);
    }

    @Post()
    create(
        @Body() createTicketDto: CreateTicketDto,
        @Body('sectionId', SectionExistsPipe) sectionResult: IOptionPipe<Section>,
        @Req() req: Request
    ) {
        return this.ticketService.create(
            { ...createTicketDto, section: sectionResult.entity },
            req.userId,
            req.memberTenantId
        );
    }

    @Patch(':id')
    patch(
        @Param('id', TicketExistsPipe) id: string,
        @Body('sectionId', SectionExistsPipe) sectionResult: IOptionPipe<Section>,
        @Body() updateTicketDto: UpdateTicketDto,
        @Req() req: Request
    ) {
        return this.ticketService.patch(
            id,
            { ...updateTicketDto, section: sectionResult?.entity },
            req.userId,
            req.memberTenantId
        );
    }

    @Delete(':id')
    remove(
        @Param('id', TicketExistsPipe) id: string,
        @Req() req: Request
    ) {
        return this.ticketService.remove(id, req.userId, req.memberTenantId);
    }

    @Get('statistics/tenant')
    getTicketStatistics(@Req() req: Request) {
        return this.ticketService.getTicketStatistics(req.memberTenantId, req.userId);
    }
}