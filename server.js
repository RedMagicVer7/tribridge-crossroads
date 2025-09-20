import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8080;
const cwd = process.cwd();
console.log(`Current working directory: ${cwd}`);
const DIST_DIR = path.join(cwd, 'dist');
console.log(`DIST_DIR path: ${DIST_DIR}`);

// 检查dist目录是否存在
fs.access(DIST_DIR, fs.constants.F_OK, (err) => {
  if (err) {
    console.error(`DIST_DIR does not exist: ${DIST_DIR}`);
  } else {
    console.log(`DIST_DIR exists: ${DIST_DIR}`);
  }
});

const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);
  // 处理根路径请求，移除查询参数
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
  console.log(`Resolved file path: ${filePath}`);
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}, Error: ${err.message}`);
      // 如果文件不存在，返回404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${filePath}`);
      return;
    }
    
    // 确定文件类型
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
      case '.js': contentType = 'application/javascript'; break;
      case '.css': contentType = 'text/css'; break;
      case '.svg': contentType = 'image/svg+xml'; break;
      case '.ico': contentType = 'image/x-icon'; break;
      default: contentType = 'text/html';
    }
    
    // 读取并发送文件
    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error(`Error reading file: ${filePath}, Error: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${error.message}`);
        return;
      }
      
      console.log(`Successfully served file: ${filePath}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

server.listen(PORT, () => {
  console.log(`Static file server running at http://localhost:${PORT}/`);
});