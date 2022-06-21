interface ResponseErrorProps {
    message: string;
}

class RequestError extends Error {
    public status: number = 500;
    public response: ResponseErrorProps = {
        message: 'Internal Server Error'
    };

    constructor(message?: string, status?: number) {
        super(message);
        this.response.message = message ?? this.response.message;
        this.status = status ?? this.status;
    }
}

interface PrismaErrorProps {
    meta: {
        target: string;
    }
}

class PrismaError extends RequestError {
    constructor(message: PrismaErrorProps, status: number = 500) {
        super(message, status);
        switch(message.meta.target) {
            case 'user_email_key':
                this.response.message = 'Este E-mail já está em uso';
            break;
            default:
                this.response.message = message.meta.target;
        }
    }
}

export { RequestError, PrismaError };