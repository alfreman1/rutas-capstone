export class Contrato {
  constructor(
    public readonly id: string,
    public codigo: string,
    public nombre: string,
    public fechaInicio: Date,
    public estado: 'BORRADOR' | 'ACTIVO' | 'FINALIZADO' | 'CANCELADO',
    public descripcion?: string | null,
    public fechaFin?: Date | null,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  isActive(): boolean {
    return this.estado === 'ACTIVO';
  }
}
