import { Component, OnInit} from '@angular/core';
import { NgForm} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Task } from '../task.model';
import { TasksService } from '../task.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MemberData } from 'src/app/auth/member-data.model';


@Component({
    selector: 'app-task-create',
    templateUrl: './task-create.component.html',
    styleUrls: ['./task-create.component.css']
})
export class TaskCreateComponent implements OnInit{
    enteredName = '';
    enteredDescription = '';
    task: Task;
    isLoading = false;
    private mode = 'create'
    private taskId: string;

    displayedColumns: string[] = ['selected','firstName','lastName']
    dataSource: MemberData[] = [];

    constructor(public tasksService: TasksService, public route: ActivatedRoute, private authService: AuthService) {}

    ngOnInit() {
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if(paramMap.has('taskId')) {
                this.mode = 'edit';
                this.taskId = paramMap.get('taskId')
                this.isLoading = true;
                this.tasksService.getTask(this.taskId).subscribe(taskData => {
                    //this.task = {id: taskData._id, name: taskData.name, description: taskData.description, members: taskData.members }
                    this.isLoading = false;
                })
            } else {
                this.mode = 'create';
                this.taskId = null;
                this.authService.getAuthorizedUsers().subscribe(usersData => {
                    this.isLoading = false;
                    this.dataSource = usersData.map(user => {
                        return {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            selected: false
                        }
                    })
                })
            }
        });
    }

    onSaveTask(form: NgForm) {
        if (form.invalid) {
            return;
        }
        //this.isLoading = true;

        if (this.mode === 'create') {
            this.tasksService.addTask(form.value.name, form.value.description, this.dataSource);
        } else { 
            this.tasksService.updateTask(this.taskId, form.value.name, form.value.description, this.dataSource);
        }
        //form.resetForm();
    }
}