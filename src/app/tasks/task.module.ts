import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskListComponent } from './task-list/task-list.component';
import { AngularMaterialModule } from '../angular-material.module';

@NgModule({
    declarations: [
        TaskCreateComponent,
        TaskListComponent
    ],
    imports: [
        CommonModule,
        AngularMaterialModule,
        FormsModule,
        RouterModule
    ]
})
export class TaskModule {}