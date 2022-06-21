export interface User {
    uuid?: string;
    name: string;
    email: string;
    password: string;
    status?: UserStatusEnum;
}

enum UserStatusEnum {
    ACTIVE,
    INACTIVE
}
