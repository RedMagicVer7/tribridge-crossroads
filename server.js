import http from 'http';
import fs from 'fs';
import path from 'path';

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    let filePath = './demo/index.html';
    
    if (req.url === '/' || req.url === '/index.html') {
        filePath = './demo/index.html';
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
    });
});

const PORT = 3333;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ TriBridge 演示服务器启动成功!`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`📋 展示内容: TriBridge-RU-DevPlan-v3.0 完整项目成果`);
});

server.on('error', (err) => {
    console.error('服务器启动失败:', err);
});
