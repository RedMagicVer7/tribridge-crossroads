import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-6">This is a simple test page to verify React rendering.</p>
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 font-medium">React is working correctly!</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;