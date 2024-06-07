import { test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import CartDAO from "../../src/dao/cartDAO"
import { Role } from "../../src/components/user"; // Import the Role enum
import CartController from "../../src/controllers/cartController"
jest.mock("../../src/dao/cartDAO")

test("It should return true", async () => {
    const testUser = { // Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: Role.CUSTOMER, // Use the Role enum
        address: "test",
        birthdate: "test"
    }
    const testModel = "testModel";

    jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(true); // Mock the addToCart method of the DAO

    const controller = new CartController(); // Create a new instance of the controller
    // Call the addToCart method of the controller with the test user object and model
    const response = await controller.addToCart(testUser, testModel);

    // Check if the addToCart method of the DAO has been called once with the correct parameters
    expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
    expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(testUser, testModel);
    expect(response).toBe(true); // Check if the response is true
});