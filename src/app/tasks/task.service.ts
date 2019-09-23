import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from "../../environments/environment"
import { Task } from './task.model';
import { MemberData } from '../auth/member-data.model';

const BACKEND_URL = environment.apiURL + "/tasks/"

@Injectable({ providedIn: 'root' })
export class TasksService {
    private tasks: Task[] = [];
    private tasksUpdated = new Subject<Task[]>();

    constructor(private http: HttpClient, private router: Router) { }

    getTasks() {
        this.http
            .get<{ message: string, tasks: any }>(
                BACKEND_URL
                )
            .pipe(map((taskData) => {
                return taskData.tasks.map(task => {
                    return{
                        name: task.name,
                        description: task.description,
                        inCharge: task.inCharge,
                        members: task.members.sort((a,b)=>a.position-b.position),
                        id: task._id
                    };
                });
            }))
            .subscribe(transformedTasks => {
                this.tasks = transformedTasks;
                this.tasksUpdated.next([...this.tasks]);
            });
    }

    getTaskUpdateListener() {
        return this.tasksUpdated.asObservable();
    }

    getTask(id: string) {
        return this.http.get<{ _id: string, name: string, description: string, members: MemberData[] }>(BACKEND_URL + id);
    }

    addTask(name: string, description: string, users: any) {
        //const task: Task = { id: null, name: name, description: description, members: members };

        let membersId = users.map(member => {
            if(member.selected == true) return { id: member.id }
        }).filter(id => {
            return id != null
        });

        const sendTask: any = { id: null, name: name, description: description, members: membersId };
        
         this.http.post<{message: string, taskId: string, inCharge: string, members: MemberData[]}>(BACKEND_URL, sendTask)
            .subscribe((responseData)=>{
                const task: Task = { id: responseData.taskId, 
                            name: name,
                            description: description, 
                            members: responseData.members,
                            inCharge: responseData.inCharge };

                this.tasks.push(task);
                this.tasksUpdated.next([...this.tasks]);
                this.router.navigate(["/tasks"]);
            });
    }

    updateTask( id: string, name: string, description: string, users: any ) {

        let membersId = users.map(member => {
            if(member.selected == true) return { id: member.id }
        }).filter(id => {
            return id != null
        });

        const sendTask: any = { id: id, name: name, description: description, members: membersId };
        this.http.put<{message: string, taskId: string, inCharge: string, members: MemberData[]}>(BACKEND_URL + id, sendTask)
            .subscribe((responseData) => {
                const task: Task = { id: responseData.taskId, 
                    name: name,
                    description: description, 
                    members: responseData.members,
                    inCharge: responseData.inCharge };
                const updatedTasks = [...this.tasks];
                const oldTaskIndex = updatedTasks.findIndex(t => t.id === task.id);
                updatedTasks[oldTaskIndex] = task;
                this.tasks = updatedTasks;
                this.tasksUpdated.next([...this.tasks]);
                this.router.navigate(["/tasks"]);
            });
    }

    deleteTask(taskId: string) {
        this.http.delete(BACKEND_URL + taskId)
            .subscribe(() => {
                const updatedTasks = this.tasks.filter(task => task.id !== taskId)
                this.tasks = updatedTasks;
                this.tasksUpdated.next([...this.tasks]);
                console.log('Deleted!');
            })
    }

    makeTask(taskId: string, userId: string) {
        let date = new Date
        this.http.post<{message: string, inCharge: string, jumpedIds: string[]}>(BACKEND_URL + "make/", {taskId: taskId, date: date, userId: userId})
            .subscribe((responseData) => {
                const updatedTasks = [...this.tasks];
                const oldTaskIndex = updatedTasks.findIndex(t => t.id === taskId);
                updatedTasks[oldTaskIndex].inCharge = responseData.inCharge;
                responseData.jumpedIds.forEach(id => {
                    let index = updatedTasks[oldTaskIndex].members.findIndex(member =>{return member.userId == id})
                    if(index != undefined) updatedTasks[oldTaskIndex].members[index].madeInAdvance = false
                });
                this.tasks = updatedTasks
                this.tasksUpdated.next([...this.tasks])
                console.log('Task made!')
            }
        )
    }

    makeTaskInAdvance(taskId: string, userId: string) {
        let date = new Date
        this.http.post<{message: string, inAdvanceId: string}>(BACKEND_URL + "makeinadvance/", {taskId: taskId, date: date, userId: userId})
            .subscribe((responseData) => {
                const updatedTasks = [...this.tasks];
                const oldTaskIndex = updatedTasks.findIndex(t => t.id === taskId);
                const memberId = updatedTasks[oldTaskIndex].members.findIndex(member => member.userId == responseData.inAdvanceId)
                updatedTasks[oldTaskIndex].members[memberId].madeInAdvance = true;
                this.tasks = updatedTasks
                this.tasksUpdated.next([...this.tasks])
                console.log('Task made in advance!')
            }
        )
    }

    unmakeTask(taskId: string, userId: string) {
        let date = new Date
        this.http.post<{message: string, inCharge: string}>(BACKEND_URL + "unmake/", {taskId: taskId, date: date, userId: userId})
            .subscribe((responseData) => {
                const updatedTasks = [...this.tasks];
                const oldTaskIndex = updatedTasks.findIndex(t => t.id === taskId);
                updatedTasks[oldTaskIndex].inCharge = responseData.inCharge;
                this.tasks = updatedTasks
                this.tasksUpdated.next([...this.tasks])
                console.log('Task made!')
            }
        )
    }

    unmakeTaskInAdvance(taskId: string, userId: string) {
        let date = new Date
        this.http.post<{message: string, inAdvanceId: string}>(BACKEND_URL + "unmakeinadvance/", {taskId: taskId, date: date, userId: userId})
            .subscribe((responseData) => {
                const updatedTasks = [...this.tasks];
                const oldTaskIndex = updatedTasks.findIndex(t => t.id === taskId);
                const memberId = updatedTasks[oldTaskIndex].members.findIndex(member => member.userId == responseData.inAdvanceId)
                updatedTasks[oldTaskIndex].members[memberId].madeInAdvance = false;
                this.tasks = updatedTasks
                this.tasksUpdated.next([...this.tasks])
                console.log('Task made in advance was unmade!')
            }
        )
    }
}