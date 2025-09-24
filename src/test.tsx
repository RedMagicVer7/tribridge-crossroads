import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 一个简单的测试组件
function TestComponent() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is a simple test page.</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestComponent />
  </StrictMode>,
);