import { Exclude, Expose, Type } from 'class-transformer';
import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';
import { TenantResponseDto } from '../tenant/tenant-response.dto';

@Exclude()
export class SubscriptionResponseDto {
    @Expose()
    id: string;

    @Expose()
    plan_type: SubscriptionPlanType;

    @Expose()
    start_date: Date;

    @Expose()
    end_date: Date;

    @Expose()
    active: boolean;

    @Expose()
    created_at: Date;

    @Expose()
    @Type(() => TenantResponseDto)
    tenant: TenantResponseDto;
}