import * as Sentry from "@sentry/react";

async function initSentry() {
    try {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            sendDefaultPii: true
        });
    } catch (error) {
        console.error("Error in initializing Sentry:", error);
        throw error;
    }
}

export default initSentry;