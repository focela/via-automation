// tools/filter-alive-via.js
import fs from 'fs';
import path from 'path';
import fullList from '../data/via-list.js';

const blacklistPath = './data/blacklist.json';
const outputPath = './data/via-alive.js';

let blacklist = [];
if (fs.existsSync(blacklistPath)) {
    try {
        blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf-8'));
    } catch {
        console.error('⚠️ Không đọc được blacklist.json');
        process.exit(1);
    }
}

const aliveList = fullList.filter(via => !blacklist.includes(via.id));

fs.writeFileSync(
    outputPath,
    `export default ${JSON.stringify(aliveList, null, 2)};
`
);

console.log(`✅ Đã tạo file via-alive.js với ${aliveList.length} via còn sống.`);

// ✅ Gợi ý: các file sử dụng viaList có thể import như sau:
// let viaList = fs.existsSync('./data/via-alive.js')
//   ? (await import('../data/via-alive.js')).default
//   : (await import('../data/via-list.js')).default;