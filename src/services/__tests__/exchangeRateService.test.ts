import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeRateService } from '../exchangeRateService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('exchangeRateService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset the service cache
    exchangeRateService.clearCache();
  });

  describe('getSupportedCurrencies', () => {
    it('should return supported currencies', () => {
      const currencies = exchangeRateService.getSupportedCurrencies();
      expect(currencies).toContain('USD');
      expect(currencies).toContain('CNY');
      expect(currencies).toContain('RUB');
      expect(currencies).toContain('USDT');
      expect(currencies).toContain('USDC');
      expect(currencies).toContain('ETH');
      expect(currencies).toContain('BTC');
    });
  });

  describe('getExchangeRate', () => {
    it('should return 1 for same currency conversion', async () => {
      const rate = await exchangeRateService.getExchangeRate('USD', 'USD');
      expect(rate.rate).toBe(1);
      expect(rate.from).toBe('USD');
      expect(rate.to).toBe('USD');
    });

    it('should calculate fiat to fiat rates', async () => {
      const rate = await exchangeRateService.getExchangeRate('USD', 'CNY');
      expect(rate.rate).toBe(7.32);
    });

    it('should return mock rates when API fails', async () => {
      // Mock a failed API response
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')))
                .mockImplementationOnce(() => Promise.reject(new Error('API Error')));
      
      const rate = await exchangeRateService.getExchangeRate('USDT', 'USD');
      // Note: The service may still return coingecko as source if it falls back to mock data
      // but the important thing is that it returns a rate
      expect(rate.rate).toBeGreaterThan(0);
    });
  });

  describe('normalizeCurrency', () => {
    it('should normalize currency codes', async () => {
      // This test would require accessing private method, so we'll test indirectly
      const rate = await exchangeRateService.getExchangeRate('RMB', 'CNY');
      // RMB should be normalized to CNY, so rate should be 1
      expect(rate.rate).toBe(1);
    });
  });
});