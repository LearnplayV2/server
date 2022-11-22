import type { Request } from 'express';



export interface RequestGroup extends Request  {
    params: {
        page: string,
        title?: string
    }
}

export enum GroupVisibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}
