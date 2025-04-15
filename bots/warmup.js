// bots/warmup.js
import fs from 'fs';
import { launchBrowser } from '../core/browser/launchBrowser.js';
import { assignProxy } from '../core/proxy/assignProxy.js';
import { likeFeed } from '../core/actions/likeFeed.js';
import { scrollFeed } from '../core/actions/scrollFeed.js';
import { joinGroup } from '../core/actions/joinGroup.js';

let viaList = [];
if (fs.existsSync('./data/via-alive.js')) {
    viaList = (await import('../data/via-alive.js')).default;
    console.log('✅ Dùng danh sách via sống từ via-alive.js');
} else {
    viaList = (await import('../data/via-list.js')).default;
    console.log('⚠️ via-alive.js không tồn tại, dùng via-list.js');
}

(async () => {
    for (const via of viaList) {
        const sessionExists = fs.existsSync(via.sessionPath);
        if (!sessionExists) {
            console.warn(`⚠️ Session not found for ${via.id}, skipping...`);
            continue;
        }

        console.log(`🔥 Warmup: ${via.id}`);
        const proxy = assignProxy(via.proxy, false);
        const { browser, context } = await launchBrowser(proxy, via.userAgent, via.sessionPath);

        try {
            const page = await context.newPage();

            page.on('requestfailed', req => {
                const url = req.url();
                if (!url.startsWith('chrome-extension://') && !url.endsWith('.mp4')) {
                    console.warn('❌ Request failed:', url, req.failure());
                }
            });

            await page.goto('https://www.facebook.com/home.php', {
                timeout: 30000,
                waitUntil: 'domcontentloaded'
            });

            if (page.url().includes('login')) {
                console.warn(`🔒 Redirected to login → Session có thể die: ${via.id}`);
                await browser.close();
                continue;
            }

            await page.waitForTimeout(3000);

            console.log('🌐 Page URL:', page.url());
            console.log('📄 Page title:', await page.title());

            console.log(`✨ [${via.id}] Bắt đầu hành vi likeFeed...`);
            await likeFeed(page, 3);
            console.log(`✅ [${via.id}] Đã thực hiện xong likeFeed.`);

            console.log(`✨ [${via.id}] Bắt đầu hành vi scrollFeed...`);
            await scrollFeed(page, 5);
            console.log(`✅ [${via.id}] Đã thực hiện xong scrollFeed.`);

            console.log(`✨ [${via.id}] Bắt đầu hành vi joinGroup...`);
            await joinGroup(page, 2);
            console.log(`✅ [${via.id}] Đã thực hiện xong joinGroup.`);

            await page.waitForTimeout(2000);
        } catch (err) {
            console.error(`❌ Warmup failed for ${via.id}:`, err.message);
        }

        await browser.close();
    }
})();
