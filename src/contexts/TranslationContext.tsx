import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh-CN' | 'en-US' | 'ru-RU';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  'zh-CN': {
    'app.title': 'TriBridge 支付系统',
    'nav.dashboard': '仪表板',
    'nav.transactions': '交易记录',
    'nav.analytics': '数据分析',
    'nav.wallet': '钱包管理',
    'nav.compliance': '合规中心',
    'nav.notifications': '通知中心',
    'nav.settings': '设置',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.loading': '加载中...',
    'common.success': '成功',
    'common.error': '错误',
    'exchange.title': '货币兑换',
    'exchange.from': '发送',
    'exchange.to': '接收',
    'exchange.amount': '金额',
    'exchange.rate': '汇率',
    'exchange.fee': '手续费',
    'exchange.execute': '执行兑换',
    'transaction.status.completed': '已完成',
    'transaction.status.pending': '处理中',
    'transaction.status.failed': '失败',
    'wallet.connect': '连接钱包',
    'wallet.balance': '余额',
    'kyc.title': 'KYC身份验证',
    'kyc.personal': '个人信息',
    'kyc.documents': '身份验证文件',
    'risk.monitoring': '风险监控',
    'risk.safe': '安全',
    'risk.warning': '警告',
    'risk.critical': '危险'
  },
  'en-US': {
    'app.title': 'TriBridge Payment System',
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.analytics': 'Analytics',
    'nav.wallet': 'Wallet',
    'nav.compliance': 'Compliance',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'exchange.title': 'Currency Exchange',
    'exchange.from': 'From',
    'exchange.to': 'To',
    'exchange.amount': 'Amount',
    'exchange.rate': 'Rate',
    'exchange.fee': 'Fee',
    'exchange.execute': 'Execute Exchange',
    'transaction.status.completed': 'Completed',
    'transaction.status.pending': 'Pending',
    'transaction.status.failed': 'Failed',
    'wallet.connect': 'Connect Wallet',
    'wallet.balance': 'Balance',
    'kyc.title': 'KYC Verification',
    'kyc.personal': 'Personal Information',
    'kyc.documents': 'Identity Documents',
    'risk.monitoring': 'Risk Monitoring',
    'risk.safe': 'Safe',
    'risk.warning': 'Warning',
    'risk.critical': 'Critical'
  },
  'ru-RU': {
    'app.title': 'Платежная система TriBridge',
    'nav.dashboard': 'Панель управления',
    'nav.transactions': 'Транзакции',
    'nav.analytics': 'Аналитика',
    'nav.wallet': 'Кошелек',
    'nav.compliance': 'Соответствие',
    'nav.notifications': 'Уведомления',
    'nav.settings': 'Настройки',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.confirm': 'Подтвердить',
    'common.loading': 'Загрузка...',
    'common.success': 'Успешно',
    'common.error': 'Ошибка',
    'exchange.title': 'Обмен валют',
    'exchange.from': 'Отправить',
    'exchange.to': 'Получить',
    'exchange.amount': 'Сумма',
    'exchange.rate': 'Курс',
    'exchange.fee': 'Комиссия',
    'exchange.execute': 'Выполнить обмен',
    'transaction.status.completed': 'Завершено',
    'transaction.status.pending': 'В обработке',
    'transaction.status.failed': 'Неудачно',
    'wallet.connect': 'Подключить кошелек',
    'wallet.balance': 'Баланс',
    'kyc.title': 'Верификация KYC',
    'kyc.personal': 'Личная информация',
    'kyc.documents': 'Документы удостоверения',
    'risk.monitoring': 'Мониторинг рисков',
    'risk.safe': 'Безопасно',
    'risk.warning': 'Предупреждение',
    'risk.critical': 'Критично'
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [language, setLanguage] = useState<Language>('zh-CN');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationProvider;