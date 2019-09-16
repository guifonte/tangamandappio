import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HeaderService{
    private adminMode = false;
    private adminModeStatusListener = new Subject<boolean>();

    getAdminMode() {
        return this.adminMode
    }

    getAdminModeStatusListener() {
        return this.adminModeStatusListener
    }
    toggleAdminMode() {
        this.adminMode = !this.adminMode
        this.adminModeStatusListener.next(this.adminMode)
    }
}