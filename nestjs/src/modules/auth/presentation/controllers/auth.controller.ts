import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from '../application/services/auth.service';
import { Public } from '../../../shared/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../application/dto/login.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil actual' })
  getProfile(@Request() req: any) {
    return req.user;
  }
}
