import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { Request } from 'express';
import { Stripe } from 'stripe';
import { QueryCommonDTO } from 'src/common/dto/query-common.dto';
import { AuthSaasGuard } from 'src/auth/guards/auth-saas.guard';
import { SubscriptionCreateDTO } from '../dto/subscription/create-subscription.dto';

@Controller('subscription')
export class SubscriptionController {

    constructor(
        private readonly subscriptionService: SubscriptionService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async allSubscriptions(@Query() query: QueryCommonDTO) {
        const statusCode = HttpStatus.OK;
        const { limit, skip } = query;
        const [total, allSubscriptions] = await Promise.all([
            this.subscriptionService.countSubscriptions({}),
            this.subscriptionService.findAllSubscriptions({
                skip,
                take: limit,
            })
        ]);

        return {
            statusCode,
            message: "Listado de suscripciones",
            data: {
                total,
                subscriptions: allSubscriptions
            }
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.ACCEPTED)
    async findSubscription(@Param('id', ParseUUIDPipe) id: string) {
        const statusCode = HttpStatus.ACCEPTED;
        const subscription = await this.subscriptionService.findSubscriptionById(id, {
            select: {
                id: true,
                duration: true,
                price: true,
                plan_type: true,
            }
        });

        return {
            statusCode,
            message: `Suscripción con ID ${id} encontrada`,
            data: {
                subscription
            }
        };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthSaasGuard)
    async createSubscription(@Body() createdSubscription: SubscriptionCreateDTO, @Req() req: Request) {
        const statusCode = HttpStatus.CREATED;
        const userId = req.userId;
        const paymentSubscription = await this.subscriptionService.paymentSubscription({
            ...createdSubscription,
            userId
        });

        return {
            statusCode,
            message: "Procesando pago de suscripción",
            data: {
                paymentSubscription
            }
        };
    }

    @Post("webhook")
    @HttpCode(HttpStatus.OK)
    async webhookPaymentStripe(@Body() body: Stripe.CheckoutSessionCompletedEvent) {
        const statusCode = HttpStatus.OK;
        if (body.type !== 'checkout.session.completed') return;

        const metadata = body.data.object.metadata;
        if (!metadata) {
            console.error("Metadata no encontrada en el evento `checkout.session.completed`");
            throw new BadRequestException("La metadata es necesaria para procesar la suscripción");
        }

        const responseWebhook = await this.subscriptionService.webhookPayment(body.data.object.metadata);
        console.log(responseWebhook)
        return {
            statusCode,
            message: "Webhook de pago procesado correctamente",
            data: {
                responseWebhook
            }
        };
    }

}