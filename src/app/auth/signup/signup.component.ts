import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UserData } from '../user-data.model';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  user: UserData;
  isLoading = false;
  mode = 'create';
  userId: string;

  private authStatusSub: Subscription;

  constructor(public authService: AuthService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('userId')) {
        this.mode = 'edit'
        this.userId = paramMap.get('userId')
        this.isLoading = true;
        this.authService.getUser(this.userId).subscribe(userData =>{
          this.user = {userId: userData.user._id, 
                      email: userData.user.email, 
                      firstName: userData.user.firstName, 
                      lastName: userData.user.lastName, 
                      nickname: userData.user.nickname,
                      authorized: null,
                      admin: null}
          this.isLoading = false;
        })
      } else {
        this.mode = 'create'
      }
    })

    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    if(this.mode == 'create') {
      this.authService.createUser(form.value.email, form.value.password, form.value.firstName, form.value.lastName, form.value.nickname);
    } else {
      this.user.email = form.value.email
      this.user.firstName = form.value.firstName
      this.user.lastName = form.value.lastName
      this.user.nickname = form.value.nickname
      this.authService.updateUser(this.user);
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
