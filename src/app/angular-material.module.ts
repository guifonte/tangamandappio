import { NgModule } from "@angular/core";
import { MatInputModule, MatCardModule, MatButtonModule, MatToolbarModule, MatExpansionModule, MatProgressSpinnerModule, MatDialogModule, MatTableModule, MatCheckboxModule, MatListModule } from '@angular/material';

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
        MatListModule
    ]
})
export class AngularMaterialModule {}