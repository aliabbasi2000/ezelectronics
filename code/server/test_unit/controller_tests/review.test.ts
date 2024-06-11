import { test, expect, jest, afterEach } from "@jest/globals";
import { User, Role } from "../../src/components/user";
import ReviewDAO from "../../src/dao/reviewDAO";
import ReviewController from "../../src/controllers/reviewController";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";
import { ProductNotFoundError } from "../../src/errors/productError";
import { fail } from "assert";
import { ProductReview } from "../../src/components/review";

jest.mock("../../src/db/db.ts");

afterEach(() => {
    jest.clearAllMocks();
});

const user = new User("testUser", "Test", "User", Role.CUSTOMER, "123 Test St", "2000-01-01");

const review = {
    model: "testModel",
    user: user,
    score: 5,
    comment: "Great product!"
};

const model = "testModel";

// add a review successfully
test("addReview successfully", async () => {
    const controller = new ReviewController();
    jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValueOnce();
    const response = await controller.addReview(
        review.model,
        review.user,
        review.score,
        review.comment
    );
    expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(
        review.model,
        review.user,
        review.score,
        review.comment
    );
    expect(response).not.toBeInstanceOf(Error);
});

// add a review that already exists
test("addReview: it should return an ExistingReviewError", async () => {
    const controller = new ReviewController();
    jest.spyOn(ReviewDAO.prototype, "addReview").mockRejectedValueOnce(new ExistingReviewError());

    let err;
    try {
        await controller.addReview(
            review.model,
            review.user,
            review.score,
            review.comment
        );
        fail();
    } catch (error) {
        err = error;
    }

    expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(
        review.model,
        review.user,
        review.score,
        review.comment
    );
    expect(err).toBeInstanceOf(ExistingReviewError);
});

// get reviews for a product successfully
test("getProductReviews successfully", async () => {
    const reviews: ProductReview[] = [{ product_model: "iPhone13", user: user.name + user.surname, score: 5, date: "2024-05-02", comment: "A very cool smartphone!" }];
    jest.spyOn(ReviewDAO.prototype, "getProductReviews").mockResolvedValueOnce(reviews);

    const controller = new ReviewController();
    const response = await controller.getProductReviews(model);

    expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith(model);
    expect(response).toBeInstanceOf(Array);
});

// delete the review made by the current user for a specific product successfully
test("deleteReview successfully", async () => {
    jest.spyOn(ReviewDAO.prototype, "deleteReview").mockResolvedValueOnce();
    const controller = new ReviewController();
    const response = await controller.deleteReview(review.model, review.user);

    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(review.model, review.user);
    expect(response).not.toBeInstanceOf(Error);
});

// Product-not-found error while deleting the review made by the current user for a specific product
test("deleteReview: it should return a ProductNotFoundError", async () => {
    const controller = new ReviewController();
    jest.spyOn(ReviewDAO.prototype, "deleteReview").mockRejectedValueOnce(new ProductNotFoundError());

    let err;
    try {
        await controller.deleteReview(review.model, review.user);
        fail();
    } catch (error) {
        err = error;
    }

    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(review.model, review.user);
    expect(err).toBeInstanceOf(ProductNotFoundError);
});

// No-review-for-this-product-by-this-user error while deleting the review made by the current user for a specific product
test("deleteReview: it should return a NoReviewProductError", async () => {
    const controller = new ReviewController();
    jest.spyOn(ReviewDAO.prototype, "deleteReview").mockRejectedValueOnce(new NoReviewProductError());

    let err;
    try {
        await controller.deleteReview(review.model, review.user);
        fail();
    } catch (error) {
        err = error;
    }

    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(review.model, review.user);
    expect(err).toBeInstanceOf(NoReviewProductError);
});

// delete all reviews of a product successfully
test("deleteReviewsOfProduct successfully", async () => {
    jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce();
    const controller = new ReviewController();
    const response = await controller.deleteReviewsOfProduct(model);

    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(model);
    expect(response).not.toBeInstanceOf(Error);
});

// Product Not Found Error while deleting all reviews of a product
test("deleteReviewsOfProduct: it should return a ProductNotFoundError", async () => {
    const controller = new ReviewController();
    jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct").mockRejectedValueOnce(new ProductNotFoundError());

    let err;
    try {
        await controller.deleteReviewsOfProduct(model);
        fail();
    } catch (error) {
        err = error;
    }

    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(model);
    expect(err).toBeInstanceOf(ProductNotFoundError);
});

// deleteAllReviews successfully
test("deleteAllReviews successfully", async () => {
    jest.spyOn(ReviewDAO.prototype, "deleteAllReviews").mockResolvedValueOnce();
    const controller = new ReviewController();
    const response = await controller.deleteAllReviews();

    expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledWith();
    expect(response).not.toBeInstanceOf(Error);
});
