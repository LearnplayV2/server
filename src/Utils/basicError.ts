const BasicError = (message: string, status: number = 500) => { 

    return {message: message, status: status};
};

export {BasicError};
