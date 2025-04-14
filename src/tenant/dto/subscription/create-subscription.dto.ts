import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';
import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';

export class CreateSubscriptionDto {
    @IsNotEmpty()
    @IsString()
    tenant_id: string;

    @IsNotEmpty()
    @IsEnum(SubscriptionPlanType)
    plan_type: SubscriptionPlanType;

    @IsNotEmpty()
    @IsDateString()
    start_date: Date;

    @IsNotEmpty()
    @IsDateString()
    end_date: Date;
}