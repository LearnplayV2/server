import { group_members } from "@prisma/client";
import type { Request } from "express";

export interface User {
    uuid?: string;
    name?: string;
    email?: string;
    password?: string;
    status?: UserStatusEnum;
    socketId?: string;
}

enum UserStatusEnum {
    ACTIVE,
    INACTIVE
}

export interface RequestUser extends Request {
    userLoggedIn: User;
}

export interface RequestMember extends Request {
    groupMember: group_members;
    

}