import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Component({
    selector:"app-header",
    templateUrl:"./header.component.html",
    styleUrls: ["./header.component.css"]
})

export class HeaderComponent implements OnInit, OnDestroy {
    userIsAuthenticated = false;
    userIsAuthorized;
    userIsAdmin;
    userFirstName;
    private authListenerSubs: Subscription;
    private authorizedListenerSubs: Subscription;
    private adminListenerSubs: Subscription;
    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.userFirstName = this.authService.getUserFirstName();
        this.userIsAuthorized = this.authService.getIsAuthorized();
        this.userIsAdmin = this.authService.getIsAdmin();
        this.authListenerSubs = this.authService
          .getAuthStatusListener()
          .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
            this.userFirstName = this.authService.getUserFirstName();
          });
        this.authorizedListenerSubs = this.authService
          .getAuthorizedStatusListener()
          .subscribe(isAuthorized => {
            this.userIsAuthorized = isAuthorized;
          });
        this.adminListenerSubs = this.authService
          .getAdminStatusListener()
          .subscribe(isAdmin => {
            this.userIsAdmin = isAdmin;
          })
      }

    onLogout() {
    this.authService.logout();
    }

    ngOnDestroy() {
    this.authService.getAuthStatusListener().unsubscribe();
    this.authService.getAuthorizedStatusListener().unsubscribe();
    this.authService.getAdminStatusListener().unsubscribe();
    }
}