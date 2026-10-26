import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'maria@gmail.com' })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'MinhaSenha@2026',
        writeOnly: true,
    })
    @IsString()
    senha!: string;
}
