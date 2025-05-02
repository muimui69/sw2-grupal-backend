import { Injectable, BadRequestException, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, createApiResponse } from 'src/common/interfaces/response.interface';
import { AuditService } from 'src/audit/services/audit.service';
import { ActionType } from 'src/audit/entities/audit.entity';
import { handleError } from 'src/common/helpers/function-helper';
import { MemberTenantService } from 'src/tenant/services/member-tenant.service';
import { CreateEventDto } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';
import { validateImage } from 'src/utils/image-validator.util';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import { Faculty } from '../entities/faculty.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly memberTenantService: MemberTenantService,
    private readonly auditService: AuditService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  async findAll(userId: string, memberTenantId: string, paginationDto: PaginationDto): Promise<ApiResponse<Event[]>> {
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


      const skip = page ? (page - 1) * limit : offset;

      const queryBuilder = this.eventRepository.createQueryBuilder('event')
        .leftJoinAndSelect('event.faculty', 'faculty')
        .leftJoinAndSelect('event.sections', 'sections')
        .leftJoinAndSelect('event.tenant', 'tenant')
        .innerJoin('tenant.memberTenants', 'memberTenants', 'memberTenants.id = :memberTenantId', {
          memberTenantId: existMembertenant.data.id
        });

      if (search) {
        queryBuilder.andWhere(
          '(event.title ILIKE :search OR event.description ILIKE :search OR event.address ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      queryBuilder
        .orderBy(`event.${orderBy}`, order)
        .skip(skip)
        .take(limit);

      const [events, total] = await queryBuilder.getManyAndCount();

      await this.auditService.logAction(
        ActionType.VIEW,
        'Event',
        null,
        userId,
        events[0]?.tenantId || null,
        null,
        null
      );

      return createApiResponse(
        HttpStatus.OK,
        events,
        'Eventos obtenidos correctamente',
        undefined,
        { total, page: page || Math.floor(skip / limit) + 1, limit }
      );
    } catch (error) {
      throw handleError(error, {
        context: 'EventService.findAll',
        action: 'query',
        entityName: 'Event',
        additionalInfo: {
          message: 'Error al obtener eventos',
        },
      });
    }
  }

  async findOne(id: string, userId: string, memberTenantId: string): Promise<ApiResponse<Event>> {
    try {
      const event = await this.eventRepository.createQueryBuilder('event')
        .leftJoinAndSelect('event.faculty', 'faculty')
        .leftJoinAndSelect('event.sections', 'sections')
        .leftJoinAndSelect('event.identityVerifications', 'identityVerifications')
        .leftJoinAndSelect('event.tenant', 'tenant')
        .innerJoin('tenant.memberTenants', 'memberTenants', 'memberTenants.id = :memberTenantId', {
          memberTenantId
        })
        .where('event.id = :id', { id })
        .getOne();

      if (!event) {
        throw new NotFoundException(`Evento con ID ${id} no encontrado`);
      }

      await this.auditService.logAction(
        ActionType.VIEW,
        'Event',
        id,
        userId,
        event.tenantId,
        null,
        null
      );

      return createApiResponse(HttpStatus.OK, event, 'Evento obtenido correctamente');
    } catch (error) {
      throw handleError(error, {
        context: 'EventService.findOne',
        action: 'query',
        entityName: 'Event',
        entityId: id,
        additionalInfo: {
          message: 'Error al obtener evento',
        },
      });
    }
  }

  async create(createEventDto: CreateEventDto & { faculty: Faculty }, userId: string, memberTenantId: string): Promise<ApiResponse<Event>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { facultyId, file, ...eventDetails } = createEventDto;

      if (new Date(createEventDto.start_date) > new Date(createEventDto.end_date)) {
        throw new BadRequestException('La fecha de inicio no puede ser posterior a la fecha de fin');
      }

      const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
      if (!existMembertenant)
        throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

      const imageUrl = await this.processFile(file);

      const newEvent = this.eventRepository.create({
        ...eventDetails,
        tenantId: existMembertenant.data.id,
        tenant: existMembertenant.data.tenant,
        image_url: imageUrl || null,
      });

      const savedEvent = await this.eventRepository.save(newEvent);

      await this.auditService.logAction(
        ActionType.CREATE,
        'Event',
        savedEvent.id,
        userId,
        savedEvent.tenantId,
        null,
        savedEvent
      );
      return createApiResponse(HttpStatus.CREATED, savedEvent, 'Evento creado correctamente');
    } catch (error) {
      throw handleError(error, {
        context: 'EventService.create',
        action: 'create',
        entityName: 'Event',
        additionalInfo: {
          dto: { ...createEventDto, file: undefined, facultyId: undefined },
          message: 'Error al crear evento',
        }
      });
    }
  }

  async patch(id: string, updateEventDto: UpdateEventDto & { faculty?: Faculty }, userId: string, memberTenantId: string): Promise<ApiResponse<Event>> {
    try {
      const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
      if (!existMembertenant)
        throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

      const findEvent = await this.eventRepository.findOne({
        where: {
          id,
          tenantId: existMembertenant.data.tenantId
        },
        relations: ['faculty']
      });

      if (!findEvent) {
        throw new NotFoundException(`Evento con ID ${id} no encontrado`);
      }

      if (updateEventDto.start_date && updateEventDto.end_date) {
        if (new Date(updateEventDto.start_date) > new Date(updateEventDto.end_date)) {
          throw new BadRequestException('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
      } else if (updateEventDto.start_date && !updateEventDto.end_date) {
        if (new Date(updateEventDto.start_date) > new Date(findEvent.end_date)) {
          throw new BadRequestException('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
      } else if (!updateEventDto.start_date && updateEventDto.end_date) {
        if (new Date(findEvent.start_date) > new Date(updateEventDto.end_date)) {
          throw new BadRequestException('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { faculty: newFaculty, facultyId, file, ...eventDetails } = updateEventDto;

      let imageUrl = null;
      if (file) {
        imageUrl = await this.processFile(file);
      }

      const oldValues = { ...findEvent };

      const event = await this.eventRepository.preload({
        id,
        tenantId: existMembertenant.data.tenantId,
        ...eventDetails,
        ...(file ? { image_url: imageUrl } : {}),
        ...(newFaculty ? { faculty: newFaculty } : {}),
        updated_at: new Date()
      });

      if (!event) {
        throw new NotFoundException(`Evento con ID ${id} no encontrado`);
      }

      await this.eventRepository.save(event);

      const findUpdatedEvent = await this.eventRepository.findOne({
        where: { id },
        relations: ['faculty', 'sections']
      });

      await this.auditService.logAction(
        ActionType.UPDATE,
        'Event',
        id,
        existMembertenant.data.user.id,
        existMembertenant.data.tenant.id,
        oldValues,
        findUpdatedEvent
      );

      return createApiResponse(HttpStatus.OK, findUpdatedEvent, 'Evento actualizado correctamente');
    } catch (error) {
      throw handleError(error, {
        context: 'EventService.update',
        action: 'update',
        entityName: 'Event',
        entityId: id,
        additionalInfo: {
          dto: updateEventDto,
          message: 'Error al actualizar evento',
        }
      });
    }
  }

  async remove(id: string, userId: string, memberTenantId: string): Promise<ApiResponse<null>> {
    try {
      const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
      if (!existMembertenant)
        throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

      const event = await this.eventRepository.findOne({
        where: {
          id,
          tenantId: existMembertenant.data.tenant.id
        }
      });

      if (!event) {
        throw new NotFoundException(`Evento con ID ${id} no encontrado`);
      }

      const oldValues = { ...event };

      await this.eventRepository.update(id, {
        is_active: false,
        updated_at: new Date()
      });

      await this.auditService.logAction(
        ActionType.DELETE,
        'Event',
        id,
        existMembertenant.data.user.id,
        existMembertenant.data.tenant.id,
        oldValues,
        { is_active: false }
      );

      return createApiResponse(HttpStatus.OK, null, 'Evento desactivado correctamente');
    } catch (error) {
      throw handleError(error, {
        context: 'EventService.remove',
        action: 'soft-delete',
        entityName: 'Event',
        entityId: id,
        additionalInfo: {
          message: 'Error al desactivar evento',
        }
      });
    }
  }

  async findByFaculty(facultyId: string, userId: string, memberTenantId: string, paginationDto: PaginationDto): Promise<ApiResponse<Event[]>> {
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

      const queryBuilder = this.eventRepository.createQueryBuilder('event')
        .leftJoinAndSelect('event.sections', 'sections')
        .leftJoinAndSelect('event.tenant', 'tenant')
        .innerJoin('tenant.memberTenants', 'memberTenants', 'memberTenants.id = :memberTenantId', {
          memberTenantId: existMembertenant.data.id
        })
        .where('event.faculty.id = :facultyId', { facultyId })
        .andWhere('event.is_active = true');

      queryBuilder
        .orderBy(`event.${orderBy}`, order)
        .skip(skip)
        .take(limit);

      const [events, total] = await queryBuilder.getManyAndCount();

      await this.auditService.logAction(
        ActionType.VIEW,
        'Event',
        null,
        userId,
        events[0]?.tenantId || null,
        null,
        { facultyId }
      );

      return createApiResponse(
        HttpStatus.OK,
        events,
        'Eventos por facultad obtenidos correctamente',
        undefined,
        { total, page: page || Math.floor(skip / limit) + 1, limit }
      );
    } catch (error) {
      throw handleError(error, {
        context: 'EventService.findByFaculty',
        action: 'query',
        entityName: 'Event',
        additionalInfo: {
          facultyId,
          message: 'Error al obtener eventos por facultad',
        }
      });
    }
  }

  async getEventStatistics(memberTenantId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const existMembertenant = await this.memberTenantService.findOne(memberTenantId, userId);
      if (!existMembertenant)
        throw new NotFoundException(`Miembro inquilino con ID ${memberTenantId} no encontrado`);

      const tenantId = existMembertenant.data.tenantId;

      const totalEvents = await this.eventRepository.count({
        where: { tenantId, is_active: true }
      });

      const activeEvents = await this.eventRepository.count({
        where: {
          tenantId,
          is_active: true,
          end_date: new Date() // Eventos activos (que no han terminado)
        }
      });

      const upcomingEvents = await this.eventRepository.count({
        where: {
          tenantId,
          is_active: true,
          start_date: new Date() // Eventos próximos (que no han comenzado)
        }
      });

      // Consulta para eventos por mes (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const eventsByMonth = await this.eventRepository.createQueryBuilder('event')
        .select("TO_CHAR(event.start_date, 'YYYY-MM') as month")
        .addSelect('COUNT(event.id)', 'count')
        .where('event.tenantId = :tenantId', { tenantId })
        .andWhere('event.start_date >= :sixMonthsAgo', { sixMonthsAgo })
        .groupBy("TO_CHAR(event.start_date, 'YYYY-MM')")
        .orderBy("TO_CHAR(event.start_date, 'YYYY-MM')", 'ASC')
        .getRawMany();

      const statistics = {
        totalEvents,
        activeEvents,
        upcomingEvents,
        eventsByMonth
      };

      await this.auditService.logAction(
        ActionType.VIEW,
        'Event',
        null,
        userId,
        tenantId,
        null,
        { action: 'statistics' }
      );

      return createApiResponse(HttpStatus.OK, statistics, 'Estadísticas de eventos obtenidas correctamente');
    } catch (error) {
      throw handleError(error, {
        context: 'EventService.getEventStatistics',
        action: 'query',
        entityName: 'Event',
        additionalInfo: {
          memberTenantId,
          message: 'Error al obtener estadísticas de eventos',
        }
      });
    }
  }


  /**
   * Procesa un archivo opcional en el servicio
   */
  private async processFile(file?: Express.Multer.File): Promise<string | null> {
    if (!file) return null;

    const { isValid, error } = await validateImage(file);
    if (!isValid) throw new BadRequestException(error);

    const result = await this.cloudinaryService.uploadImage(file);
    return result.secure_url;
  }
}