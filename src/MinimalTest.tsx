import React from 'react';

// 扩展Window接口以包含测试所需的属性
declare global {
  interface Window {
    reactTestSuccess: boolean;
    lastRenderTime: string;
  }
}

// 这是一个最简单的React组件，用于测试React是否能基本工作
const MinimalTest = () => {
  console.log('MinimalTest component rendered!');
  
  // 直接在全局作用域设置一个标志，表明组件已渲染
  if (typeof window !== 'undefined') {
    window.reactTestSuccess = true;
    window.lastRenderTime = new Date().toISOString();
  }
  
  return (
    <div className="min-h-screen bg-green-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ React is Working!</h1>
        <p className="text-gray-700 mb-6">
          This minimal test confirms that React is able to render components in your application.
        </p>
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Technical Details:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• React version: {React.version}</li>
            <li>• Render time: {new Date().toLocaleTimeString()}</li>
            <li>• Component: MinimalTest</li>
            <li>• Status: Successfully Rendered</li>
          </ul>
        </div>
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Check browser console for additional logs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinimalTest;