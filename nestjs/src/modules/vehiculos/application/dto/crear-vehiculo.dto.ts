import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoVehiculo {
  FURGON = 'FURGON',
  CAMION = 'CAMION',
  MOTO = 'MOTO',
  CAMIONETA = 'CAMIONETA',
}

export class CrearVehiculoDto {
  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  @IsNotEmpty()
  placa!: string;

  @ApiProperty({ example: 'V-001' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ enum: TipoVehiculo, example: 'FURGON' })
  @IsEnum(TipoVehiculo)
  @IsNotEmpty()
  tipo!: TipoVehiculo;

  @ApiProperty({ example: 3500.5 })
  @IsNumber()
  @IsNotEmpty()
  capacidadPesoKg!: number;

  @ApiProperty({ example: 15.2 })
  @IsNumber()
  @IsNotEmpty()
  capacidadVolumenM3!: number;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({ example: 'Dyna 2020' })
  @IsString()
  @IsOptional()
  modelo?: string;
}
