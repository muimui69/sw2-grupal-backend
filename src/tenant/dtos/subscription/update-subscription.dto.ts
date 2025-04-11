import { IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';

export class UpdateSubscriptionDto {
    @IsOptional()
    @IsEnum(SubscriptionPlanType)
    plan_type?: SubscriptionPlanType;

    @IsOptional()
    @IsDateString()
    end_date?: Date;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}