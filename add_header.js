// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

const fs = require('fs');
const path = require('path');

const comment = `// Owner: Manideep Reddy Eevuri\n// GitHub: https://github.com/Maniredii\n// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/\n\n`;

function prependComment(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.startsWith('// Owner:')) {
        fs.writeFileSync(filePath, comment + content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // skip node_modules
            if (entry.name === 'node_modules') continue;
            walk(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.js')) {
            prependComment(fullPath);
        }
    }
}

const projectRoot = path.resolve(__dirname);
walk(projectRoot);
