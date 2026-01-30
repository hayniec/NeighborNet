const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
    output: "standalone",
    turbopack: {},
};

if (process.env.NODE_ENV === "development") {
    module.exports = nextConfig;
} else {
    module.exports = withPWA(nextConfig);
}
