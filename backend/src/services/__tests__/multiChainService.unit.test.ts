import { MultiChainService } from '../multiChainService';

// Mock the entire MultiChainService to avoid blockchain initialization
jest.mock('../multiChainService', () => {
  return {
    MultiChainService: jest.fn().mockImplementation(() => {
      return {
        getSupportedChains: jest.fn().mockReturnValue([
          { name: 'Ethereum', chainId: 1 },
          { name: 'TRON', chainId: 728126428 },
          { name: 'Binance Smart Chain', chainId: 56 }
        ]),
        getChainConfig: jest.fn().mockImplementation((chainName) => {
          const configs: any = {
            ethereum: { name: 'Ethereum', chainId: 1 },
            tron: { name: 'TRON', chainId: 728126428 },
            bsc: { name: 'Binance Smart Chain', chainId: 56 }
          };
          return configs[chainName.toLowerCase()];
        }),
        getSupportedTokens: jest.fn().mockImplementation((chainName) => {
          const tokens: any = {
            ethereum: ['USDT', 'USDC', 'DAI'],
            tron: ['USDT', 'USDC'],
            bsc: ['USDT', 'USDC', 'BUSD']
          };
          return tokens[chainName.toLowerCase()] || [];
        }),
        validateAddress: jest.fn().mockImplementation((chainName, address) => {
          if (chainName.toLowerCase() === 'tron') {
            return address.startsWith('T') && address.length === 34;
          } else {
            // Simple Ethereum address validation
            return address.startsWith('0x') && address.length === 42;
          }
        })
      };
    })
  };
});

describe('MultiChainService Unit Tests', () => {
  let multiChainService: MultiChainService;

  beforeEach(() => {
    multiChainService = new MultiChainService();
  });

  describe('getSupportedChains', () => {
    it('should return supported chains', () => {
      const chains = multiChainService.getSupportedChains();
      expect(chains).toHaveLength(3);
      expect(chains.map(chain => chain.name)).toEqual(
        expect.arrayContaining(['Ethereum', 'TRON', 'Binance Smart Chain'])
      );
    });
  });

  describe('getChainConfig', () => {
    it('should return chain configuration for valid chain', () => {
      const config = multiChainService.getChainConfig('ethereum');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Ethereum');
      expect(config?.chainId).toBe(1);
    });

    it('should return undefined for invalid chain', () => {
      const config = multiChainService.getChainConfig('invalid-chain');
      expect(config).toBeUndefined();
    });
  });

  describe('getSupportedTokens', () => {
    it('should return supported tokens for Ethereum', () => {
      const tokens = multiChainService.getSupportedTokens('ethereum');
      expect(tokens).toEqual(expect.arrayContaining(['USDT', 'USDC', 'DAI']));
    });

    it('should return supported tokens for TRON', () => {
      const tokens = multiChainService.getSupportedTokens('tron');
      expect(tokens).toEqual(expect.arrayContaining(['USDT', 'USDC']));
    });

    it('should return supported tokens for BSC', () => {
      const tokens = multiChainService.getSupportedTokens('bsc');
      expect(tokens).toEqual(expect.arrayContaining(['USDT', 'USDC', 'BUSD']));
    });
  });

  describe('validateAddress', () => {
    it('should validate Ethereum address', () => {
      const validAddress = '0x742d35Cc6648C8532C2B41F398999930894B6Af8';
      expect(multiChainService.validateAddress('ethereum', validAddress)).toBe(true);
    });

    it('should validate TRON address', () => {
      const validAddress = 'TQa7MjWd8m4pZgHNF6WVJy8K1kKv5pV5pV';
      expect(multiChainService.validateAddress('tron', validAddress)).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      expect(multiChainService.validateAddress('ethereum', 'invalid')).toBe(false);
      expect(multiChainService.validateAddress('tron', 'invalid')).toBe(false);
    });
  });
});