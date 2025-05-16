import { Injectable, BadRequestException, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';
import { Event } from '../entities/event.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, createApiResponse } from 'src/common/interfaces/response.interface';
import { AuditService } from 'src/audit/services/audit.service';
import { ActionType } from 'src/audit/entities/audit.entity';
import { handleError } from 'src/common/helpers/function-helper';
import { MemberTenantService } from 'src/tenant/services/member-tenant.service';
import { CreateSectionDto } from '../dto/section/create-section.dto';
import { UpdateSectionDto } from '../dto/section/update-section.dto';

@Injectable()
export class SectionService {
    constructor(
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        private readonly memberTenantService: MemberTenantService,
        private readonly auditService: AuditService
    ) { }


    async findAll(userId: string, memberTenantId: string, paginationDto: PaginationDto): Promise<ApiResponse<Section[]>> {
        try {
            const {
                limit = 10,
                offset = 0,
                search = '',
                order = 'DESC',
                orderBy = 'created_at',
                page = 1
            } = paginationDto;

            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant) {
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);
            }

            const skip = page ? (page - 1) * limit : offset;

            const queryBuilder = this.sectionRepository.createQueryBuilder('section')
                .leftJoinAndSelect('section.tenant', 'tenant')
                .where('section.tenantId = :tenantId', { tenantId: existMembertenant.data.tenantId });

            if (search) {
                queryBuilder.andWhere(
                    '(section.name ILIKE :search OR section.description ILIKE :search)',
                    { search: `%${search}%` }
                );
            }

            queryBuilder
                .orderBy(`section.${orderBy}`, order)
                .skip(skip)
                .take(limit);

            const [sections, total] = await queryBuilder.getManyAndCount();

            await this.auditService.logAction(
                ActionType.VIEW,
                'Section',
                null,
                userId,
                existMembertenant.data.tenantId,
                null,
                null
            );

            return createApiResponse(
                HttpStatus.OK,
                sections,
                'Secciones obtenidas correctamente',
                undefined,
                { total, page: page || Math.floor(skip / limit) + 1, limit }
            );
        } catch (error) {
            throw handleError(error, {
                context: 'SectionService.findAll',
                action: 'query',
                entityName: 'Section',
                additionalInfo: {
                    message: 'Error al obtener secciones',
                },
            });
        }
    }

    async findAllSectionByEvent(eventId: string, userId: string, memberTenantId: string, paginationDto: PaginationDto): Promise<ApiResponse<Section[]>> {
        try {
            const {
                limit = 10,
                offset = 0,
                search = '',
                order = 'DESC',
                orderBy = 'created_at',
                page = 1
            } = paginationDto;

            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const event = await this.eventRepository.findOne({
                where: {
                    id: eventId,
                    is_active: true,
                    tenantId: existMembertenant.data.tenantId
                }
            });

            if (!event) {
                throw new NotFoundException(`Evento con ID ${eventId} no encontrado o no accesible`);
            }

            const skip = page ? (page - 1) * limit : offset;

            const queryBuilder = this.sectionRepository.createQueryBuilder('section')
                .leftJoinAndSelect('section.event', 'event')
                .leftJoinAndSelect('section.tickets', 'tickets')
                .where('section.eventId = :eventId', { eventId })
                .andWhere('section.is_active = true');

            if (search) {
                queryBuilder.andWhere(
                    '(section.name ILIKE :search OR section.description ILIKE :search)',
                    { search: `%${search}%` }
                );
            }

            queryBuilder
                .orderBy(`section.${orderBy}`, order)
                .skip(skip)
                .take(limit);

            const [sections, total] = await queryBuilder.getManyAndCount();

            await this.auditService.logAction(
                ActionType.VIEW,
                'Section',
                null,
                userId,
                event.tenantId,
                null,
                { eventId }
            );

            return createApiResponse(
                HttpStatus.OK,
                sections,
                'Secciones obtenidas correctamente',
                undefined,
                { total, page: page || Math.floor(skip / limit) + 1, limit }
            );
        } catch (error) {
            throw handleError(error, {
                context: 'SectionService.findAllSectionByEvent',
                action: 'query',
                entityName: 'Section',
                additionalInfo: {
                    eventId,
                    message: 'Error al obtener secciones',
                },
            });
        }
    }

    async findOne(id: string, userId: string, memberTenantId: string): Promise<ApiResponse<Section>> {
        try {
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const section = await this.sectionRepository.createQueryBuilder('section')
                .leftJoinAndSelect('section.event', 'event')
                .leftJoinAndSelect('section.tickets', 'tickets')
                .where('section.id = :id', { id })
                .andWhere('section.is_active = true')
                .getOne();

            if (!section) {
                throw new NotFoundException(`Sección con ID ${id} no encontrada`);
            }

            const event = await this.eventRepository.findOne({
                where: {
                    id: section.event.id,
                    tenantId: existMembertenant.data.tenantId
                }
            });

            if (!event) {
                throw new NotFoundException(`Sección con ID ${id} no accesible para este inquilino`);
            }

            await this.auditService.logAction(
                ActionType.VIEW,
                'Section',
                id,
                userId,
                event.tenantId,
                null,
                null
            );

            return createApiResponse(HttpStatus.OK, section, 'Sección obtenida correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'SectionService.findOne',
                action: 'query',
                entityName: 'Section',
                entityId: id,
                additionalInfo: {
                    message: 'Error al obtener sección',
                },
            });
        }
    }

    async create(createSectionDto: CreateSectionDto & { event: Event }, userId: string, memberTenantId: string): Promise<ApiResponse<Section>> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { event, eventId, ...sectionDetails } = createSectionDto;

            if (!eventId || !event)
                throw new BadRequestException('El evento es obligatorio para crear una sección');

            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            if (event.tenantId !== existMembertenant.data.tenantId) {
                throw new BadRequestException('No tienes permiso para crear secciones en este evento');
            }

            if (sectionDetails.capacity < 0) {
                throw new BadRequestException('La capacidad no puede ser negativa');
            }

            if (sectionDetails.price < 0) {
                throw new BadRequestException('El precio no puede ser negativo');
            }

            const newSection = this.sectionRepository.create({
                ...sectionDetails,
                tenantId: existMembertenant.data.id,
                tenant: existMembertenant.data.tenant,
                event: event
            });

            const savedSection = await this.sectionRepository.save(newSection);

            await this.auditService.logAction(
                ActionType.CREATE,
                'Section',
                savedSection.id,
                userId,
                event.tenantId,
                null,
                savedSection
            );

            return createApiResponse(HttpStatus.CREATED, savedSection, 'Sección creada correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'SectionService.create',
                action: 'create',
                entityName: 'Section',
                additionalInfo: {
                    dto: { ...createSectionDto, event: undefined, eventId: undefined },
                    message: 'Error al crear sección',
                }
            });
        }
    }

    async patch(id: string, updateSectionDto: UpdateSectionDto, userId: string, memberTenantId: string): Promise<ApiResponse<Section>> {
        try {
            // Verificar memberTenant
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const tenantId = existMembertenant.data.tenantId;

            // Buscar la sección actual
            const findSection = await this.sectionRepository.findOne({
                where: { id, is_active: true },
                relations: ['event']
            });

            if (!findSection) {
                throw new NotFoundException(`Sección con ID ${id} no encontrada`);
            }

            // Verificar que el evento pertenece al tenant
            const event = await this.eventRepository.findOne({
                where: {
                    id: findSection.event.id,
                    tenantId
                }
            });

            if (!event) {
                throw new NotFoundException(`Sección con ID ${id} no accesible para este inquilino`);
            }

            // Verificar evento nuevo si se proporciona eventId
            let targetEvent = event;
            if (updateSectionDto.eventId) {
                const newEvent = await this.eventRepository.findOne({
                    where: {
                        id: updateSectionDto.eventId,
                        tenantId
                    }
                });

                if (!newEvent) {
                    throw new BadRequestException(`Evento con ID ${updateSectionDto.eventId} no encontrado o no pertenece a este inquilino`);
                }

                targetEvent = newEvent;
            }

            // Validaciones de los campos de la sección
            if (updateSectionDto.capacity !== undefined && updateSectionDto.capacity < 0) {
                throw new BadRequestException('La capacidad no puede ser negativa');
            }

            if (updateSectionDto.price !== undefined && updateSectionDto.price < 0) {
                throw new BadRequestException('El precio no puede ser negativo');
            }


            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { eventId, ...sectionDetails } = updateSectionDto;

            // Guardar valores antiguos para auditoría
            const oldValues = { ...findSection };

            // Precargar la entidad con los cambios
            const section = await this.sectionRepository.preload({
                id,
                tenantId,
                ...sectionDetails,
                ...(targetEvent !== event ? { event: targetEvent } : {}),
                updated_at: new Date()
            });

            if (!section) {
                throw new NotFoundException(`Sección con ID ${id} no encontrada`);
            }

            await this.sectionRepository.save(section);

            // Recuperar la sección actualizada con relaciones
            const findUpdatedSection = await this.sectionRepository.findOne({
                where: { id },
                relations: ['event', 'tickets']
            });

            // Registrar acción de auditoría
            await this.auditService.logAction(
                ActionType.UPDATE,
                'Section',
                id,
                userId,
                targetEvent.tenantId,
                oldValues,
                findUpdatedSection
            );

            return createApiResponse(HttpStatus.OK, findUpdatedSection, 'Sección actualizada correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'SectionService.patch',
                action: 'update',
                entityName: 'Section',
                entityId: id,
                additionalInfo: {
                    dto: updateSectionDto,
                    message: 'Error al actualizar sección',
                }
            });
        }
    }

    async remove(id: string, userId: string, memberTenantId: string): Promise<ApiResponse<null>> {
        try {
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const section = await this.sectionRepository.findOne({
                where: { id, is_active: true },
                relations: ['event']
            });

            if (!section) {
                throw new NotFoundException(`Sección con ID ${id} no encontrada`);
            }

            const event = await this.eventRepository.findOne({
                where: {
                    id: section.event.id,
                    tenantId: existMembertenant.data.tenantId
                }
            });

            if (!event) {
                throw new NotFoundException(`Sección con ID ${id} no accesible para este inquilino`);
            }

            const oldValues = { ...section };

            await this.sectionRepository.update(id, {
                is_active: false,
                updated_at: new Date()
            });

            await this.auditService.logAction(
                ActionType.DELETE,
                'Section',
                id,
                userId,
                event.tenantId,
                oldValues,
                { is_active: false }
            );

            return createApiResponse(HttpStatus.OK, null, 'Sección desactivada correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'SectionService.remove',
                action: 'soft-delete',
                entityName: 'Section',
                entityId: id,
                additionalInfo: {
                    message: 'Error al desactivar sección',
                }
            });
        }
    }

    async getSectionStatistics(eventId: string, userId: string, memberTenantId: string): Promise<ApiResponse<any>> {
        try {
            const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
            if (!existMembertenant)
                throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

            const event = await this.eventRepository.findOne({
                where: {
                    id: eventId,
                    tenantId: existMembertenant.data.tenantId,
                    is_active: true
                }
            });

            if (!event) {
                throw new NotFoundException(`Evento con ID ${eventId} no encontrado o no accesible`);
            }

            const totalSections = await this.sectionRepository.count({
                where: { id: eventId, is_active: true }
            });

            const capacityResult = await this.sectionRepository.createQueryBuilder('section')
                .select('SUM(section.capacity)', 'totalCapacity')
                .where('section.eventId = :eventId', { eventId })
                .andWhere('section.is_active = true')
                .getRawOne();

            const totalCapacity = capacityResult.totalCapacity || 0;

            const priceResult = await this.sectionRepository.createQueryBuilder('section')
                .select('AVG(section.price)', 'averagePrice')
                .where('section.eventId = :eventId', { eventId })
                .andWhere('section.is_active = true')
                .getRawOne();

            const averagePrice = priceResult.averagePrice || 0;

            const sectionsByCapacity = await this.sectionRepository.createQueryBuilder('section')
                .select('section.name', 'name')
                .addSelect('section.capacity', 'capacity')
                .where('section.eventId = :eventId', { eventId })
                .andWhere('section.is_active = true')
                .orderBy('section.capacity', 'DESC')
                .getRawMany();

            const statistics = {
                totalSections,
                totalCapacity,
                averagePrice,
                sectionsByCapacity
            };

            await this.auditService.logAction(
                ActionType.VIEW,
                'Section',
                null,
                userId,
                event.tenantId,
                null,
                { action: 'statistics', eventId }
            );

            return createApiResponse(HttpStatus.OK, statistics, 'Estadísticas de secciones obtenidas correctamente');
        } catch (error) {
            throw handleError(error, {
                context: 'SectionService.getSectionStatistics',
                action: 'query',
                entityName: 'Section',
                additionalInfo: {
                    eventId,
                    memberTenantId,
                    message: 'Error al obtener estadísticas de secciones',
                }
            });
        }
    }
}