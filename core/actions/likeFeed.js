// core/actions/likeFeed.js

export async function likeFeed(page, maxLikes = 3) {
    console.log('🔍 Scanning feed for likeable posts...');

    try {
        await page.waitForSelector("div[aria-label='Like'], div[aria-label='Thích']", { timeout: 10000 });
    } catch (e) {
        console.warn('⚠️ Không tìm thấy nút Like nào trong feed.');
        return;
    }

    const likeButtons = await page.$$("div[aria-label='Like'], div[aria-label='Thích']");
    let liked = 0;

    for (const btn of likeButtons) {
        try {
            await btn.scrollIntoViewIfNeeded();
            await btn.click({ delay: 100 });
            liked++;
            console.log(`❤️ Đã like bài viết ${liked}/${maxLikes}`);
            await page.waitForTimeout(1000 + Math.random() * 2000);
            if (liked >= maxLikes) break;
        } catch (e) {
            console.log('⚠️ Lỗi khi like, thử cái tiếp theo...');
            continue;
        }
    }

    if (liked === 0) {
        console.log('🤷 Không like được bài nào.');
    }
}