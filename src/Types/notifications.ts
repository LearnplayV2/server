import type { RequestUser } from "./user";

export interface NotificationProps {
    userId: string;
    title: string;
    description?: string;
}

export interface RequestId extends RequestUser {
    id?: number;
}