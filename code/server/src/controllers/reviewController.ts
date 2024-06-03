import { User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";
import { ProductNotFoundError } from "../errors/productError";
import {  UserNotCustomerError }from "../errors/userError"
import { ExistingReviewError, NoReviewProductError }from "../errors/reviewError"

class ReviewController {
    private dao: ReviewDAO

    constructor() {
        this.dao = new ReviewDAO
    }

    /**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    async addReview(model: string, user: User, score: number, comment: string) :Promise<void>  { 

    /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
    if (user.role !== 'Customer') {
        throw new UserNotCustomerError();
    }

    // Check if the product exists
    const product = await ProductDAO.findByModel(model);
    if (!product) {
        throw new ProductNotFoundError();
    }

    // Check if the user has already reviewed the product
    const existingReview = await ReviewDAO.findByUserAndModel(user.id, model);
    if (existingReview) {
        throw new ExistingReviewError();
    }

    // Add the new review
    const review: ProductReview = {
        model,
        userId: user.id,
        score,
        comment,
        date: new Date().toISOString().split('T')[0]
    };

    await ReviewDAO.addReview(review);
}


async getProductReviews(model: string): Promise<ProductReview[]> {
    const product = await ProductDAO.findByModel(model);
    if (!product) {
        throw new ProductNotFoundError();
    }
    const reviews = await ReviewDAO.findByModel(model);
    return reviews;
}
    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
    async deleteReview(model: string, user: User): Promise<void> {
        if (user.role !== 'Customer') {
            throw new UserNotCustomerError();
                }

        // Check if the product exists
        const product = await ProductDAO.findByModel(model);
        if (!product) {
            throw new ProductNotFoundError();
        }

        // Check if the user has a review for the product
        const existingReview = await ReviewDAO.findByUserAndModel(user.id, model);
        if (!existingReview) {
            throw new NoReviewProductError();
        }

        // Delete the review
        await ReviewDAO.deleteReview(user.id, model);
    }
    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
    async deleteReviewsOfProduct(model: string): Promise<void> {
        const product = await ProductDAO.findByModel(model);
        if (!product) {
            throw new ProductNotFoundError();
        }

        await ReviewDAO.deleteAllReviews(model);
    }

    /**
     * Deletes all reviews of all products
     * @returns A Promise that resolves to nothing
     */
    async deleteAllReviews(): Promise<void> {
        await ReviewDAO.deleteAll();
    }
}

export default ReviewController;