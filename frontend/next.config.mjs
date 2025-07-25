import { join } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "your-backend-ip", "127.0.0.1"], // ✅ allow external images
  },
  webpack: (config) => {
    config.resolve.alias['@'] = join(process.cwd(), 'src');
    return config;
  },
};

export default nextConfig;
