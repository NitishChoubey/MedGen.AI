import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Explicitly set path alias for webpack to ensure it works in production
    const aliases = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    
    config.resolve.alias = aliases;
    
    // Ensure extensions are resolved
    config.resolve.extensions = [
      ...new Set([
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
        ...(config.resolve.extensions || [])
      ])
    ];
    
    return config;
  },
};

export default nextConfig;





