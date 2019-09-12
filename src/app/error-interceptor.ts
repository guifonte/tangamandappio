import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from './error/error.component';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog, private router: Router) {}
  openDialog = true;

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "An unknow error occurred!";
        if(error.error.message) {
          errorMessage = error.error.message;
        }

        if (errorMessage == 'Admin Auth failed!') this.router.navigate(["/tasks"]);
        if (errorMessage == 'Você ainda não foi aceito pelo administrador') {
          this.router.navigate(["/wait"]);
          this.openDialog = false;
        }

        if (this.openDialog) this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
        return throwError(error);
      })
    );
  }
}
