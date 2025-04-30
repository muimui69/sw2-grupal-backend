import { BadRequestException, ConflictException, ForbiddenException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import chalk from 'chalk';

// Define la estructura de los metadatos de error
export interface ErrorMetadata {
  context: string;
  action?: string;
  entityName?: string;
  entityId?: string;
  additionalInfo?: any;
}

/**
 * Maneja errores de forma consistente a través de la aplicación
 * @param error El error original
 * @param metadata Metadatos adicionales para el contexto del error
 * @returns Una excepción de NestJS con formato consistente
 */
export function handleError(error: any, metadata: ErrorMetadata) {
  const logger = new Logger(metadata.context);

  // Extraer mensaje y datos relevantes
  const errorMessage = error?.message || 'Error desconocido';
  const statusCode = error?.status || 500;
  const stackLines = error?.stack?.split('\n') || [];

  // Formateo bonito para la consola
  console.error('\n');
  console.error(chalk.red('╔════════════════════════════════════════════════════════════════════════════╗'));
  console.error(chalk.red('║ ') + chalk.bold.red('ERROR DETECTADO') + chalk.red(' '.repeat(59) + '║'));
  console.error(chalk.red('╠════════════════════════════════════════════════════════════════════════════╣'));
  console.error(chalk.red('║ ') + chalk.yellow('Contexto:   ') + chalk.white(metadata.context.padEnd(55)) + chalk.red('║'));

  if (metadata.action) {
    console.error(chalk.red('║ ') + chalk.yellow('Acción:     ') + chalk.white(metadata.action.padEnd(55)) + chalk.red('║'));
  }

  if (metadata.entityName) {
    console.error(chalk.red('║ ') + chalk.yellow('Entidad:    ') + chalk.white(metadata.entityName.padEnd(55)) + chalk.red('║'));
  }

  if (metadata.entityId) {
    console.error(chalk.red('║ ') + chalk.yellow('ID:         ') + chalk.white(metadata.entityId.padEnd(55)) + chalk.red('║'));
  }

  console.error(chalk.red('║ ') + chalk.yellow('Mensaje:    ') + chalk.white(errorMessage.substring(0, 55).padEnd(55)) + chalk.red('║'));

  if (errorMessage.length > 55) {
    const chunks = chunkString(errorMessage.substring(55), 70);
    chunks.forEach(chunk => {
      console.error(chalk.red('║ ') + chalk.white(chunk.padEnd(70)) + chalk.red('║'));
    });
  }

  console.error(chalk.red('╠════════════════════════════════════════════════════════════════════════════╣'));
  console.error(chalk.red('║ ') + chalk.bold.white('Stack Trace (resumido):') + chalk.red(' '.repeat(46) + '║'));

  // Mostrar solo las primeras 3 líneas del stack para no saturar
  stackLines.slice(0, 3).forEach(line => {
    const cleanLine = line.trim();
    const chunks = chunkString(cleanLine, 70);
    chunks.forEach(chunk => {
      console.error(chalk.red('║ ') + chalk.gray(chunk.padEnd(70)) + chalk.red('║'));
    });
  });

  if (stackLines.length > 3) {
    console.error(chalk.red('║ ') + chalk.gray('... y más líneas no mostradas (ver logs detallados)'.padEnd(70)) + chalk.red('║'));
  }

  // Si hay información adicional, mostrarla
  if (metadata.additionalInfo) {
    console.error(chalk.red('╠════════════════════════════════════════════════════════════════════════════╣'));
    console.error(chalk.red('║ ') + chalk.bold.white('Información adicional:') + chalk.red(' '.repeat(47) + '║'));
    const infoStr = JSON.stringify(metadata.additionalInfo, null, 2);
    const infoLines = infoStr.split('\n');
    infoLines.slice(0, 5).forEach(line => {
      const chunks = chunkString(line, 70);
      chunks.forEach(chunk => {
        console.error(chalk.red('║ ') + chalk.cyan(chunk.padEnd(70)) + chalk.red('║'));
      });
    });

    if (infoLines.length > 5) {
      console.error(chalk.red('║ ') + chalk.cyan('... más información no mostrada'.padEnd(70)) + chalk.red('║'));
    }
  }

  console.error(chalk.red('╚════════════════════════════════════════════════════════════════════════════╝'));
  console.error('\n');

  // Registrar en el logger para tener el error completo en los logs
  logger.error({
    message: errorMessage,
    stack: error?.stack,
    context: metadata.context,
    action: metadata.action,
    entityName: metadata.entityName,
    entityId: metadata.entityId,
    additionalInfo: metadata.additionalInfo
  });

  // Devolver la excepción apropiada basada en el tipo de error
  if (error instanceof NotFoundException || statusCode === 404) {
    return error;
  }

  if (error instanceof BadRequestException || statusCode === 400) {
    return error;
  }

  if (error instanceof UnauthorizedException || statusCode === 401) {
    return error;
  }

  if (error instanceof ForbiddenException || statusCode === 403) {
    return error;
  }

  if (error instanceof ConflictException || statusCode === 409) {
    return error;
  }

  // Por defecto, lanzamos un error interno del servidor
  return new InternalServerErrorException(
    {
      message: errorMessage,
      context: metadata.context,
      action: metadata.action,
      entityName: metadata.entityName
    },
    'Ha ocurrido un error interno. Por favor, inténtelo de nuevo más tarde.'
  );
}

/**
 * Divide una cadena en trozos de tamaño específico
 */
function chunkString(str: string, length: number): string[] {
  const chunks = [];
  let i = 0;
  while (i < str.length) {
    chunks.push(str.substring(i, i + length));
    i += length;
  }
  return chunks;
}