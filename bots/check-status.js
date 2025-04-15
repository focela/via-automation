// bots/check-status.js
import fs from 'fs';
import path from 'path';
import viaList from '../data/via-list.js';
import { launchBrowser } from '../core/browser/launchBrowser.js';
import { assignProxy } from '../core/proxy/assignProxy.js';

const blacklistPath = './data/blacklist.json';
let blacklist = [];
if (fs.existsSync(blacklistPath)) {
    try {
        blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf-8'));
    } catch {
        blacklist = [];
    }
}

(async () => {
    for (const via of viaList) {
        if (!fs.existsSync(via.sessionPath)) {
            console.warn(`⚠️ Không tìm thấy session: ${via.id}`);
            continue;
        }

        if (blacklist.includes(via.id)) {
            console.log(`⏭️ Bỏ qua ${via.id} (đã trong blacklist)`);
            continue;
        }

        console.log(`🔍 Kiểm tra trạng thái: ${via.id}`);
        const proxy = assignProxy(via.proxy, false);
        const { browser, context } = await launchBrowser(proxy, via.userAgent, via.sessionPath);

        try {
            const page = await context.newPage();
            await page.goto('https://www.facebook.com/home.php', {
                timeout: 20000,
                waitUntil: 'domcontentloaded'
            });
            await page.waitForTimeout(2000);

            if (page.url().includes('login')) {
                console.warn(`🔒 ${via.id} bị văng về login → đưa vào blacklist.`);
                blacklist.push(via.id);
            } else {
                console.log(`✅ ${via.id} vẫn đang hoạt động.`);
            }
        } catch (err) {
            console.error(`❌ Lỗi khi kiểm tra ${via.id}:`, err.message);
            blacklist.push(via.id);
        }

        await browser.close();
    }

    fs.writeFileSync(blacklistPath, JSON.stringify([...new Set(blacklist)], null, 2));
    console.log('📦 Đã cập nhật blacklist.json');
})();
