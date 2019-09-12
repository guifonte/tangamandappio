import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from "../../environments/environment"
import { AuthData } from './auth-data.model';
import { UserData } from './user-data.model';

const BACKEND_URL = environment.apiURL + "/user/"

@Injectable({ providedIn: 'root'})
export class AuthService {
  private isAuthenticated = false;
  private isAuthorized= false;
  private isAdmin = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private firstName: string;
  private lastName: string;
  private email: string;
  private authStatusListener = new Subject<boolean>();
  private authorizedStatusListener = new Subject<boolean>();
  private adminStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getUserFirstName() {
    return this.firstName;
  }

  getUserLastName() {
    return this.lastName;
  }

  getUserId() {
    return this.userId;
  }

  getToken() {
    return this.token;
  }
  getIsAuth() {
    return this.isAuthenticated;
  }
  getIsAuthorized() {
    return this.isAuthorized;
  }
  getIsAdmin() {
    return this.isAdmin;
  }
  getAuthStatusListener() {
    return this.authStatusListener;
  }
  getAuthorizedStatusListener() {
    return this.authorizedStatusListener;
  }
  getAdminStatusListener() {
    return this.adminStatusListener;
  }

  createUser(email: string, password: string, firstName: string, lastName: string) {
    const authData: AuthData = { email: email, password: password, firstName: firstName, lastName: lastName};
    this.http
      .post(BACKEND_URL + 'signup', authData)
      .subscribe(() => {
        this.router.navigate(['/auth/login']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  getUsers(){
    return this.http.get<{message: string, users: any}>(BACKEND_URL)
      .pipe(map(usersData => {
        return usersData.users.map(user => {
          return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            authorized: user.authorized,
            email: user.email
          };
        });
      } ));
  }

  getAuthorizedUsers(){
    return this.http.get<{message: string, users: any}>(BACKEND_URL + 'authorized')
      .pipe(map(usersData => {
        return usersData.users.map(user => {
          return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName
          };
        });
      } ));
  }

  saveUsers(users: UserData[]){
    this.http.put(BACKEND_URL, users).subscribe(() => {
      this.router.navigate(["/tasks"])
    })
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password, firstName: null, lastName: null};
    this.http.post<{
      token: string,
      expiresIn: number,
      userId: string,
      firstName: string,
      lastName: string,
      admin: boolean,
      authorized: boolean}>(
        BACKEND_URL + 'login',
        authData
      )
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.isAdmin = response.admin;
          this.isAuthorized = response.authorized;
          this.userId = response.userId;
          this.firstName = response.firstName;
          this.lastName = response.lastName;
          this.authStatusListener.next(true);
          if (this.isAdmin == true) this.adminStatusListener.next(true)
          else this.adminStatusListener.next(false)
          if (this.isAuthorized == true ) this.authorizedStatusListener.next(true)
          else this.authorizedStatusListener.next(false)
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          const user: UserData = { userId: this.userId, firstName: this.firstName, lastName: this.lastName, email: null, admin: this.isAdmin, authorized: this.isAuthorized};
          this.saveAuthData(token, expirationDate, user);
          this.router.navigate(['/tasks']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.isAdmin = authInformation.admin;
      this.isAuthorized = authInformation.authorized;
      this.userId = authInformation.userId;
      this.firstName = authInformation.firstName;
      this.lastName = authInformation.lastName;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      if (this.isAdmin == true) this.adminStatusListener.next(true)
      else this.adminStatusListener.next(false)
      if (this.isAuthorized == true ) this.authorizedStatusListener.next(true)
      else this.authorizedStatusListener.next(false)
    }
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.authorizedStatusListener.next(false);
    this.adminStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, user: UserData) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', user.userId);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);
    localStorage.setItem('admin', String(user.admin));
    localStorage.setItem('authorized', String(user.authorized));
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('admin');
    localStorage.removeItem('authorized');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const admin = (localStorage.getItem('admin') == 'true');
    const authorized = (localStorage.getItem('authorized') == 'true');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      admin: admin,
      authorized: authorized
    };
  }
}
