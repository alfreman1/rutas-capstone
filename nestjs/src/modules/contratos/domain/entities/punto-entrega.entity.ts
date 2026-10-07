import { VentanaEntrega } from './ventana-entrega.entity';

export class PuntoEntrega {
  constructor(
    public readonly id: string,
    public contratoId: string,
    public codigo: string,
    public nombre: string,
    public latitud: number,
    public longitud: number,
    public tiempoServicioMinutos: number,
    public estado: 'ACTIVO' | 'INACTIVO',
    public ventanas: VentanaEntrega[] = [],
    public direccion?: string | null,
  ) {}

  agregarVentana(ventana: VentanaEntrega) {
    if (!ventana.esValida()) {
      throw new Error('La ventana de entrega no es válida (horaFin debe ser mayor a horaInicio)');
    }
    this.ventanas.push(ventana);
  }
}
