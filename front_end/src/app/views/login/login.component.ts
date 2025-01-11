import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CryptoWalletService } from '../../services/crypto-wallet.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  walletAddress: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private cryptoWalletService: CryptoWalletService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async connectWallet() {
    try {
      const accounts = await this.cryptoWalletService.connectWallet();
      if (accounts && accounts.length > 0) {
        this.walletAddress = accounts[0];
        console.log('Wallet connected:', this.walletAddress);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.errorMessage = 'Failed to connect wallet';
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    if (this.loginForm.valid && this.walletAddress) {
      this.isLoading = true;
      try {
        const { email, password } = this.loginForm.value;

        this.authService.login(email, password, this.walletAddress).subscribe({
          next: (user) => {
            this.router.navigate(['/app']);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Invalid credentials';
          }
        });
      } finally {
        this.isLoading = false;
      }
    } else {
      if (!this.walletAddress) {
        this.errorMessage = 'Please connect your wallet first';
      }
      if (!this.loginForm.valid) {
        this.errorMessage = 'Please fill in all required fields correctly';
      }
    }
  }
} 