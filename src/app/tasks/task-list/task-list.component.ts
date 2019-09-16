import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Task } from '../task.model';
import { TasksService } from '../task.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserData } from 'src/app/auth/user-data.model';
import { HeaderService } from 'src/app/header/header.service';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.css']
})

export class TaskListComponent implements OnInit, OnDestroy {
    /* tasks = [
        { title: 'Louça', description: 'Sua vez!' },
        { title: 'Café', description: 'Não é sua vez!' },
        { title: 'Lixo', description: 'Não é sua vez!' }
    ]; */
    tasks: Task[] = [];
    tasksCompl: {task: Task, inCharge: {id: string, nickname: string}}[]
    isLoading = false;
    userIsAuthenticated = false;
    userIsAdmin = false;
    adminMode = false;
    yourId;

    private tasksSub: Subscription;
    private authStatusSub: Subscription;
    private adminStatusSub: Subscription;
    private adminModeSub: Subscription;

    constructor(
        public tasksService: TasksService,
        private authService: AuthService, 
        public headerService: HeaderService) {}

    ngOnInit() {
        this.isLoading = true;
        this.adminMode = this.headerService.getAdminMode();
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.userIsAdmin = this.authService.getIsAdmin();
        this.yourId = this.authService.getUserId()
        this.tasksService.getTasks();

        this.tasksSub = this.tasksService.getTaskUpdateListener()
            .subscribe((tasks: any[]) => {
                this.tasks = tasks;
                this.tasksCompl = tasks.map(task => {
                    let inChargeMember = task.members.find(member => {return member.userId == task.inCharge})
                    return {
                        task: task,
                        inCharge: {
                            id: task.inCharge,
                            nickname: inChargeMember.nickname
                        }
                    }
                })
                this.isLoading = false;
        });

        this.authStatusSub = this.authService
            .getAuthStatusListener()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });

        this.adminStatusSub = this.authService
        .getAdminStatusListener()
        .subscribe(isAdmin => {
            this.userIsAdmin = isAdmin;
        });

        this.adminModeSub = this.headerService
            .getAdminModeStatusListener()
            .subscribe(adminModeStatus => {
                this.adminMode = adminModeStatus;
            })
    }

    onMakeTask(taskId: string) {
        this.tasksService.makeTask(taskId);
    }

    onDelete(taskId: string) {
        this.tasksService.deleteTask(taskId);
    }

    ngOnDestroy() {
        this.tasksSub.unsubscribe();
        this.authStatusSub.unsubscribe();
        this.adminStatusSub.unsubscribe();
        this.adminModeSub.unsubscribe();
    }
}