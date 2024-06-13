import { describe, test, expect, jest } from "@jest/globals";
import request from 'supertest';
import { app } from "../../index";

import CartController from "../../src/controllers/cartController";
import Authenticator from "../../src/routers/auth";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Category } from "../../src/components/product";
import ErrorHandler from "../../src/helper";

const baseURL = "/ezelectronics";

// Mocking dependencies
jest.mock("../../src/controllers/userController");
jest.mock("../../src/routers/auth");

let ProductInCartTest = new ProductInCart("boubou", 20, Category.SMARTPHONE, 200);
let CartTest = new Cart("ouga", false, "", 20, [ProductInCartTest]);

describe("Cart Routing unit test", () => {
    describe("GET /carts", () => {
        test("It returns a cart", async () => {
            jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(CartTest);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Customer' }; // Mock authenticated user
                return next();
            });
            const response = await request(app).get(baseURL + "/carts");
            expect(response.status).toBe(200);
            expect(CartController.prototype.getCart).toHaveBeenCalled();
            expect(response.body).toEqual(CartTest);
        });
    });

    describe("POST /carts", () => {
        test("adds product to cart", async () => {
            jest.spyOn(CartController.prototype, "addToCart").mockResolvedValueOnce(true);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Customer' }; // Mock authenticated user
                return next();
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            });
            const response = await request(app).post(baseURL + "/carts").send({ model: "boubou" });
            expect(response.status).toBe(200);
            expect(CartController.prototype.addToCart).toHaveBeenCalled();
            expect(CartController.prototype.addToCart).toHaveBeenCalledWith({ role: 'Customer' }, "boubou");
        });
    });

    describe("PATCH /carts", () => {
        test("Checking out cart", async () => {
            jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Customer' }; // Mock authenticated user
                return next();
            });
            const response = await request(app).patch(baseURL + "/carts");
            expect(response.status).toBe(200);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalled();
        });
    });

    describe("GET /carts/history", () => {
        test("It returns list of carts", async () => {
            jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce([CartTest]);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Customer' }; // Mock authenticated user
                return next();
            });
            const response = await request(app).get(baseURL + "/carts/history");
            expect(response.status).toBe(200);
            expect(CartController.prototype.getCustomerCarts).toHaveBeenCalled();
            expect(response.body).toEqual([CartTest]);
        });
    });

    describe("DELETE /carts/products/:product", () => {
        test("removes product from cart", async () => {
            jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValueOnce(true);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Customer' }; // Mock authenticated user
                return next();
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            });
            const response = await request(app).delete(baseURL + "/carts/products/boubou");
            expect(response.status).toBe(200);
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalled();
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith({ role: 'Customer' }, "boubou");
        });
    });

    describe("DELETE /carts/current", () => {
        test("resets the current cart", async () => {
            jest.spyOn(CartController.prototype, "clearCart").mockResolvedValueOnce(true);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Customer' }; // Mock authenticated user
                return next();
            });
            const response = await request(app).delete(baseURL + "/carts/current");
            expect(response.status).toBe(200);
            expect(CartController.prototype.clearCart).toHaveBeenCalled();
        });
    });

    describe("DELETE /carts", () => {
        test("deletes all carts", async () => {
            jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValueOnce(true);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Admin' }; // Mock authenticated user
                return next();
            });
            const response = await request(app).delete(baseURL + "/carts");
            expect(response.status).toBe(200);
            expect(CartController.prototype.deleteAllCarts).toHaveBeenCalled();
        });
    });

    describe("GET /carts/all", () => {
        test("gets all carts", async () => {
            jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce([CartTest]);
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = { role: 'Admin' }; // Mock authenticated user
                return next();
            });
            const response = await request(app).get(baseURL + "/carts/all");
            expect(response.status).toBe(200);
            expect(CartController.prototype.getAllCarts).toHaveBeenCalled();
            expect(response.body).toEqual([CartTest]);
        });
    });
});
