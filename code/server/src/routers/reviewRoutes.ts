import express, { Router } from "express"
import ErrorHandler from "../helper"
import { body, param, query } from "express-validator"
import ReviewController from "../controllers/reviewController"
import Authenticator from "./auth"
import { ProductReview } from "../components/review"

class ReviewRoutes {
    private controller: ReviewController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new ReviewController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {

        /**
         * Route for adding a review to a product.
         * It requires the user calling it to be authenticated and to be a customer
         * It expects a product model as a route parameter. This parameter must be a non-empty string and the product must exist.
         * It requires the following body parameters:
         * - score: number. It must be an integer between 1 and 5.
         * - comment: string. It cannot be empty.
         * It returns a 200 status code.
         */
        this.router.post(
            "/:model",
    async (req: any, res: any, next: any) => {
        try {
            const model = req.params.model;
            const { score, comment } = req.body;
            const user = req.user;

            if (!model || typeof model !== 'string') {
                return res.status(400).json({ error: 'Model parameter must be a non-empty string' });
            }

            if (!score || !Number.isInteger(score) || score < 1 || score > 5) {
                return res.status(400).json({ error: 'Score must be an integer between 1 and 5' });
            }

            if (!comment || typeof comment !== 'string' || comment.trim() === '') {
                return res.status(400).json({ error: 'Comment cannot be null or empty' });
            }

            await this.controller.addReview(model, user, score, comment);
            res.status(200).send();
        } catch (err) {
            console.error(err);

            if (err.message === 'Access denied: Only customers can add reviews.') {
                res.status(403).json({ error: err.message });
            } else if (err.message === 'Product not found') {
                res.status(404).json({ error: err.message });
            } else if (err.message === 'Review already exists') {
                res.status(409).json({ error: err.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
);


        /**
         * Route for retrieving all reviews of a product.
         * It requires the user to be authenticathed
         * It expects a product model as a route parameter. This parameter must be a non-empty string and the product must exist.
         * It returns an array of reviews
         */
        this.router.get(
            "/:model",
            async (req: any, res: any, next: any) => {
                try {
                    const model = req.params.model;
                    if (!model || typeof model !== 'string') {
                        return res.status(400).json({ error: 'Model parameter must be a non-empty string' });
                    }
        
                    const reviews = await this.controller.getProductReviews(model);
                    res.status(200).json(reviews);
                } catch (err) {
                    console.error(err);
        
                    if (err.message === 'Product not found') {
                        res.status(404).json({ error: err.message });
                    } else {
                        res.status(500).json({ error: 'Internal server error' });
                    }
                }
            }
        )

        /**
         * Route for deleting the review made by a user for one product.
         * It requires the user to be authenticated and to be a customer
         * It expects a product model as a route parameter. This parameter must be a non-empty string and the product must exist. The user must also have made a review for the product
         * It returns a 200 status code.
         */
        this.router.delete(
            "/:model",
            (req: any, res: any, next: any) => this.controller.deleteReview(req.params.model, req.user)
                .then(() => res.status(200).send())
                .catch((err: Error) => {
                    console.log(err)
                    next(err)
                })
        )

        /**
         * Route for deleting all reviews of a product.
         * It requires the user to be authenticated and to be either an admin or a manager
         * It expects a product model as a route parameter. This parameter must be a non-empty string and the product must exist.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/:model/all",
            (req: any, res: any, next: any) => this.controller.deleteReviewsOfProduct(req.params.model)
                .then(() => res.status(200).send())
                .catch((err: Error) => next(err))
        )

        /**
         * Route for deleting all reviews of all products.
         * It requires the user to be authenticated and to be either an admin or a manager
         * It returns a 200 status code.
         */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.controller.deleteAllReviews()
                .then(() => res.status(200).send())
                .catch((err: Error) => next(err))
        )
    }
}

export default ReviewRoutes;