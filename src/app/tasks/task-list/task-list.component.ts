import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Task } from '../task.model';
import { TasksService } from '../task.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserData } from 'src/app/auth/user-data.model';

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
    tasksCompl: {task: Task, inCharge: {id: string, name: string}}[]
    isLoading = false;
    userIsAuthenticated = false;
    userIsAdmin = false;
    yourId;

    private tasksSub: Subscription;
    private authStatusSub: Subscription;
    private adminStatusSub: Subscription;
    constructor(public tasksService: TasksService, private authService: AuthService) {}

    ngOnInit() {
        this.isLoading = true;
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
                            name: inChargeMember.firstName + ' ' + inChargeMember.lastName
                        }
                    }
                })
                this.isLoading = false;
        });
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authStatusSub = this.authService
            .getAuthStatusListener()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });
        this.userIsAdmin = this.authService.getIsAdmin();
        this.adminStatusSub = this.authService
        .getAdminStatusListener()
        .subscribe(isAdmin => {
            this.userIsAdmin = isAdmin;
        });
        this.yourId = this.authService.getUserId()
    }

    onMakeTask(taskId: string) {
        this.tasksService.makeTask(taskId);
    }

    onDelete(taskId: string) {
        this.tasksService.deleteTask(taskId);
    }

    ngOnDestroy() {
        this.tasksSub.unsubscribe();
    }
}