// tools/batch-login-token.js
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { launchBrowser } from '../core/browser/launchBrowser.js';

const INPUT_FILE = './data/via-token-raw.txt';
const SESSION_DIR = './sessions';

function decodeBase64IfEncoded(str) {
    try {
        const decoded = Buffer.from(str, 'base64').toString('utf-8');
        return decoded.includes('Mozilla') ? decoded : str;
    } catch {
        return str;
    }
}

function parseTokenLine(line) {
    const parts = line.split('|');
    const tokenRaw = parts.find(p => p.includes('c_user=') && p.includes('useragent='));
    const userAgentEncoded = tokenRaw?.match(/useragent=([^|\n]+)/)?.[1]?.trim();
    const cookieStr = tokenRaw?.replace(/useragent=.*$/, '').trim();

    if (!cookieStr || !userAgentEncoded) return null;

    const ua = decodeBase64IfEncoded(decodeURIComponent(userAgentEncoded));
    const cookies = cookieStr.split(';').map(entry => {
        const [name, ...valParts] = entry.trim().split('=');
        const value = valParts.join('=');
        if (!name || !value || name.toLowerCase() === 'useragent') return null;
        return {
            name,
            value,
            domain: '.facebook.com',
            path: '/',
            httpOnly: false,
            secure: true,
        };
    }).filter(Boolean);

    const c_user = cookies.find(c => c.name === 'c_user');
    return { cookies, userAgent: ua, id: c_user?.value };
}

const rl = readline.createInterface({
    input: fs.createReadStream(INPUT_FILE),
    crlfDelay: Infinity
});

let count = 0;

for await (const line of rl) {
    if (!line.includes('useragent=')) continue;

    try {
        const parsed = parseTokenLine(line);
        if (!parsed || !parsed.id) throw new Error('Token format invalid');
        const { cookies, userAgent, id } = parsed;

        const sessionPath = path.join(SESSION_DIR, `via-${id}.json`);
        console.log(`🔐 Login via token: ${id}`);

        const { browser, context } = await launchBrowser(null, userAgent);
        await context.addCookies(cookies);
        await context.storageState({ path: sessionPath });

        const page = await context.newPage();
        await page.goto('https://www.facebook.com');
        await page.waitForTimeout(5000);
        await browser.close();

        console.log(`✅ Saved session: ${sessionPath}`);
        count++;
    } catch (err) {
        console.error(`❌ Failed token line:`, err.message);
    }
}

console.log(`🎯 Hoàn tất: ${count} via đã login và lưu session.`);
