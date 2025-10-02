import * as Sentry from "@sentry/react";

async function initSentry() {
    try {
        Sentry.init({
            dsn: "https://1123a21304cac4864adc31230abbedf8@o4510117401395200.ingest.us.sentry.io/4510117512544256",
            // Setting this option to true will send default PII data to Sentry.
            // For example, automatic IP address collection on events
            sendDefaultPii: true
        });
    } catch (error) {
        console.error("Error in initializing Sentry:", error);
        throw error;
    }
}

export default initSentry;