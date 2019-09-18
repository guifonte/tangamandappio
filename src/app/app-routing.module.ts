import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskCreateComponent } from './tasks/task-create/task-create.component';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { WaitComponent } from './wait/wait.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { UsersComponent } from './auth/users/users.component';
import { PasswordComponent } from './auth/password/password.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'wait', component: WaitComponent },
    { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
    { path: 'tasks/create', component: TaskCreateComponent, canActivate: [AuthGuard] },
    { path: 'tasks/edit/:taskId', component: TaskCreateComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'user/edit/:userId', component: SignupComponent, canActivate: [AuthGuard] },
    { path: 'user/password/:userId', component: PasswordComponent, canActivate: [AuthGuard] },
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})

export class AppRoutingModule{}