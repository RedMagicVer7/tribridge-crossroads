#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
import threading
import time

PORT = 4000
Directory = "dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=Directory, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def start_server():
    os.chdir('/Users/pan/Downloads/tribridge-crossroads')
    
    if not os.path.exists(Directory):
        print(f"❌ 目录 {Directory} 不存在，请先运行 npm run build")
        return
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"✅ TriBridge React 应用启动成功!")
        print(f"🌐 访问地址: http://localhost:{PORT}")
        print(f"📱 展示内容: TriBridge-RU-DevPlan-v3.0 完整应用界面")
        print(f"⏹️  按 Ctrl+C 停止服务器")
        print("=" * 60)
        
        # 自动打开浏览器
        threading.Timer(1, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 服务器已停止")

if __name__ == "__main__":
    start_server()