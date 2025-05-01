export function parseJwt(token) {
    try {
        // JWT = header.payload.signature
        const base64Payload = token.split('.')[1];
        const jsonPayload = atob(base64Payload);
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to parse JWT', e);
        return {};
    }
}