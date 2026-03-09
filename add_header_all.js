// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

const fs = require('fs');
const path = require('path');

const commentLines = [
    'Owner: Manideep Reddy Eevuri',
    'GitHub: https://github.com/Maniredii',
    'LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/',
];

function getCommentPrefix(ext) {
    switch (ext) {
        case '.js':
        case '.jsx':
        case '.ts':
        case '.tsx':
            return '// ';
        case '.css':
        case '.scss':
            return '/* ';
        case '.html':
        case '.htm':
        case '.md':
            return '<!-- ';
        default:
            return null;
    }
}

function getCommentSuffix(ext) {
    switch (ext) {
        case '.js':
        case '.jsx':
        case '.ts':
        case '.tsx':
            return '';
        case '.css':
        case '.scss':
            return ' */\n';
        case '.html':
        case '.htm':
        case '.md':
            return ' -->\n';
        default:
            return '';
    }
}

function buildComment(ext) {
    const prefix = getCommentPrefix(ext);
    const suffix = getCommentSuffix(ext);
    if (!prefix) return null;
    const lines = commentLines.map(l => `${prefix}${l}${suffix.trimEnd()}`);
    return lines.join('\n') + '\n\n';
}

function prependComment(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const comment = buildComment(ext);
    if (!comment) return;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Owner: Manideep Reddy Eevuri')) return; // already added
    fs.writeFileSync(filePath, comment + content, 'utf8');
    console.log(`Updated ${filePath}`);
}

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules') continue;
            walk(fullPath);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            const supported = ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs', '.css', '.scss', '.html', '.htm', '.md'];
            if (supported.includes(ext)) {
                prependComment(fullPath);
            }
        }
    }
}

const projectRoot = path.resolve(__dirname);
walk(projectRoot);
