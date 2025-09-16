declare module 'tronweb' {
  interface TronWebOptions {
    fullHost?: string
    fullNode?: string
    solidityNode?: string
    eventServer?: string
    privateKey?: string
    headers?: Record<string, string>
  }

  class TronWeb {
    constructor(options: TronWebOptions)
    static default: typeof TronWeb
    
    trx: {
      getBalance(address: string): Promise<number>
      sendRawTransaction(signedTransaction: any): Promise<any>
    }
    
    contract(): {
      at(address: string): Promise<any>
    }
    
    utils: {
      abi: {
        encodeParameters(types: string[], values: any[]): string
        decodeParameters(types: string[], data: string): any
      }
    }
  }

  export = TronWeb
}