declare namespace Express {
    interface Request {
        userId: string;
        roleId: number;
        tenantId: string;
    }
}