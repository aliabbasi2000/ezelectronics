import { describe, test, expect, jest, beforeEach, afterEach } from "@jest/globals";
import ReviewDAO from "../../src/dao/reviewDAO";
import db from "../../src/db/db";
import { Role, User } from "../../src/components/user";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ProductReview } from "../../src/components/review";
import { Database } from "sqlite3";

const user = new User("testUser", "Test", "User", Role.CUSTOMER, "123 Test St", "2000-01-01");
const review = {
    model: "testModel",
    user: user,
    score: 5,
    comment: "Great product!"
};
const model = "testModel";

afterEach(() => {
    jest.clearAllMocks();
});


    describe("ReviewDAO.addReview", () => {
        test("should add a new review for a product", async () => {
            const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                if (sql.includes("SELECT COUNT(*) as count FROM ProductReview")) {
                    callback(null, { count: 0 });
                }
                return {} as Database;
            });
    
            const mockRUN = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
    
            const reviewDAO = new ReviewDAO();
            await reviewDAO.addReview("testModel", user, 5, "Great product!");
    
            expect(mockGET).toHaveBeenCalledTimes(1);
            expect(mockRUN).toHaveBeenCalledTimes(1);
    
            mockGET.mockRestore();
            mockRUN.mockRestore();
        });
    
        test("should throw ExistingReviewError if a review already exists", async () => {
            const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                if (sql.includes("SELECT COUNT(*) as count FROM ProductReview")) {
                    callback(null, { count: 1 });
                }
                return {} as Database;
            });
    
            const reviewDAO = new ReviewDAO();
            await expect(reviewDAO.addReview("testModel", user, 5, "Great product!")).rejects.toThrow(ExistingReviewError);
    
            expect(mockGET).toHaveBeenCalledTimes(1);
    
            mockGET.mockRestore();
        });
    
        test("should throw ProductNotFoundError if the product does not exist", async () => {
            const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                if (sql.includes("SELECT COUNT(*) as count FROM ProductReview")) {
                    callback(null, { count: 0 });
                } else if (sql.includes("SELECT * FROM products where model = ?")) {
                    callback(null, null);
                }
                return {} as Database;
            });
    
            const reviewDAO = new ReviewDAO();
            await expect(reviewDAO.addReview("invalidModel", user, 5, "Great product!")).rejects.toThrow(ProductNotFoundError);
    
            expect(mockGET).toHaveBeenCalledTimes(2);
    
            mockGET.mockRestore();
        });
    });
    
    describe("ReviewDAO.getProductReviews", () => {
        test("should return all reviews for a product", async () => {
            const mockReviews = [
                { product_model: "testModel", user: "testUser", score: 5, date: "2024-05-02", comment: "Great product!" },
                { product_model: "testModel", user: "anotherUser", score: 4, date: "2024-05-01", comment: "Good product!" }
            ];
    
            const mockALL = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
                callback(null, mockReviews);
                return {} as Database;
            });
    
            const reviewDAO = new ReviewDAO();
            const result = await reviewDAO.getProductReviews("testModel");
    
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(ProductReview);
            expect(result[1]).toBeInstanceOf(ProductReview);
            mockALL.mockRestore();
        });
    
        test("should throw NoReviewProductError if there are no reviews for the product", async () => {
            const mockALL = jest.spyOn(db, "all").mockImplementation((sql, callback) => {
                callback(null, []);
                return {} as Database;
            });
    
            const reviewDAO = new ReviewDAO();
    
            try {
                await reviewDAO.getProductReviews("testModel");
                fail('Expected to throw NoReviewProductError, but it did not throw');
            } catch (error) {
                expect(error).toBeInstanceOf(NoReviewProductError);
            }
    
            expect(mockALL).toHaveBeenCalledTimes(1);
    
            mockALL.mockRestore();
        });
    });
    
    describe("ReviewDAO.deleteReview", () => {
        test("should delete a review made by a user for a product", async () => {
            const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                if (sql.includes("SELECT * FROM products where model = ?")) {
                    callback(null, { model: "testModel" });
                } else if (sql.includes("SELECT * FROM ProductReview WHERE product_model = ? AND user = ?")) {
                    callback(null, { product_model: "testModel", user: "testUser" });
                }
                return {} as Database;
            });
    
            const mockRUN = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });
    
            const reviewDAO = new ReviewDAO();
            await reviewDAO.deleteReview("testModel", user);
    
            expect(mockGET).toHaveBeenCalledTimes(2);
            expect(mockRUN).toHaveBeenCalledTimes(1);
    
            mockGET.mockRestore();
            mockRUN.mockRestore();
        });
    
        test("should throw ProductNotFoundError if the product does not exist", async () => {
            const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                if (sql.includes("SELECT * FROM products where model = ?")) {
                    callback(null, null);
                }
                return {} as Database;
            });
    
            const reviewDAO = new ReviewDAO();
    
            try {
                await reviewDAO.deleteReview("invalidModel", user);
                fail('Expected to throw ProductNotFoundError, but it did not throw');
            } catch (error) {
                expect(error).toBeInstanceOf(ProductNotFoundError);
            }
    
            expect(mockGET).toHaveBeenCalledTimes(1);
    
            mockGET.mockRestore();
        });

    test("should throw NoReviewProductError if the review does not exist", async () => {
        const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            if (sql.includes("SELECT * FROM products where model = ?")) {
                callback(null, { model: "testModel" });
            } else if (sql.includes("SELECT * FROM ProductReview WHERE product_model = ? AND user = ?")) {
                callback(null, null);
            }
            return {} as Database;
        });

        const reviewDAO = new ReviewDAO();
        await expect(reviewDAO.deleteReview("testModel", user)).rejects.toThrow(NoReviewProductError);

        expect(mockGET).toHaveBeenCalledTimes(2);

        mockGET.mockRestore();
    });
});

describe("ReviewDAO.deleteReviewsOfProduct", () => {
    test("should delete all reviews for a product", async () => {
        const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            if (sql.includes("SELECT * FROM products where model = ?")) {
                callback(null, { model: "testModel" });
            }
            return {} as Database;
        });

        const mockRUN = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return {} as Database;
        });

        const reviewDAO = new ReviewDAO();
        await reviewDAO.deleteReviewsOfProduct("testModel");

        expect(mockGET).toHaveBeenCalledTimes(1);
        expect(mockRUN).toHaveBeenCalledTimes(1);

        mockGET.mockRestore();
        mockRUN.mockRestore();
    });

    test("should throw ProductNotFoundError if the product does not exist", async () => {
        const mockGET = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            if (sql.includes("SELECT * FROM products where model = ?")) {
                callback(null, null); // Simulate product not found
            }
            return {} as Database;
        });

        const reviewDAO = new ReviewDAO();

        try {
            await reviewDAO.deleteReviewsOfProduct("invalidModel");
            fail('Expected to throw ProductNotFoundError, but it did not throw');
        } catch (error) {
            expect(error).toBeInstanceOf(ProductNotFoundError);
        }

        expect(mockGET).toHaveBeenCalledTimes(1);

        mockGET.mockRestore();
    });
});

describe("ReviewDAO.deleteAllReviews", () => {
    test("should delete all reviews of all products", async () => {
        const mockRUN = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null);
            return {} as Database;
        });

        const reviewDAO = new ReviewDAO();
        await reviewDAO.deleteAllReviews();

        expect(mockRUN).toHaveBeenCalledTimes(1);

        mockRUN.mockRestore();
    });

    test("should handle errors during deletion", async () => {
        const mockRUN = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(new Error("Deletion error"));
            return {} as Database;
        });

        const reviewDAO = new ReviewDAO();

        try {
            await reviewDAO.deleteAllReviews();
            fail('Expected to throw error, but it did not throw');
        } catch (error) {
            expect(error.message).toBe("Deletion error");
        }

        expect(mockRUN).toHaveBeenCalledTimes(1);

        mockRUN.mockRestore();
    });
});

