export class Vehiculo {
  constructor(
    public readonly id: string,
    public placa: string,
    public codigo: string,
    public tipo: 'FURGON' | 'CAMION' | 'MOTO' | 'CAMIONETA',
    public capacidadPesoKg: number,
    public capacidadVolumenM3: number,
    public estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' = 'ACTIVO',
    public marca?: string | null,
    public modelo?: string | null,
  ) {}

  estaDisponible(): boolean {
    return this.estado === 'ACTIVO';
  }

  validarCapacidad(pesoRequerido: number, volumenRequerido: number): boolean {
    return this.capacidadPesoKg >= pesoRequerido && this.capacidadVolumenM3 >= volumenRequerido;
  }
}
