const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (regex.test(content)) {
    fs.writeFileSync(filePath, content.replace(regex, replacement));
    console.log('Fixed', filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) {
       // Revert from fix.js
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/application\//g, "'../../application/");
       
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/prisma\/prisma.service'/g, "'../../../../prisma/prisma.service'");
       
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/application\/services\/auth\.service'/g, "'../../application/services/auth.service'");
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/application\/dto\/login\.dto'/g, "'../../application/dto/login.dto'");
       
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/\.\.\/shared\/presentation\/helpers\/pagination\.helper'/g, "'../../../shared/presentation/helpers/pagination.helper'");
       
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/\.\.\/shared\/decorators\/auth\.decorator'/g, "'../../../shared/decorators/auth.decorator'");
       
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/application\/dto\/paginated-result\.dto'/g, "'../../application/dto/paginated-result.dto'");
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/application\/ports\/storage\.port'/g, "'../../application/ports/storage.port'");
       
       replaceInFile(p, /'\.\.\/usuarios\/domain\/repositories\/usuario\.repository'/g, "'../../usuarios/domain/repositories/usuario.repository'");
    }
  });
}
walk('./src');
