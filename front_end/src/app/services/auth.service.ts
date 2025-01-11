import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export interface User {
    fullName: string;
    email: string;
    password: string;
    walletAddress: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly USERS_KEY = 'registered_users';

    constructor() {
        // Initialize users array if it doesn't exist
        if (!localStorage.getItem(this.USERS_KEY)) {
            localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
        }
    }

    register(user: User): Observable<boolean> {
        const users = this.getUsers();

        // Check if user already exists
        if (users.find(u => u.email === user.email)) {
            return throwError(() => new Error('User already exists'));
        }

        users.push(user);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return of(true);
    }

    login(email: string, password: string, walletAddress: string): Observable<User> {
        const users = this.getUsers();
        const user = users.find(u =>
            u.email === email &&
            u.password === password &&
            u.walletAddress === walletAddress
        );

        if (!user) {
            return throwError(() => new Error('Invalid credentials'));
        }

        // Store current user
        localStorage.setItem('current_user', JSON.stringify(user));
        return of(user);
    }

    logout(): void {
        localStorage.removeItem('current_user');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('current_user');
    }

    private getUsers(): User[] {
        return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    }
} 