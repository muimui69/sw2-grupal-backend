import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTicketDto {
    @IsNotEmpty()
    @IsUUID()
    sectionId: string;

    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    date: Date;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number = 1;
}