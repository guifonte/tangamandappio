import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Location } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'tangamandapp';
  location: Location;
  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (environment.production) {
      if (location.protocol === 'http:') {
       window.location.href = location.href.replace('http', 'https');
      }
    }
    this.authService.autoAuthUser();
  }
}
