import { test, expect, jest } from "@jest/globals";
import request from 'supertest';
import express from "express";
import CartRoutes from "../../src/routers/cartRoutes";
import CartController from "../../src/controllers/cartController";
import { Cart } from "../../src/components/cart";

const baseURL = "/ezelectronics";

jest.mock("../../src/controllers/cartController");

test("Retrieve Cart Route: It should handle errors", async () => {
    const user = { username: "testUser", role: "Customer" };
    const req = { user };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const errorMessage = "An error occurred";
    const error = new Error(errorMessage);
    const cartControllerMock = CartController as jest.MockedClass<typeof CartController>;
    cartControllerMock.prototype.getCart.mockRejectedValue(error);

    const app = express();
    app.use("/", new CartRoutes({} as any).getRouter());

    await request(app)
        .get(baseURL + "/cart")
        .set("user", JSON.stringify(user))
        .expect(500); // Expecting an internal server error

    expect(next).toHaveBeenCalledWith(error);
});
