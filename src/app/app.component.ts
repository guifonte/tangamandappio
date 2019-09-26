import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Location } from '@angular/common';
import { environment } from '../environments/environment';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'tangamandappio';
  location: Location;
  constructor(private authService: AuthService, private swUpdate: SwUpdate) {}

  ngOnInit() {
    if (environment.production) {
      if (location.protocol === 'http:') {
       window.location.href = location.href.replace('http', 'https');
      }
    }
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(event => {
        if (confirm("Nova versão está disponível! Deseja carrega-la?")) {
          window.location.reload();
        }
      });
    }

    this.authService.autoAuthUser();
  }
}
