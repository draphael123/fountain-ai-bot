/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable telemetry
  experimental: {
    instrumentationHook: false,
  },
  // Ensure sql.js WASM file is available
  webpack: (config, { isServer }) => {
    // Add fallback for node modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
