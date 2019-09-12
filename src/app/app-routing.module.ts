import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskCreateComponent } from './tasks/task-create/task-create.component';

import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { WaitComponent } from './wait/wait.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'wait', component: WaitComponent },
    { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
    { path: 'tasks/create', component: TaskCreateComponent, canActivate: [AuthGuard] },
    { path: 'tasks/edit/:taskId', component: TaskCreateComponent, canActivate: [AuthGuard] },
    { path: 'auth', loadChildren: "./auth/auth.module#AuthModule"}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})

export class AppRoutingModule{}