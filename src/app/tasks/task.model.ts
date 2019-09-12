import { MemberData } from '../auth/member-data.model';

export interface Task {
    id: string;
    name: string;
    description: string;
    inCharge: string;
    members: MemberData[];
}