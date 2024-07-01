const WRONG_PARAMETERS = "API called with wrong or missing parameters";

/**
 * Represents an error that occurs when a cart is not found.
 */
class WrongParametersError extends Error {
    customMessage: string
    customCode: number

    constructor() {
        super()
        this.customMessage = WRONG_PARAMETERS
        this.customCode = 422
    }
}

export { WrongParametersError }