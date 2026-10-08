const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf-8');

function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

const lines = content.split('\n');
let insideModel = false;
let currentModelName = '';

const modifiedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const modelMatch = line.match(/^model\s+([A-Za-z0-9_]+)\s*\{/);
    if (modelMatch) {
        insideModel = true;
        currentModelName = modelMatch[1];
        modifiedLines.push(line);
        continue;
    }
    
    if (insideModel && line.trim() === '}') {
        const snakeCaseName = toSnakeCase(currentModelName);
        modifiedLines.push(`  @@map("${snakeCaseName}")`);
        modifiedLines.push(line);
        insideModel = false;
        currentModelName = '';
        continue;
    }
    
    modifiedLines.push(line);
}

fs.writeFileSync(schemaPath, modifiedLines.join('\n'));
console.log('Schema updated successfully');
