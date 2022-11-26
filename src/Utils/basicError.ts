const BasicError = (message: string, status: number = 500) => { 

    return {message: message};
};

export {BasicError};
