import { Injectable } from '@angular/core';
import { Transaction } from '../types/transaction';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CryptoWalletService {
  private ethereum;

  constructor(
    private apiService: ApiService
  ) {
    this.ethereum = window.ethereum;
  }

  public connectWallet = async (): Promise<any> => {
    try {
      if (!this.ethereum) {
        console.error("Please install MetaMask");
        return [];
      }
      return await this.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (e: any) {
      if (e.code !== 4001) { // 4001 is MetaMask's user rejection code
        console.error("Failed to connect wallet");
      }
      return [];
    }
  }

  public checkWalletConnection = async () => {
    try {
      if (!this.ethereum) {
        return [];
      }
      return await this.ethereum.request({ method: 'eth_accounts' });
    } catch (e) {
      console.error("Failed to check wallet connection:", e);
      return [];
    }
  }

  public getAllTransactions = async (): Promise<Array<any>> => {
    try {
      const transactions = await firstValueFrom(this.apiService.getAllTransactions());
      return transactions;
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
      return [];
    }
  }

  public sendTransaction = async (transaction: Transaction): Promise<boolean> => {
    try {
      if (!this.ethereum) {
        console.error("Please install MetaMask");
        return false;
      }

      const accounts = await this.checkWalletConnection();
      if (!accounts || accounts.length === 0) {
        console.error("Please connect your wallet first");
        return false;
      }

      const currentAccount = accounts[0];
      
      // Send the transaction through MetaMask
      await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: currentAccount,
          to: transaction.addressTo,
          gas: '0x5208', // 21000 GWEI
          value: transaction.amount.toString(16) // Convert to hex
        }]
      });

      console.log("Transaction sent successfully");
      return true;
    } catch (e: any) {
      if (e.code !== 4001) {
        console.error("Failed to send transaction");
      }
      return false;
    }
  }
}
