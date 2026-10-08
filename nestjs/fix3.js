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
       // Shared paths
       replaceInFile(p, /'\.\.\/\.\.\/\.\.\/shared\//g, "'../../../../shared/");
       // ConsultarEstadoOptimizacion
       replaceInFile(p, /creadoAt/g, 'createdAt');
       replaceInFile(p, /completadoAt/g, 'finalizadoAt');
    }
  });
}
walk('./src');
