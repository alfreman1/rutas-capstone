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
       // Controllers/UseCases
       replaceInFile(p, /'\.\.\/application\//g, "'../../application/");
       replaceInFile(p, /'\.\.\/\.\.\/application\//g, "'../../../application/");
       
       // Repositories
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/domain\//g, "'../../../../domain/");
       
       // Shared
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/shared\//g, "'../../../../shared/");
       
       // Exceptions
       replaceInFile(p, /'\.\.\/domain\/exceptions\/domain\.exception'/g, "'../../domain/exceptions/domain.exception'");
       
       replaceInFile(p, /'\.\.\/application\/dto\/paginated-result\.dto'/g, "'../../application/dto/paginated-result.dto'");
    }
  });
}
walk('./src');
