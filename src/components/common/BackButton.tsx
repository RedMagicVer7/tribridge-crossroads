import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  text?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to = '/russia', 
  text = '返回 Russia 页面', 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(to);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleBack}
      className={`mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {text}
    </Button>
  );
};

export default BackButton;