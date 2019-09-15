import { NgModule } from "@angular/core";
<<<<<<< HEAD
import { MatInputModule, MatCardModule, MatButtonModule, MatToolbarModule, MatExpansionModule, MatProgressSpinnerModule, MatDialogModule, MatTableModule, MatCheckboxModule, MatListModule, MatSidenavModule, MatIconModule } from '@angular/material';
=======
import { MatInputModule, MatCardModule, MatButtonModule, MatToolbarModule, MatExpansionModule, MatProgressSpinnerModule, MatDialogModule, MatTableModule, MatCheckboxModule, MatListModule, MatButtonToggleModule } from '@angular/material';
>>>>>>> master

@NgModule({
    exports: [
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        MatToolbarModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatTableModule,
        MatCheckboxModule,
        MatListModule,
<<<<<<< HEAD
        MatSidenavModule,
        MatIconModule
=======
        MatButtonToggleModule
>>>>>>> master
    ]
})
export class AngularMaterialModule {}