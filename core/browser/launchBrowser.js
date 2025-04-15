import { chromium } from 'playwright';

export async function launchBrowser(proxy, userAgent, sessionPath) {
    const browser = await chromium.launch({
        headless: false,
        proxy: proxy ? {
            server: proxy.server,
            username: proxy.username,
            password: proxy.password,
        } : undefined,
    });

    const context = await browser.newContext({
        userAgent,
        locale: 'en-US',
        timezoneId: 'Asia/Singapore',
        storageState: sessionPath,
    });

    return { browser, context };
}
