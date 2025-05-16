import { Injectable, BadRequestException, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { Section } from '../entities/section.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, createApiResponse } from 'src/common/interfaces/response.interface';
import { AuditService } from 'src/audit/services/audit.service';
import { ActionType } from 'src/audit/entities/audit.entity';
import { handleError } from 'src/common/helpers/function-helper';
import { MemberTenantService } from 'src/tenant/services/member-tenant.service';
import { CreateTicketDto } from '../dto/ticket/create-ticket.dto';
import { UpdateTicketDto } from '../dto/ticket/update-ticket.dto';

@Injectable()
export class TicketService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        private readonly memberTenantService: MemberTenantService,
        private readonly auditService: AuditService
    ) { }

    async findAll(userId: string, memberTenantId: string, paginationDto: PaginationDto): Promise<ApiResponse<Ticket[]>> {
        try {
            const {
                limit = 10,
                offset = 0,
                order = 'DESC',
                orderBy = 'created_at',
                page = 1
            } = paginationDto;

            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const skip = page ? (page - 1) * limit : offset;

            const queryBuilder = this.ticketRepository.createQueryBuilder('ticket')
                .leftJoinAndSelect('ticket.section', 'section')
                .leftJoinAndSelect('section.event', 'event')
                .where('ticket.tenantId = :tenantId', { tenantId: existMembertenant.data.tenantId })
                .andWhere('ticket.state = true');

            queryBuilder
                .orderBy(`ticket.${orderBy}`, order)
                .skip(skip)
                .take(limit);

            const [tickets, total] = await queryBuilder.getManyAndCount();

            await this.auditService.logAction(
                ActionType.VIEW,
                'Ticket',
                null,
                userId,
                existMembertenant.data.tenantId,
                null,
                null
            );

            return createApiResponse(
                HttpStatus.OK,
                tickets,
                'Tickets obtenidos correctamente',
                undefined,
                { total, page: page || Math.floor(skip / limit) + 1, limit }
            );
        } catch (error) {
            throw handleError(error, {
                context: 'TicketService.findAll',
                action: 'query',
                entityName: 'Ticket',
                additionalInfo: {
                    message: 'Error al obtener tickets',
                },
            });
        }
    }

    async findBySection(sectionId: string, userId: string, memberTenantId: string, paginationDto: PaginationDto): Promise<ApiResponse<Ticket[]>> {
        try {
            const {
                limit = 10,
                offset = 0,
                order = 'DESC',
                orderBy = 'created_at',
                page = 1
            } = paginationDto;

            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            // Verificar que la sección exista y pertenezca al inquilino
            const section = await this.sectionRepository.createQueryBuilder('section')
                .leftJoinAndSelect('section.event', 'event')
                .where('section.id = :sectionId', { sectionId })
                .andWhere('event.tenantId = :tenantId', { tenantId: existMembertenant.data.tenantId })
                .getOne();

            if (!section) {
                throw new NotFoundException(`Sección con ID ${sectionId} no encontrada o no accesible`);
            }

            const skip = page ? (page - 1) * limit : offset;

            const queryBuilder = this.ticketRepository.createQueryBuilder('ticket')
                .where('ticket.section = :sectionId', { sectionId })
                .andWhere('ticket.state = true');

            queryBuilder
                .orderBy(`ticket.${orderBy}`, order)
                .skip(skip)
                .take(limit);

            const [tickets, total] = await queryBuilder.getManyAndCount();

            await this.auditService.logAction(
                ActionType.VIEW,
                'Ticket',
                null,
                userId,
                existMembertenant.data.tenantId,
                null,
                { sectionId }
            );

            return createApiResponse(
                HttpStatus.OK,
                tickets,
                'Tickets por sección obtenidos correctamente',
                undefined,
                { total, page: page || Math.floor(skip / limit) + 1, limit }
            );
        } catch (error) {
            throw handleError(error, {
                context: 'TicketService.findBySection',
                action: 'query',
                entityName: 'Ticket',
                additionalInfo: {
                    sectionId,
                    message: 'Error al obtener tickets por sección',
                },
            });
        }
    }

    async findOne(id: string, userId: string, memberTenantId: string): Promise<ApiResponse<Ticket>> {
        try {
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const ticket = await this.ticketRepository.createQueryBuilder('ticket')
                .leftJoinAndSelect('ticket.section', 'section')
                .leftJoinAndSelect('section.event', 'event')
                .leftJoinAndSelect('ticket.ticketPurchases', 'ticketPurchases')
                .where('ticket.id = :id', { id })
                .andWhere('ticket.tenantId = :tenantId', { tenantId: existMembertenant.data.tenantId })
                .andWhere('ticket.state = true')
                .getOne();

            if (!ticket) {
                throw new NotFoundException(`Ticket con ID ${id} no encontrado o no accesible`);
            }

            await this.auditService.logAction(
                ActionType.VIEW,
                'Ticket',
                id,
                userId,
                existMembertenant.data.tenantId,
                null,
                null
            );

            return createApiResponse(HttpStatus.OK, ticket, 'Ticket obtenido correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'TicketService.findOne',
                action: 'query',
                entityName: 'Ticket',
                entityId: id,
                additionalInfo: {
                    message: 'Error al obtener ticket',
                },
            });
        }
    }

    async create(createTicketDto: CreateTicketDto & { section: Section }, userId: string, memberTenantId: string): Promise<ApiResponse<Ticket | Ticket[]>> {
        try {
            const { section, quantity = 1, ...ticketDetails } = createTicketDto;

            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            // Verificar que el inquilino tenga acceso a la sección a través del evento
            const sectionEntity = await this.sectionRepository.createQueryBuilder('section')
                .leftJoinAndSelect('section.event', 'event')
                .where('section.id = :sectionId', { sectionId: section.id })
                .andWhere('event.tenantId = :tenantId', { tenantId: existMembertenant.data.tenantId })
                .getOne();

            if (!sectionEntity) {
                throw new BadRequestException(`La sección con ID ${section.id} no existe o no es accesible`);
            }

            // Verificar precio
            if (ticketDetails.price < 0) {
                throw new BadRequestException('El precio no puede ser negativo');
            }

            // Verificar fecha
            if (new Date(ticketDetails.date) < new Date()) {
                throw new BadRequestException('La fecha del ticket no puede ser en el pasado');
            }

            // Si se solicita crear múltiples tickets
            if (quantity > 1) {
                const tickets: Ticket[] = [];

                for (let i = 0; i < quantity; i++) {
                    const newTicket = this.ticketRepository.create({
                        ...ticketDetails,
                        section,
                        tenantId: existMembertenant.data.tenantId,
                    });

                    tickets.push(newTicket);
                }

                const savedTickets = await this.ticketRepository.save(tickets);

                await this.auditService.logAction(
                    ActionType.CREATE,
                    'Ticket',
                    null,
                    userId,
                    existMembertenant.data.tenantId,
                    null,
                    { quantity, sectionId: section.id }
                );

                return createApiResponse(HttpStatus.CREATED, savedTickets, `${quantity} tickets creados correctamente`);
            } else {
                const newTicket = this.ticketRepository.create({
                    ...ticketDetails,
                    section,
                    tenantId: existMembertenant.data.tenantId,
                });

                const savedTicket = await this.ticketRepository.save(newTicket);

                await this.auditService.logAction(
                    ActionType.CREATE,
                    'Ticket',
                    savedTicket.id,
                    userId,
                    existMembertenant.data.tenantId,
                    null,
                    savedTicket
                );

                return createApiResponse(HttpStatus.CREATED, savedTicket, 'Ticket creado correctamente');
            }
        } catch (error) {
            throw handleError(error, {
                context: 'TicketService.create',
                action: 'create',
                entityName: 'Ticket',
                additionalInfo: {
                    dto: { ...createTicketDto, section: undefined },
                    message: 'Error al crear ticket(s)',
                }
            });
        }
    }

    async patch(id: string, updateTicketDto: UpdateTicketDto & { section?: Section }, userId: string, memberTenantId: string): Promise<ApiResponse<Ticket>> {
        try {
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const findTicket = await this.ticketRepository.findOne({
                where: {
                    id,
                    tenantId: existMembertenant.data.tenantId,
                    state: true
                },
                relations: ['section', 'section.event']
            });

            if (!findTicket) {
                throw new NotFoundException(`Ticket con ID ${id} no encontrado o no accesible`);
            }

            // Extraer propiedades
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { section: newSection, sectionId, ...ticketDetails } = updateTicketDto;

            // Si se está cambiando la sección, verificar la nueva sección
            if (newSection) {
                // Verificar que la nueva sección exista y pertenezca al inquilino
                const sectionEntity = await this.sectionRepository.createQueryBuilder('section')
                    .leftJoinAndSelect('section.event', 'event')
                    .where('section.id = :sectionId', { sectionId: newSection.id })
                    .andWhere('event.tenantId = :tenantId', { tenantId: existMembertenant.data.tenantId })
                    .getOne();

                if (!sectionEntity) {
                    throw new BadRequestException(`La sección con ID ${newSection.id} no existe o no es accesible`);
                }
            }

            // Verificar precio si se actualiza
            if (ticketDetails.price !== undefined && ticketDetails.price < 0) {
                throw new BadRequestException('El precio no puede ser negativo');
            }

            // Verificar fecha si se actualiza
            if (ticketDetails.date !== undefined && new Date(ticketDetails.date) < new Date()) {
                throw new BadRequestException('La fecha del ticket no puede ser en el pasado');
            }

            const oldValues = { ...findTicket };

            const ticket = await this.ticketRepository.preload({
                id,
                ...ticketDetails,
                section: newSection || findTicket.section,
                updated_at: new Date()
            });

            if (!ticket) {
                throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
            }

            await this.ticketRepository.save(ticket);

            const findUpdatedTicket = await this.ticketRepository.findOne({
                where: { id },
                relations: ['section', 'section.event']
            });

            await this.auditService.logAction(
                ActionType.UPDATE,
                'Ticket',
                id,
                userId,
                existMembertenant.data.tenantId,
                oldValues,
                findUpdatedTicket
            );

            return createApiResponse(HttpStatus.OK, findUpdatedTicket, 'Ticket actualizado correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'TicketService.patch',
                action: 'update',
                entityName: 'Ticket',
                entityId: id,
                additionalInfo: {
                    dto: { ...updateTicketDto, section: undefined },
                    message: 'Error al actualizar ticket',
                }
            });
        }
    }

    async remove(id: string, userId: string, memberTenantId: string): Promise<ApiResponse<null>> {
        try {
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const ticket = await this.ticketRepository.findOne({
                where: {
                    id,
                    tenantId: existMembertenant.data.tenantId,
                    state: true
                },
                relations: ['section', 'section.event', 'ticketPurchases']
            });

            if (!ticket) {
                throw new NotFoundException(`Ticket con ID ${id} no encontrado o no accesible`);
            }

            // Verificar si el ticket ya ha sido comprado
            if (ticket.ticketPurchases && ticket.ticketPurchases.length > 0) {
                throw new BadRequestException('No se puede eliminar un ticket que ya ha sido comprado');
            }

            const oldValues = { ...ticket };

            await this.ticketRepository.update(id, {
                state: false,
                updated_at: new Date()
            });

            await this.auditService.logAction(
                ActionType.DELETE,
                'Ticket',
                id,
                userId,
                existMembertenant.data.tenantId,
                oldValues,
                { state: false }
            );

            return createApiResponse(HttpStatus.OK, null, 'Ticket desactivado correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'TicketService.remove',
                action: 'soft-delete',
                entityName: 'Ticket',
                entityId: id,
                additionalInfo: {
                    message: 'Error al desactivar ticket',
                }
            });
        }
    }

    async getTicketStatistics(memberTenantId: string, userId: string): Promise<ApiResponse<any>> {
        try {
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const tenantId = existMembertenant.data.tenantId;

            const totalTickets = await this.ticketRepository.count({
                where: { tenantId, state: true }
            });

            // Tickets disponibles (no comprados)
            const availableTicketsResult = await this.ticketRepository.createQueryBuilder('ticket')
                .leftJoin('ticket.ticketPurchases', 'tp')
                .where('ticket.tenantId = :tenantId', { tenantId })
                .andWhere('ticket.state = true')
                .andWhere('tp.id IS NULL')
                .getCount();

            // Tickets vendidos (comprados)
            const soldTicketsResult = await this.ticketRepository.createQueryBuilder('ticket')
                .innerJoin('ticket.ticketPurchases', 'tp')
                .where('ticket.tenantId = :tenantId', { tenantId })
                .andWhere('ticket.state = true')
                .getCount();

            // Ingresos totales por tickets
            const revenueResult = await this.ticketRepository.createQueryBuilder('ticket')
                .innerJoin('ticket.ticketPurchases', 'tp')
                .select('SUM(ticket.price)', 'totalRevenue')
                .where('ticket.tenantId = :tenantId', { tenantId })
                .andWhere('ticket.state = true')
                .getRawOne();

            // Tickets por sección
            const ticketsBySectionResult = await this.ticketRepository.createQueryBuilder('ticket')
                .leftJoin('ticket.section', 'section')
                .select('section.id', 'sectionId')
                .addSelect('section.name', 'sectionName')
                .addSelect('COUNT(ticket.id)', 'ticketCount')
                .where('ticket.tenantId = :tenantId', { tenantId })
                .andWhere('ticket.state = true')
                .groupBy('section.id')
                .addGroupBy('section.name')
                .getRawMany();

            const statistics = {
                totalTickets,
                availableTickets: availableTicketsResult,
                soldTickets: soldTicketsResult,
                totalRevenue: revenueResult.totalRevenue || 0,
                ticketsBySection: ticketsBySectionResult,
            };

            await this.auditService.logAction(
                ActionType.VIEW,
                'Ticket',
                null,
                userId,
                tenantId,
                null,
                { action: 'statistics' }
            );

            return createApiResponse(HttpStatus.OK, statistics, 'Estadísticas de tickets obtenidas correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'TicketService.getTicketStatistics',
                action: 'query',
                entityName: 'Ticket',
                additionalInfo: {
                    memberTenantId,
                    message: 'Error al obtener estadísticas de tickets',
                }
            });
        }
    }
}