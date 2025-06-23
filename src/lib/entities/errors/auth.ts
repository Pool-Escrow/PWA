export class AuthenticationError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = 'AuthenticationError'
    }
}

export class UnauthenticatedError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = 'UnauthenticatedError'
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = 'UnauthorizedError'
    }
}

export class TokenExpiredError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = 'TokenExpiredError'
    }
}
