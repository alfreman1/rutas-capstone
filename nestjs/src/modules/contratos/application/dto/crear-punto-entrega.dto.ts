import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsArray, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VentanaEntregaDto {
  @ApiProperty({ example: '2026-01-01T08:00:00Z' })
  @IsNotEmpty()
  horaInicio!: Date;

  @ApiProperty({ example: '2026-01-01T12:00:00Z' })
  @IsNotEmpty()
  horaFin!: Date;

  @ApiPropertyOptional({ example: 1, description: '1=Lunes, 7=Domingo' })
  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  diaSemana?: number;
}

export class CrearPuntoEntregaDto {
  @ApiProperty({ example: 'PE-001' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ example: 'Escuela Nacional 1' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({ example: 'Av. Principal 123' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ example: -20.61234 })
  @IsNumber()
  @IsNotEmpty()
  latitud!: number;

  @ApiProperty({ example: -64.91234 })
  @IsNumber()
  @IsNotEmpty()
  longitud!: number;

  @ApiPropertyOptional({ example: 15, description: 'Tiempo en minutos para descargar' })
  @IsInt()
  @IsOptional()
  tiempoServicioMinutos?: number;

  @ApiPropertyOptional({ type: [VentanaEntregaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentanaEntregaDto)
  @IsOptional()
  ventanas?: VentanaEntregaDto[];
}
