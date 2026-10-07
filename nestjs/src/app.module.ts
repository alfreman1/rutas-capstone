import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuariosModule } from '../modules/usuarios/usuarios.module';
import { AuthModule } from '../modules/auth/auth.module';
import { PlanificacionesModule } from '../modules/planificaciones/planificaciones.module';
import { ContratosModule } from '../modules/contratos/contratos.module';
import { VehiculosModule } from '../modules/vehiculos/vehiculos.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../shared/presentation/guards/roles.guard';
import { STORAGE_PORT } from '../shared/application/ports/storage.port';
import { LocalStorageAdapter } from '../shared/infrastructure/storage/local-storage.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    UsuariosModule,
    AuthModule,
    PlanificacionesModule,
    ContratosModule,
    VehiculosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: STORAGE_PORT,
      useClass: LocalStorageAdapter,
    },
  ],
})
export class AppModule {}
