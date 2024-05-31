import express, { Router } from "express"
import ErrorHandler from "../helper"
import { body, param, query } from "express-validator"
import ProductController from "../controllers/productController"
import Authenticator from "./auth"
import { Product } from "../components/product"

/**
 * Represents a class that defines the routes for handling proposals.
 */
class ProductRoutes {
    private controller: ProductController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    /**
     * Constructs a new instance of the ProductRoutes class.
     * @param {Authenticator} authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new ProductController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    /**
     * Returns the router instance.
     * @returns The router instance.
     */
    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the routes for the product router.
     * 
     * @remarks
     * This method sets up the HTTP routes for handling product-related operations such as registering products, registering arrivals, selling products, retrieving products, and deleting products.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     * 
     */
    initRoutes() {

        /**
         * Route for registering the arrival of a set of products.
         * It requires the user to be logged in and to be a manager.
         * It requires the following parameters:
         * - model: string. It cannot be empty and it cannot be repeated in the database.
         * - category: string (one of "Smartphone", "Laptop", "Appliance")
         * - quantity: number. It must be greater than 0.
         * - details: string. It can be empty.
         * - sellingPrice: number. It must be greater than 0.
         * - arrivalDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD that is not after the current date
         * It returns a 200 status code if the arrival was registered successfully.
         */
        this.router.post(
            "/",
            (req: any, res: any, next: any) => this.controller.registerProducts(req.body.model, req.body.category, req.body.quantity, req.body.details, req.body.sellingPrice, req.body.arrivalDate)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )




        this.router.post(
            "/",
            async (req: any, res: any, next: any) => {
                try {
                    const { model, category, quantity, details, sellingPrice, arrivalDate } = req.body;
        
                    // Validate input parameters
                    if (!model || typeof model !== 'string') {
                        throw new ProductNotFoundError('Invalid or missing model');
                    }
        
                    if (!category || !["Smartphone", "Laptop", "Appliance"].includes(category)) {
                        throw new ProductNotFoundError('Invalid or missing category');
                    }
        
                    if (typeof quantity !== 'number' || quantity <= 0) {
                        throw new LowProductStockError('Invalid or missing quantity');
                    }
        
                    if (typeof sellingPrice !== 'number' || sellingPrice <= 0) {
                        throw new EmptyProductStockError('Invalid or missing sellingPrice');
                    }
        
                    if (arrivalDate) {
                        const parsedDate = new Date(arrivalDate);
                        const currentDate = new Date();
                        if (isNaN(parsedDate.getTime()) || parsedDate > currentDate) {
                            throw new ProductSoldError('Invalid or future arrivalDate');
                        }
                    }
        
                    // Proceed with controller method if validation passes
                    await this.controller.registerProducts(req.body.model, req.body.category, req.body.quantity, req.body.details, req.body.sellingPrice, req.body.arrivalDate);
                    res.status(200).end();
                } catch (error) {
                    if (error instanceof ProductNotFoundError || error instanceof ProductAlreadyExistsError || error instanceof ProductSoldError || error instanceof EmptyProductStockError || error instanceof LowProductStockError) {
                        res.status(error.customCode).json({ error: error.customMessage });
                    } else {
                        next(error);
                    }
                }
            }
        );

        /**
         * Route for registering the increase in quantity of a product.
         * It requires the user to be logged in and to be a manager.
         * It requires the product model as a request parameter. The model must be a string and cannot be empty, and it must represent an existing product.
         * It requires the following body parameters:
         * - quantity: number. It must be greater than 0. This number represents the increase in quantity, to be added to the existing quantity.
         * - changeDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD that is not after the current date and is after the arrival date of the product.
         * It returns the new quantity of the product.
         */
        this.router.patch(
            "/:model",
            (req: any, res: any, next: any) => this.controller.changeProductQuantity(req.params.model, req.body.quantity, req.body.changeDate)
                .then((quantity: any /**number */) => res.status(200).json({ quantity: quantity }))
                .catch((err) => next(err))
        )
        this.router.patch(
            "/:model",
            // Validate request parameters and body
            param('model').isString().notEmpty().withMessage('Invalid or missing model'),
            body('quantity').isInt({ gt: 0 }).withMessage('Invalid or missing quantity'),
            body('changeDate')
                .optional()
                .isISO8601().withMessage('Invalid changeDate format')
                .custom((value, { req }) => {
                    const currentDate = new Date().toISOString().split('T')[0]; // current date in YYYY-MM-DD format
                    if (value && value > currentDate) {
                        throw new Error('changeDate cannot be after the current date');
                    }
                    return true;
                }),
            (req: any, res: any, next: any) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        return res.status(422).json({ errors: errors.array() });
                    }
        
                    const { model } = req.params;
                    const { quantity, changeDate } = req.body;
        
                    // Proceed with controller method if validation passes
                    this.controller.changeProductQuantity(model, quantity, changeDate)
                        .then((newQuantity: any) => res.status(200).json({ quantity: newQuantity }))
                        .catch((error: any) => {
                            if (error instanceof ProductNotFoundError || error instanceof LowProductStockError || error instanceof ProductSoldError) {
                                res.status(error.customCode).json({ error: error.customMessage });
                            } else {
                                next(error);
                            }
                        });
                } catch (error) {
                    next(error);
                }
            }
        );


        /**
         * Route for selling a product.
         * It requires the user to be logged in and to be a manager.
         * It requires the product model as a request parameter. The model must be a string and cannot be empty, and it must represent an existing product.
         * It requires the following body parameters:
         * - quantity: number. It must be greater than 0. This number represents the quantity of units sold. It must be less than or equal to the available quantity of the product.
         * - sellingDate: string. It can be omitted. If present, it must be a valid date in the format YYYY-MM-DD that is not after the current date and is after the arrival date of the product.
         * It returns the new quantity of the product.
         */
        this.router.patch(
            "/:model/sell",
            (req: any, res: any, next: any) => this.controller.sellProduct(req.params.model, req.body.quantity, req.body.sellingDate)
                .then((quantity: any /**number */) => res.status(200).json({ quantity: quantity }))
                .catch((err) => {
                    console.log(err)
                    next(err)
                })
        )
        this.router.patch(
            "/:model/sell",
            async (req: any, res: any, next: any) => {
                try {
                    // Validate request parameters
                    const model = req.params.model;
                    const { quantity, sellingDate } = req.body;
        
                    // Check if model is a non-empty string
                    if (!model || typeof model !== 'string') {
                        throw new Error("Model must be a non-empty string");
                    }
        
                    // Check if quantity is a positive number
                    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
                        throw new Error("Quantity must be a positive number");
                    }
        
                    // Check if sellingDate is a valid date in the format YYYY-MM-DD
                    if (sellingDate && !/^\d{4}-\d{2}-\d{2}$/.test(sellingDate)) {
                        throw new Error("Selling date must be a valid date in the format YYYY-MM-DD");
                    }
        
                    // Call the controller method
                    const newQuantity = await this.controller.sellProduct(model, quantity, sellingDate);
        
                    // Send response with the new quantity
                    res.status(200).json({ quantity: newQuantity });
                } catch (error) {
                    // Handle specific product errors
                    if (error instanceof ProductNotFoundError ||
                        error instanceof EmptyProductStockError ||
                        error instanceof LowProductStockError) {
                        res.status(error.customCode).json({ error: error.customMessage });
                    } else {
                        // Pass other errors to the error handling middleware
                        next(error);
                    }
                }
            }
        );

        /**
         * Route for retrieving all products.
         * It requires the user to be logged in and to be either an admin or a manager
         * It can have the following optional query parameters:
         * - grouping: string. It can be either "category" or "model". If absent, then all products are returned and the other query parameters must also be absent.
         * - category: string. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
         * - model: string. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
         * It returns an array of Product objects.
         */
        this.router.get(
            "/",
            (req: any, res: any, next: any) => this.controller.getProducts(req.query.grouping, req.query.category, req.query.model)
                .then((products: any /*Product[]*/) => res.status(200).json(products))
                .catch((err) => {
                    console.log(err)
                    next(err)
                })
        )
        this.router.get(
            "/",
            async (req: any, res: any, next: any) => {
                const { grouping, category, model } = req.query;
        
                // Input validation
                try {
                    if (grouping === undefined) {
                        if (category !== undefined || model !== undefined) {
                            throw new Error('422: Invalid parameters - grouping is null but category or model is provided');
                        }
                    } else if (grouping === 'category') {
                        if (category === undefined || !['Smartphone', 'Laptop', 'Appliance'].includes(category) || model !== undefined) {
                            throw new Error('422: Invalid parameters - for category grouping, category must be one of ["Smartphone", "Laptop", "Appliance"] and model must be null');
                        }
                    } else if (grouping === 'model') {
                        if (model === undefined || model === '' || category !== undefined) {
                            throw new Error('422: Invalid parameters - for model grouping, model must be provided and not empty, and category must be null');
                        }
                    } else {
                        throw new Error('422: Invalid parameters - grouping must be either "category" or "model"');
                    }
        
                    const products = await getProducts(grouping || null, category || null, model || null);
                    res.status(200).json(products);
                } catch (err) {
                    if (err instanceof ProductNotFoundError) {
                        res.status(err.customCode).json({ message: err.customMessage });
                    } else if (err.message.startsWith('422:')) {
                        res.status(422).json({ message: err.message });
                    } else {
                        console.error(err);
                        res.status(500).json({ message: 'Internal Server Error' });
                    }
                }
            }
        );

        /**
         * Route for retrieving all available products.
         * It requires the user to be logged in and to be a customer.
         * It can have the following optional query parameters:
         * - grouping: string. It can be either "category" or "model". If absent, then all products are returned and the other query parameters must also be absent.
         * - category: string. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
         * - model: string. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
         * It returns an array of Product objects.
         */
        this.router.get(
            "/available",
            (req: any, res: any, next: any) => this.controller.getAvailableProducts(req.query.grouping, req.query.category, req.query.model)
                .then((products: any/*Product[]*/) => res.status(200).json(products))
                .catch((err) => next(err))
        )
        this.router.get(
            "/available",
            async (req: any, res: any, next: any) => {
                try {
                    const { grouping, category, model } = req.query;

                    // Validate input parameters
                    if (grouping === undefined) {
                        if (category !== undefined || model !== undefined) {
                            throw new ValidationError('If grouping is null, both category and model must also be null.');
                        }
                    } else if (grouping === 'category') {
                        if (category === undefined || model !== undefined) {
                            throw new ValidationError('If grouping is category, category cannot be null and model must be null.');
                        }
                        if (!['Smartphone', 'Laptop', 'Appliance'].includes(category)) {
                            throw new ValidationError('Invalid category value. Must be one of "Smartphone", "Laptop", "Appliance".');
                        }
                    } else if (grouping === 'model') {
                        if (model === undefined || category !== undefined) {
                            throw new ValidationError('If grouping is model, model cannot be null and category must be null.');
                        }
                        if (model.trim() === '') {
                            throw new ValidationError('Model cannot be empty.');
                        }
                    } else {
                        throw new ValidationError('Invalid grouping parameter.');
                    }

                    // Call the controller method
                    const products = await this.controller.getAvailableProducts(grouping || null, category || null, model || null);
                    res.status(200).json(products);
                } catch (err) {
                    if (err instanceof ProductNotFoundError || err instanceof ValidationError) {
                        res.status(err.customCode).json({ error: err.customMessage });
                    } else {
                        next(err);
                    }
                }
            }
        );
    



        /**
         * Route for deleting all products.
         * It requires the user to be logged in and to be either an admin or a manager.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.controller.deleteAllProducts()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )
        this.router.delete(
            "/:model",
            validateModelParameter,
            async (req, res, next) => {
                const model = req.params.model;
                try {
                    await this.controller.deleteAllProducts(model);
                    res.status(200).end();
                } catch (err) {
                    if (err instanceof ProductNotFoundError) {
                        res.status(err.customCode).json({ error: err.customMessage });
                    } else {
                        next(err);
                    }
                }
            }
        );

        /**
         * Route for deleting a product.
         * It requires the user to be logged in and to be either an admin or a manager.
         * It requires the product model as a request parameter. The model must be a string and cannot be empty, and it must represent an existing product.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/:model",
            (req: any, res: any, next: any) => this.controller.deleteProduct(req.params.model)
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )


    }
    
}

export default ProductRoutes