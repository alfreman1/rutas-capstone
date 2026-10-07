import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearContratoDto {
  @ApiProperty({ example: 'C-001' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ example: 'Contrato Alimentación 2026' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({ example: 'Descripción detallada...' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
