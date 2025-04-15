// core/actions/scrollFeed.js

export async function scrollFeed(page, times = 5) {
    console.log(`↕️ Scrolling feed ${times} lần...`);
    try {
        for (let i = 0; i < times; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            console.log(`📜 Đã scroll lần ${i + 1}`);
            await page.waitForTimeout(2000 + Math.random() * 2000);
        }
    } catch (e) {
        console.warn('⚠️ Lỗi khi scroll feed:', e.message);
    }
}
