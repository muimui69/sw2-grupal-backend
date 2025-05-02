import { ArgumentMetadata, PipeTransform, Type } from '@nestjs/common';

export class OptionalFieldPipe implements PipeTransform {
    constructor(private readonly targetPipe: Type<PipeTransform>) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }

        const pipe = new this.targetPipe();
        return pipe.transform(value, metadata);
    }
}