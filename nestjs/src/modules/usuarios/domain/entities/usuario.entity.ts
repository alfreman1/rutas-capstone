export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export class Usuario {
  constructor(
    public readonly id: string,
    public nombre: string,
    public email: string,
    public estado: EstadoUsuario,
    public readonly password?: string, // Opcional en el dominio al listar
    public roles?: string[],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  isActive(): boolean {
    return this.estado === EstadoUsuario.ACTIVO;
  }
}
