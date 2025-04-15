import fs from 'fs';
import path from 'path';

const SESSION_DIR = './sessions';
const OUTPUT_FILE = './data/via-list.js';
const PROXY_CONFIG_PATH = './data/proxies.json';
const USERAGENT_PATH = './data/useragents.json';

const files = fs.readdirSync(SESSION_DIR);
const viaList = [];

let proxies = {};
let userAgents = {};

if (fs.existsSync(PROXY_CONFIG_PATH)) {
    proxies = JSON.parse(fs.readFileSync(PROXY_CONFIG_PATH, 'utf-8'));
}
if (fs.existsSync(USERAGENT_PATH)) {
    userAgents = JSON.parse(fs.readFileSync(USERAGENT_PATH, 'utf-8'));
}

for (const file of files) {
    if (!file.startsWith('via-') || !file.endsWith('.json')) continue;

    const uid = file.replace('via-', '').replace('.json', '');
    const sessionPath = path.join(SESSION_DIR, file);

    viaList.push({
        id: `via-${uid}`,
        sessionPath: sessionPath.replace(/\\/g, '/'),
        proxy: proxies[uid] || null,
        userAgent: userAgents[uid] || ''
    });
}

const fileContent = `export default ${JSON.stringify(viaList, null, 2)};\n`;
fs.writeFileSync(OUTPUT_FILE, fileContent);
console.log(`✅ Đã tạo file via-list.js với ${viaList.length} via.`);
