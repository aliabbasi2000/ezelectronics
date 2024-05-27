import express, { Router } from "express"
import ErrorHandler from "../helper"
import { body, param } from "express-validator"
import CartController from "../controllers/cartController"
import Authenticator from "./auth"
import { Cart } from "../components/cart"
import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError } from "../errors/cartError";
import { ProductNotFoundError, ProductAlreadyExistsError, ProductSoldError, EmptyProductStockError, LowProductStockError } from "../errors/productError";


/**
 * Represents a class that defines the routes for handling carts.
 */
class CartRoutes {
    private controller: CartController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    /**
     * Constructs a new instance of the CartRoutes class.
     * @param {Authenticator} authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new CartController()
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
     * Initializes the routes for the cart router.
     * 
     * @remarks
     * This method sets up the HTTP routes for creating, retrieving, updating, and deleting cart data.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {




        /**
         * Route for getting the cart of the logged in customer.
         * It requires the user to be logged in and to be a customer.
         * It returns the cart of the logged in customer.
         */
        this.router.get(
            "/",
            (req: any, res: any, next: any) => {
                // Check if the user is authenticated and has the role of "Customer"
                if (!req.user) {
                    return next(new Error('Unauthorized')); 
                }
                if (req.user.role !== 'Customer') {
                    return next(new Error('Forbidden'));
                }
                next();
            },
            (req: any, res: any, next: any) => this.controller.getCart(req.user)
                .then((cart: any /**Cart */) => {
                    // Handle empty cart case
                    if (!cart.products || cart.products.length === 0) {
                        return next(new EmptyCartError());
                    }
                    res.status(200).json(cart);
                })
                .catch((err) => {
                    if (err instanceof CartNotFoundError) {
                        next(new CartNotFoundError());
                    } else if (err instanceof WrongUserCartError) {
                        next(new WrongUserCartError());
                    } else {
                        next(err);
                    }
                })
        );



        /**
         * Route for adding a product unit to the cart of the logged in customer.
         * It requires the user to be logged in and to be a customer.
         * It requires the following body parameters:
         * - model: string. It cannot be empty, it must represent an existing product model, and the product model's available quantity must be above 0
         * It returns a 200 status code if the product was added to the cart.
         */
        this.router.post(
            "/",
            body("model").isString().isLength({ min: 1 }),
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    if (!req.user || req.user.role !== 'Customer') {
                        return next(new Error('Unauthorized or Forbidden'));
                    }
                    await this.controller.addToCart(req.user, req.body.model);
                    res.status(200).end();
                } catch (err) {
                    if (err instanceof ProductNotFoundError || err instanceof EmptyProductStockError) {
                        res.status(err.customCode).json({ message: err.customMessage });
                    } else {
                        next(err);
                    }
                }
            }
        );




        /**
         * Route for checking out the cart of the logged in customer.
         * It requires the user to be logged in and to be a customer.
         * It returns a 200 status code if the cart was checked out.
         * It fails if the cart is empty, there is no current cart in the database, or at least one of the products in the cart is not available in the required quantity.
         */
        this.router.patch(
            "/",
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    if (!req.user || req.user.role !== 'Customer') {
                        throw new WrongUserCartError();
                    }
                    await this.controller.checkoutCart(req.user);
                    res.status(200).end();
                } catch (err) {
                    if (err instanceof CartNotFoundError || err instanceof EmptyCartError || err instanceof ProductNotFoundError || err instanceof EmptyProductStockError || err instanceof LowProductStockError) {
                        res.status(err.customCode).json({ message: err.customMessage });
                    } else {
                        next(err);
                    }
                }
            }
        );





        /**
         * Route for getting the history of the logged in customer's carts.
         * It requires the user to be logged in and to be a customer.
         * It returns the history of the logged in customer's carts (only carts that have been paid for are returned - the current cart is not included in the list).
         */
        
        this.router.get(
            "/history",
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    if (!req.user || req.user.role !== 'Customer') {
                        throw new WrongUserCartError(); 
                    }

                    const carts = await this.controller.getCustomerCarts(req.user);
                    if (!carts.length) {
                        throw new CartNotFoundError(); 
                    }

                    res.status(200).json(carts);
                } catch (err) {
                    if (err instanceof CartNotFoundError || err instanceof EmptyCartError || err instanceof WrongUserCartError) {
                        res.status(err.customCode).json({ message: err.customMessage });
                    } else {
                        next(err);
                    }
                }
            }
        );



        

        /**
         * Route for removing a product unit from a cart.
         * It requires the user to be logged in and to be a customer.
         * It requires the model of the product to remove as a route parameter. The model must be a non-empty string, the product must exist, must be in the current cart, and the customer must have a current cart
         * It returns a 200 status code if the product was removed from the cart.
         */
        this.router.delete(
            "/products/:model",
            this.errorHandler.validateRequest,
            async (req: any, res: any, next: any) => {
                try {
                    if (!req.user || req.user.role !== 'Customer') {
                        throw new WrongUserCartError(); // Use custom error for unauthorized access
                    }
                    const model = req.params.model;
                    if (!model) {
                        throw new ProductNotFoundError(); // Use custom error for missing product model
                    }
                    await this.controller.removeProductFromCart(req.user, model);
                    res.status(200).end();
                } catch (err) {
                    if (err instanceof CartNotFoundError || err instanceof ProductNotInCartError || err instanceof ProductNotFoundError) {
                        res.status(err.customCode).json({ message: err.customMessage });
                    } else {
                        next(err);
                    }
                }
            }
        );



        /**
         * Route for removing all products from the current cart.
         * It requires the user to be logged in and to be a customer.
         * It fails if the user does not have a current cart.
         * It returns a 200 status code if the products were removed from the cart.
         */
        this.router.delete(
            "/current",
            (req: any, res: any, next: any) => this.controller.clearCart(req.user)
                .then(() => res.status(200).end())
                .catch((err) => next(err))
        )

        /**
         * Route for deleting all carts.
         * It requires the user to be authenticated and to be either an admin or a manager.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.controller.deleteAllCarts()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for retrieving all carts of all users
         * It requires the user to be authenticated and to be either an admin or a manager.
         * It returns an array of carts.
         */
        this.router.get(
            "/all",
            (req: any, res: any, next: any) => this.controller.getAllCarts()
                .then((carts: any/**Cart[] */) => res.status(200).json(carts))
                .catch((err: any) => next(err))
        )
    }
}

export default CartRoutes