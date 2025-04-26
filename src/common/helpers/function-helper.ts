import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

interface ErrorDetails {
  context: string;
  action?: string;
  entityName?: string;
  entityId?: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Manejo de errores mejorado con soporte específico para TypeORM y PostgreSQL
 */
export const handleError = (error: any, details: ErrorDetails | string): never => {
  // Normalizar detalles
  const errorDetails = typeof details === 'string' ? { context: details } : details;
  const logger = new Logger(errorDetails.context);

  // Log estructurado
  const logData = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    query: error.query, // Para errores de TypeORM
    parameters: error.parameters, // Para errores de TypeORM
    ...errorDetails
  };

  logger.error(JSON.stringify(logData));

  // Errores específicos de PostgreSQL (códigos comunes)
  switch (error.code) {
    // Constraint violations
    case '23505': throw new ConflictException(`Registro duplicado: ${extractConstraintDetail(error)}`);
    case '23502': throw new BadRequestException(`Campo requerido faltante: ${extractConstraintDetail(error)}`);
    case '23503': throw new BadRequestException(`Violación de integridad referencial: ${extractConstraintDetail(error)}`);
    case '23514': throw new BadRequestException(`Violación de regla de validación: ${extractConstraintDetail(error)}`);

    // Privilegios y autenticación
    case '28000':
    case '28P01': throw new UnauthorizedException('Error de autenticación');
    case '42501': throw new ForbiddenException('Privilegios insuficientes');

    // Errores de TypeORM
    case 'EntityNotFound': throw new NotFoundException(`${errorDetails.entityName || 'Entidad'} no encontrada`);
  }

  // Casos específicos por tipo de error
  if (error instanceof NotFoundException) throw error;
  if (error instanceof BadRequestException) throw error;
  if (error instanceof UnauthorizedException) throw error;
  if (error instanceof ForbiddenException) throw error;
  if (error instanceof ConflictException) throw error;

  // Error genérico
  throw new InternalServerErrorException(
    'Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.',
    { cause: error }
  );
};

// Función para extraer detalles de restricciones de PostgreSQL
function extractConstraintDetail(error: any): string {
  if (error.detail) return error.detail;
  if (error.parameters?.length) return `Valores: ${error.parameters.join(', ')}`;
  return 'Detalles no disponibles';
}