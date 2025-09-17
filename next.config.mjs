/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 配置路径别名
  webpack: (config) => {
    config.resolve.alias['@'] = new URL('src', import.meta.url).pathname;
    return config;
  },
  // 配置环境变量
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000',
  },
};

export default nextConfig;