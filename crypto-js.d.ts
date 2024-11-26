declare module "crypto-js" {
    export = CryptoJS;
  }
  
  declare namespace CryptoJS {
    interface AES {
      encrypt(message: string, key: string): any;
      decrypt(encryptedMessage: string, key: string): any;
    }
  
    // Add more interfaces as needed (for example, for SHA256, etc.)
  }
  