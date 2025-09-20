import React from 'react';
import OTCTrading from '../src/components/OTC/OTCTrading';

const OTCPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OTC场外交易</h1>
          <p className="text-muted-foreground">
            安全便捷的点对点加密货币交易平台，支持多种支付方式和法币
          </p>
        </div>
        
        <OTCTrading />
      </div>
    </div>
  );
};

export default OTCPage;