// 这个脚本用于检查React应用是否正在浏览器中正确渲染
// 它会尝试访问我们在MinimalTest组件中设置的全局变量

// 使用Node.js的http和puppeteer库来自动化浏览器测试
import http from 'http';
import { exec } from 'child_process';
import path from 'path';

// 检查Node.js版本
const nodeVersion = process.version;
console.log(`当前Node.js版本: ${nodeVersion}`);

// 检查puppeteer是否已安装
function checkPuppeteer() {
  try {
    require.resolve('puppeteer');
    return true;
  } catch (e) {
    return false;
  }
}

// 安装puppeteer（如果未安装）
function installPuppeteer() {
  return new Promise((resolve, reject) => {
    console.log('正在安装puppeteer用于浏览器自动化测试...');
    exec('npm install puppeteer --save-dev', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error(`安装puppeteer失败: ${stderr}`);
        reject(error);
        return;
      }
      console.log(`puppeteer安装成功: ${stdout}`);
      resolve();
    });
  });
}

// 使用puppeteer检查React渲染
async function checkReactRenderingWithPuppeteer() {
  try {
    const puppeteer = require('puppeteer');
    
    console.log('正在启动浏览器...');
    const browser = await puppeteer.launch({
      headless: true, // 无头模式运行
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 启用控制台日志捕获
    page.on('console', msg => {
      const msgType = msg.type().substr(0, 3).toUpperCase();
      console.log(`[浏览器控制台 ${msgType}] ${msg.text()}`);
    });
    
    console.log('正在访问预览服务器: http://localhost:4173/');
    await page.goto('http://localhost:4173/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 等待一段时间让React有机会渲染
    console.log('等待React渲染...');
    await page.waitForTimeout(2000);
    
    // 检查root元素是否有内容
    const rootHasContent = await page.evaluate(() => {
      const rootElement = document.getElementById('root');
      return rootElement && rootElement.children.length > 0;
    });
    
    console.log(`root元素有内容: ${rootHasContent ? '✅ 是' : '❌ 否'}`);
    
    // 检查我们设置的全局变量
    const reactTestSuccess = await page.evaluate(() => {
      return window.reactTestSuccess;
    });
    
    console.log(`React测试成功标志: ${reactTestSuccess ? '✅ true' : '❌ false'}`);
    
    // 获取最后渲染时间
    const lastRenderTime = await page.evaluate(() => {
      return window.lastRenderTime;
    });
    
    if (lastRenderTime) {
      console.log(`最后渲染时间: ${lastRenderTime}`);
    }
    
    // 获取页面内容快照（用于调试）
    const pageContent = await page.content();
    const contentSample = pageContent.substring(0, 500) + '...'; // 只显示前500个字符
    console.log(`\n页面内容样本:\n${contentSample}\n`);
    
    // 截图（用于调试）
    const screenshotPath = path.join(__dirname, 'react-render-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`已保存页面截图到: ${screenshotPath}`);
    
    await browser.close();
    
    // 返回测试结果
    return {
      rootHasContent,
      reactTestSuccess,
      lastRenderTime
    };
  } catch (error) {
    console.error(`检查React渲染时出错: ${error.message}`);
    return {
      error: error.message
    };
  }
}

// 回退方案：使用简单的HTTP请求检查页面基本内容
function checkReactRenderingWithHttp() {
  return new Promise((resolve, reject) => {
    console.log('使用HTTP请求检查页面内容（puppeteer不可用）...');
    
    http.get('http://localhost:4173/', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const hasRootElement = data.includes('<div id="root"></div>');
        const hasScriptTag = data.includes('<script type="module"');
        
        console.log(`HTML包含root元素: ${hasRootElement ? '✅ 是' : '❌ 否'}`);
        console.log(`HTML包含script标签: ${hasScriptTag ? '✅ 是' : '❌ 否'}`);
        
        resolve({
          hasRootElement,
          hasScriptTag,
          contentSample: data.substring(0, 500) + '...'
        });
      });
    }).on('error', (error) => {
      console.error(`HTTP请求错误: ${error.message}`);
      reject(error);
    });
  });
}

// 主函数
async function main() {
  console.log('==========================');
  console.log('React渲染检查工具');
  console.log('==========================');
  
  try {
    // 首先尝试使用puppeteer进行完整检查
    if (checkPuppeteer()) {
      console.log('发现已安装的puppeteer，使用它进行完整测试...');
      const result = await checkReactRenderingWithPuppeteer();
      
      console.log('\n测试结果总结:');
      if (result.error) {
        console.error(`❌ 测试失败: ${result.error}`);
      } else if (result.reactTestSuccess && result.rootHasContent) {
        console.log('✅ React应用渲染成功！');
        console.log('   - root元素包含内容');
        console.log('   - window.reactTestSuccess标志已设置为true');
      } else if (result.rootHasContent) {
        console.log('⚠️ React可能在渲染，但缺少预期的全局标志');
      } else {
        console.log('❌ React渲染失败');
      }
    } else {
      // 如果没有puppeteer，尝试安装它
      try {
        await installPuppeteer();
        // 重新运行主函数以使用刚安装的puppeteer
        await main();
      } catch (e) {
        // 如果安装失败，使用HTTP请求作为回退
        console.log('\npuppeteer不可用，使用简单的HTTP请求作为回退...');
        const result = await checkReactRenderingWithHttp();
        
        console.log('\n测试结果总结:');
        if (result.hasRootElement && result.hasScriptTag) {
          console.log('ℹ️ HTML结构看起来正常，但无法确认JavaScript是否执行');
          console.log('   请在浏览器中打开http://localhost:4173/并检查控制台');
        } else {
          console.log('❌ HTML结构不完整，可能存在问题');
        }
      }
    }
  } catch (error) {
    console.error(`工具运行失败: ${error.message}`);
  }
  
  console.log('\n==========================');
  console.log('检查完成');
  console.log('==========================');
}

// 运行主函数
main();

// 提供简单的说明
console.log('\n提示：这个脚本会尝试使用puppeteer自动测试React应用渲染情况。');
console.log('      如果puppeteer不可用，它会尝试安装或使用简单的HTTP检查。');
console.log('      完整的测试结果将在脚本执行完成后显示。');