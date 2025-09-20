import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// 扩展Window接口以包含debugInfo属性
declare global {
  interface Window {
    debugInfo: {
      componentLoaded: boolean;
      timestamp: string;
    };
  }
}

// 这个静态函数将在HTML中嵌入一些内容，帮助我们验证渲染
window.debugInfo = {
  componentLoaded: true,
  timestamp: new Date().toISOString()
};

const DebugPage = () => {
  const location = useLocation();
  const [renderCount, setRenderCount] = useState(0);
  const [componentInfo, setComponentInfo] = useState<any>(null);
  
  useEffect(() => {
    // 记录组件挂载
    console.log('DebugPage component mounted at', new Date().toISOString());
    console.log('Current location:', location);
    
    // 检查React和其他依赖
    console.log('React version:', React.version);
    console.log('ReactDOM available:', typeof window.ReactDOM !== 'undefined');
    console.log('Router location:', location);
    
    // 检查全局状态
    if (window) {
      console.log('Window object exists:', !!window);
      console.log('Document object exists:', !!document);
      console.log('Root element exists:', !!document.getElementById('root'));
    }
    
    // 设置组件信息
    setComponentInfo({
      location: location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    });
    
    return () => {
      console.log('DebugPage component unmounted');
    };
  }, [location]);
  
  useEffect(() => {
    setRenderCount(prev => {
      const newCount = prev + 1;
      console.log(`Component rendered ${newCount} times`);
      return newCount;
    });
  }, [location]);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Debug Information</h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Component Status</h2>
            <p className="text-blue-700">This page is designed to help debug React rendering issues.</p>
            <p className="text-blue-700 mt-2">Check the browser console for detailed logs.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Render Count: <span className="text-green-600">{renderCount}</span></h3>
            </div>
            
            {componentInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Component Information</h3>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(componentInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Quick Navigation</h3>
            <div className="flex flex-wrap gap-2">
              <a href="/" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition">Home</a>
              <a href="/test" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition">Test Page</a>
              <a href="/debug" className="px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded-md text-blue-800 transition">Refresh Debug</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;