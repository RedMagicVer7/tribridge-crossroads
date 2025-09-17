/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 配置环境变量
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000',
  },
  // 配置页面目录和扩展名
  pageExtensions: ['tsx'],
  // 配置webpack
  webpack: (config) => {
    // 路径别名
    config.resolve.alias['@'] = new URL('src', import.meta.url).pathname;
    // 添加src目录到模块解析路径
    config.resolve.modules.push(new URL('src', import.meta.url).pathname);
    return config;
  },
};

export default nextConfig;