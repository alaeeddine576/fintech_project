import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CryptoWalletService } from '../../services/crypto-wallet.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  walletAddress: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private cryptoWalletService: CryptoWalletService,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  async connectWallet() {
    try {
      const accounts = await this.cryptoWalletService.connectWallet();
      if (accounts && accounts.length > 0) {
        this.walletAddress = accounts[0];
        this.successMessage = 'Wallet connected successfully!';
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.errorMessage = 'Failed to connect wallet';
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.signupForm.valid && this.walletAddress) {
      this.isLoading = true;
      try {
        const userData = {
          ...this.signupForm.value,
          walletAddress: this.walletAddress
        };
        delete userData.confirmPassword;

        this.authService.register(userData).subscribe({
          next: () => {
            this.successMessage = 'Account created successfully!';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to create account';
          }
        });
      } finally {
        this.isLoading = false;
      }
    } else {
      if (!this.walletAddress) {
        this.errorMessage = 'Please connect your wallet first';
      }
      if (!this.signupForm.valid) {
        if (this.signupForm.errors?.['mismatch']) {
          this.errorMessage = 'Passwords do not match';
        } else {
          this.errorMessage = 'Please fill in all required fields correctly';
        }
      }
    }
  }
} 