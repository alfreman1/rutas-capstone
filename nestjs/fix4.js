const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (regex.test(content)) {
    fs.writeFileSync(filePath, content.replace(regex, replacement));
    console.log('Fixed', filePath);
  }
}

// 1. pagination.helper import in controllers
const contratoController = 'src/modules/contratos/presentation/controllers/contrato.controller.ts';
replaceInFile(contratoController, /'\.\.\/\.\.\/\.\.\/\.\.\/shared\/presentation\/helpers\/pagination\.helper'/g, "'../../../../shared/helpers/pagination.helper'");

const vehiculoController = 'src/modules/vehiculos/presentation/controllers/vehiculo.controller.ts';
replaceInFile(vehiculoController, /'\.\.\/\.\.\/\.\.\/\.\.\/shared\/presentation\/helpers\/pagination\.helper'/g, "'../../../../shared/helpers/pagination.helper'");

// 2. listar-usuarios.use-case.ts cast
const listarUsuarios = 'src/modules/usuarios/application/use-cases/listar-usuarios.use-case.ts';
replaceInFile(listarUsuarios, /result\.data = result\.data\.map\((.*)\);/s, "result.data = result.data.map($1) as any;");

// 3. pagination.helper.ts
const paginationHelper = 'src/shared/helpers/pagination.helper.ts';
replaceInFile(paginationHelper, /'\.\.\/\.\.\/application\/dto\/paginated-result\.dto'/g, "'../application/dto/paginated-result.dto'");

// 4. roles.guard.ts
const rolesGuard = 'src/shared/presentation/guards/roles.guard.ts';
replaceInFile(rolesGuard, /'\.\.\/\.\.\/\.\.\/\.\.\/shared\/decorators\/auth\.decorator'/g, "'../../decorators/auth.decorator'");
