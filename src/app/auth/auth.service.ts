import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from "../../environments/environment"
import { AuthData } from './auth-data.model';
import { UserData } from './user-data.model';
import { identifierModuleUrl } from '@angular/compiler';
import { stringify } from 'querystring';

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
  private nickname: string;
  private email: string;
  private authStatusListener = new Subject<boolean>();
  private authorizedStatusListener = new Subject<boolean>();
  private adminStatusListener = new Subject<boolean>();
  private emailListener = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) {}

  getUserFirstName() {
    return this.firstName;
  }

  getUserLastName() {
    return this.lastName;
  }

  getUserNickname() {
    return this.nickname;
  }

  getUserEmail() {
    return this.email;
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
  getEmailListener() {
    return this.emailListener;
  }

  createUser(email: string, password: string, firstName: string, lastName: string, nickname: string) {
    const authData: AuthData = { email: email, password: password, firstName: firstName, lastName: lastName, nickname: nickname};
    this.http
      .post(BACKEND_URL + 'signup', authData)
      .subscribe(() => {
        this.router.navigate(['/login']);
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
            nickname: user.nickname,
            admin: user.admin,
            authorized: user.authorized,
            email: user.email
          };
        });
      } ));
  }

  getUser(userId: string){
    return this.http.get<{message: string,
                        user: {
                         _id: string, 
                         email: string, 
                         firstName: string, 
                         lastName: string,
                         nickname: string}
                        }>(BACKEND_URL + userId)
  }

  updateUser(user: UserData) {
    return this.http.put<{
      token: string,
      expiresIn: number,
      userId: string,
      firstName: string,
      lastName: string,
      nickname: string,
      email: string,
      admin: boolean,
      authorized: boolean}>(BACKEND_URL + user.userId, user)
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
          this.nickname = response.nickname;
          this.email = response.email;
          this.authStatusListener.next(true);
          if (this.isAdmin == true) this.adminStatusListener.next(true)
          else this.adminStatusListener.next(false)
          if (this.isAuthorized == true ) this.authorizedStatusListener.next(true)
          else this.authorizedStatusListener.next(false)
          this.emailListener.next(this.email)
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          const user: UserData = { userId: this.userId, firstName: this.firstName, lastName: this.lastName, nickname: this.nickname, email: this.email, admin: this.isAdmin, authorized: this.isAuthorized};
          this.saveAuthData(token, expirationDate, user);
          this.router.navigate(['/tasks']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  changePassword(oldPassword: string, newPassword: string){
      return this.http.put<{token: string,
        expiresIn: number,
        userId: string,
        firstName: string,
        lastName: string,
        nickname: string,
        email: string,
        admin: boolean,
        authorized: boolean}>(BACKEND_URL + 'password/' + this.userId, {oldPassword: oldPassword, newPassword: newPassword})
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
            this.nickname = response.nickname;
            this.email = response.email;
            this.authStatusListener.next(true);
            if (this.isAdmin == true) this.adminStatusListener.next(true)
            else this.adminStatusListener.next(false)
            if (this.isAuthorized == true ) this.authorizedStatusListener.next(true)
            else this.authorizedStatusListener.next(false)
            this.emailListener.next(this.email)
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
            const user: UserData = { userId: this.userId, firstName: this.firstName, lastName: this.lastName, nickname: this.nickname, email: this.email, admin: this.isAdmin, authorized: this.isAuthorized};
            this.saveAuthData(token, expirationDate, user);
            this.router.navigate(['/tasks']);
          }
        }, error => {
          this.authStatusListener.next(false);
        })
  }

  getAuthorizedUsers(){
    return this.http.get<{message: string, users: any}>(BACKEND_URL + 'authorized/')
      .pipe(map(usersData => {
        return usersData.users.map(user => {
          return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname
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
    const authData: AuthData = { email: email, password: password, firstName: null, lastName: null, nickname: null};
    this.http.post<{
      token: string,
      expiresIn: number,
      userId: string,
      firstName: string,
      lastName: string,
      nickname: string,
      email: string,
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
          this.nickname = response.nickname;
          this.email = response.email;
          this.authStatusListener.next(true);
          if (this.isAdmin == true) this.adminStatusListener.next(true)
          else this.adminStatusListener.next(false)
          if (this.isAuthorized == true ) this.authorizedStatusListener.next(true)
          else this.authorizedStatusListener.next(false)
          this.emailListener.next(this.email)
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          const user: UserData = { userId: this.userId, firstName: this.firstName, lastName: this.lastName, nickname: this.nickname, email: this.email, admin: this.isAdmin, authorized: this.isAuthorized};
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
      this.nickname = authInformation.nickname;
      this.email = authInformation.email;
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
    localStorage.setItem('nickname', user.nickname);
    localStorage.setItem('email', user.email);
    localStorage.setItem('admin', String(user.admin));
    localStorage.setItem('authorized', String(user.authorized));
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('nickname');
    localStorage.removeItem('email');
    localStorage.removeItem('admin');
    localStorage.removeItem('authorized');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const nickname = localStorage.getItem('nickname');
    const email = localStorage.getItem('email');
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
      nickname: nickname,
      email: email,
      admin: admin,
      authorized: authorized
    };
  }
}
