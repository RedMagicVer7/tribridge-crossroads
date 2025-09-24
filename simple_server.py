#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

# 设置工作目录
os.chdir('/Users/pan/Downloads/tribridge-crossroads/demo')

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server():
    PORT = 8765
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"✅ TriBridge 演示服务器启动成功!")
            print(f"🌐 访问地址: http://localhost:{PORT}")
            print(f"📱 界面展示: TriBridge-RU-DevPlan-v3.0 完整项目成果")
            print(f"⏹️  按 Ctrl+C 停止服务器")
            print("=" * 50)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

if __name__ == "__main__":
    start_server()