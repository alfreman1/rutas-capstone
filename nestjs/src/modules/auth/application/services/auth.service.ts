import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../usuarios/domain/repositories/usuario.repository';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: any) {
    const user = await this.usuarioRepository.buscarPorEmail(loginDto.email);
    
    if (!user || !user.isActive()) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const isPasswordValid = await argon2.verify(user.password!, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    
    return {
      accessToken: this.jwtService.sign(payload),
      // refreshToken logic could be here
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        roles: user.roles
      }
    };
  }
}
