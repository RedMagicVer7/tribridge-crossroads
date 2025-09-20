import React from 'react';
import LiquidityPoolManagement from '../components/LiquidityPool/LiquidityPoolManagement';

const LiquidityPoolPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">资金池管理</h1>
          <p className="text-muted-foreground">
            投资专业管理的资金池，获取稳定的被动收入
          </p>
        </div>
        
        <LiquidityPoolManagement />
      </div>
    </div>
  );
};

export default LiquidityPoolPage;