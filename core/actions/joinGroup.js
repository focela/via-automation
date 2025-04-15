// core/actions/joinGroup.js

export async function joinGroup(page, max = 2) {
    console.log(`👥 Đang tìm và tham gia tối đa ${max} nhóm...`);
    try {
        await page.goto('https://www.facebook.com/groups', {
            timeout: 30000,
            waitUntil: 'domcontentloaded'
        });

        await page.waitForTimeout(3000);

        // Scroll xuống để load thêm group
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('PageDown');
            await page.waitForTimeout(1000);
        }

        // Dò tìm theo văn bản nút
        const joinButtons = await page.$$('div[role="button"]');

        let joined = 0;
        for (const btn of joinButtons) {
            const text = await btn.innerText().catch(() => '');
            if (!text.match(/Join Group|Tham gia nhóm/i)) continue;

            try {
                await btn.scrollIntoViewIfNeeded();
                await btn.click();
                console.log(`✅ Đã gửi yêu cầu tham gia nhóm (${joined + 1}/${max})`);
                joined++;
                await page.waitForTimeout(3000 + Math.random() * 3000);
                if (joined >= max) break;
            } catch (e) {
                console.warn('⚠️ Lỗi khi join group:', e.message);
                continue;
            }
        }

        if (joined === 0) {
            console.log('🤷 Không tìm thấy nhóm để tham gia.');
        }
    } catch (e) {
        console.error('❌ Lỗi khi thực hiện joinGroup:', e.message);
    }
}