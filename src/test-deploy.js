// 测试部署配置的简单脚本
console.log('Testing deployment configuration...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Building for production:', process.env.NODE_ENV === 'production');

// 检查必要的环境变量
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_APP_TITLE'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('Missing environment variables:', missingEnvVars);
} else {
  console.log('All required environment variables are present');
}

console.log('Deployment test completed successfully');