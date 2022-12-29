export interface RequestGroup  {
    query: {
        page: number,
        title?: string
    }
}

export enum GroupVisibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}
