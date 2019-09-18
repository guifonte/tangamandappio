import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AngularMaterialModule } from '../angular-material.module';
import { UsersComponent } from './users/users.component';
import { PasswordComponent } from './password/password.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent,
        UsersComponent,
        PasswordComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AngularMaterialModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class AuthModule {}