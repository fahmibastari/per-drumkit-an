import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const SOUNDS_DIR = path.join(PUBLIC_DIR, 'sounds');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sounds-manifest.json');

const getFiles = (dir) => {
    let results = {};
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results[file] = getFiles(filePath); // Recursive for nested folders (unlikely but good practice)
            // Actually, flattening it a bit might be easier for the UI
            // Let's refine structure: Category -> Array of Files
            const subFiles = fs.readdirSync(filePath).filter(f => f.endsWith('.wav'));
            results[file] = subFiles;
        }
    });
    return results;
}

try {
    console.log(`Scanning ${SOUNDS_DIR}...`);
    const manifest = getFiles(SOUNDS_DIR);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Manifest saved to ${OUTPUT_FILE}`);
} catch (err) {
    console.error('Error generating manifest:', err);
}
