import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { HeaderService } from './header.service';

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
    adminMode = false;
    private authListenerSubs: Subscription;
    private authorizedListenerSubs: Subscription;
    private adminListenerSubs: Subscription;
    private adminModeSubs: Subscription;

    constructor(private authService: AuthService, private headerService: HeaderService) {}

    ngOnInit() {
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.userFirstName = this.authService.getUserFirstName();
        this.userIsAuthorized = this.authService.getIsAuthorized();
        this.userIsAdmin = this.authService.getIsAdmin();
        this.adminMode = this.headerService.getAdminMode();
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
        this.adminModeSubs = this.headerService
          .getAdminModeStatusListener()
          .subscribe(adminModeStatus => {
              this.adminMode = adminModeStatus;
          })
      }
    
    onToggleAdminMode() {
      this.headerService.toggleAdminMode();
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