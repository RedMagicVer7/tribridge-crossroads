import '../src/index.css';
import type { AppProps } from 'next/app';
import { Toaster } from '../src/components/ui/toaster';
import { Toaster as Sonner } from '../src/components/ui/sonner';
import { TooltipProvider } from '../src/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TranslationProvider } from '../src/contexts/TranslationContext';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider>
        <TooltipProvider>
          <Component {...pageProps} />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </TranslationProvider>
    </QueryClientProvider>
  );
}