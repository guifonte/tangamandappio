import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AngularMaterialModule } from '../angular-material.module';
import { UsersComponent } from './users/users.component';

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent,
        UsersComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AngularMaterialModule
    ]
})
export class AuthModule {}