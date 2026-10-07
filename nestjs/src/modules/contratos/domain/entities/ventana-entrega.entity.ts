export class VentanaEntrega {
  constructor(
    public id: string,
    public horaInicio: Date,
    public horaFin: Date,
    public estado: 'ACTIVO' | 'INACTIVO' = 'ACTIVO',
    public diaSemana?: number | null,
  ) {}

  esValida(): boolean {
    return this.horaFin > this.horaInicio;
  }
}
