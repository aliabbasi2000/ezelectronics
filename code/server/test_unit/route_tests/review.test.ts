import { test, expect, jest } from "@jest/globals";
import request from 'supertest';
import { app } from "../../index";
import ReviewController from "../../src/controllers/reviewController";
import Authenticator from "../../src/routers/auth";
import { User, Role } from "../../src/components/user";

const baseURL = "/ezelectronics/reviews";
jest.mock("../../src/routers/auth");

const testModel = "iPhone13";

const testUser = new User("testUser", "Test", "User", Role.CUSTOMER, "123 Test St", "2000-01-01");
const testUserAdmin = new User("testUserAdmin", "Admin", "User", Role.ADMIN, "123 Admin St", "1990-01-01");

test("It should return a 200 success code when adding a review", async () => {
    const testReview = {
        score: 5,
        comment: "A very cool smartphone!"
    };

    jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce();
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testUser;
        next();
    });
    jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => next());

    const response = await request(app)
        .post(`${baseURL}/${testModel}`)
        .send(testReview);

    expect(response.status).toBe(200);
    expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
    expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
        testModel,
        testUser,
        testReview.score,
        testReview.comment
    );
});

test("It should return a 200 success code and an array of reviews", async () => {
    const mockReviews = [
        {
            model: "iPhone13",
            user: "testUser1",
            score: 5,
            date: "2024-05-02",
            comment: "A very cool smartphone!"
        },
        {
            model: "iPhone13",
            user: "testUser2",
            score: 4,
            date: "2024-05-01",
            comment: "Great phone, but expensive."
        }
    ];

    jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce(mockReviews);

    const response = await request(app)
        .get(`${baseURL}/${testModel}`)
        .set('user', JSON.stringify(testUser)); // Mocking the authenticated user

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockReviews);
    expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(1);
    expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(testModel);
});

test("It should return a 200 success code when deleting a review", async () => {
    jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce();
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testUser;
        next();
    });

    const response = await request(app)
        .delete(`${baseURL}/${testModel}`)
        .set('user', JSON.stringify(testUser)); // Mocking the authenticated user

    expect(response.status).toBe(200);
    expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1);
    expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(testModel, testUser);
});

test("It should return a 200 success code when deleting all reviews of a product", async () => {
    jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce();
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testUserAdmin;
        next();
    });
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

    const response = await request(app)
        .delete(`${baseURL}/${testModel}/all`)
        .set('user', JSON.stringify(testUserAdmin)); // Mocking the authenticated user

    expect(response.status).toBe(200);
    expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
    expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(testModel);
});

test("It should return a 200 success code when deleting all reviews of all products", async () => {
    jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce();
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        req.user = testUserAdmin;
        next();
    });
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next());

    const response = await request(app)
        .delete(`${baseURL}/`)
        .set('user', JSON.stringify(testUserAdmin)); // Mocking the authenticated user

    expect(response.status).toBe(200);
    expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledWith();
});


