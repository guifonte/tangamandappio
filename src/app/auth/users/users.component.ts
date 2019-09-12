import { Component, OnInit, OnDestroy } from "@angular/core";
import { UserData } from '../user-data.model';
import { AuthService } from '../auth.service';
import { MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['authorized','admin','email','firstName','lastName']
    dataSource: UserData[] = [];
    //admin = [];
    //authorized = [];
    isLoading = false;
    userIsAdmin = false;

    constructor(public authService: AuthService) {}

    ngOnInit() {
        this.isLoading = true;
        this.authService.getUsers().subscribe(usersData => {
            this.isLoading = false;
            this.dataSource = usersData
            //this.admin = usersData.map(user => user.admin)
            //this.authorized = usersData.map(user => user.authorized)
            //console.log(this.admin)
        })
    }

    onSaveUsers() {
        this.authService.saveUsers(this.dataSource)
    }

    ngOnDestroy() {

    }
}