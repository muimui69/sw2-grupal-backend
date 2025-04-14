import { v4 as uuid } from 'uuid';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Maneja los errores globales de la aplicación, detectando códigos específicos y lanzando excepciones adecuadas.
 * @param error - Error recibido desde cualquier servicio o base de datos.
 * @returns Nunca retorna (lanza una excepción).
 */
export const handleError = (error: any): never => {
  const logger = new Logger('GlobalErrorHandler');
  logger.error('Error capturado:', error);

  // Errores específicos de PostgreSQL (códigos de error comunes)
  if (error.code === '23505') throw new BadRequestException('Registro duplicado: ' + error.detail); // Unique constraint
  if (error.code === '23502') throw new BadRequestException('Campo requerido faltante: ' + error.detail); // Not null constraint

  // Errores específicos de servicios de terceros o integraciones
  if (error.code === 'EENVELOPE') throw new BadRequestException(error.response); // Ejemplo: Stripe o servicios externos
  if (error.response?.error === 'Unauthorized') throw new UnauthorizedException(error.response.message);
  if (error.response?.error === 'Bad Request') throw new BadRequestException(error.response.message);
  if (error.response?.error === 'Not Found') throw new NotFoundException(error.response.message);
  if (error.response?.error === 'Forbidden') throw new ForbiddenException(error.response.message);

  // Manejo de errores no controlados
  logger.error('Error no manejado:', error);
  throw new InternalServerErrorException('Error inesperado, revisa los logs para más detalles.');
};

/**
 * Estados del Pago en el sistema (ejemplo de suscripciones o tickets).
 */
export enum PayState {
  Pending = 1,
  Processing = 2,
  Paid = 3,
}

/**
 * Cambia el nombre del archivo al subirlo, agregando un identificador UUID al nombre.
 * @param req - Solicitud HTTP.
 * @param file - Archivo subido.
 * @param callback - Callback para retornar el nuevo nombre del archivo.
 */
export const fileChangeName = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const fileExtension = file.mimetype.split('/')[1];
  const newName = `${uuid()}.${fileExtension}`;
  callback(null, newName);
};