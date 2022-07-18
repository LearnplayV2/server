import type { Request } from 'express';

export interface RequestGroup extends Request {
}

export enum GroupVisibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}
