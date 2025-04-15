export function assignProxy(proxyConfig, isNewLogin = false) {
    if (!proxyConfig) return null;

    const { type, server, username, password } = proxyConfig;

    if (isNewLogin && type !== 'residential') {
        throw new Error(`🚫 Không nên dùng datacenter proxy để login lần đầu: ${server}`);
    }

    return { server, username, password };
}
