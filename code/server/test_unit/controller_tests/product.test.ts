import {
    test,
    expect,
    jest,
    describe,
    beforeEach,
    afterEach,
} from "@jest/globals";
import ProductController from "../../src/controllers/productController";
import ProductDAO from "../../src/dao/productDAO";
import { Category, Product } from "../../src/components/product";


jest.mock("../../src/dao/productDAO");

describe("ProductController", () => {
    let controller: ProductController;
    let dao: jest.Mocked<ProductDAO>;

    beforeEach(() => {
        dao = new ProductDAO() as jest.Mocked<ProductDAO>;
        controller = new ProductController();
        controller["dao"] = dao; // replace the DAO instance with the mocked instance
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should register a product successfully", async () => {
        dao.registerProducts.mockResolvedValue(undefined); // Simulate successful registration

        await expect(
            controller.registerProducts(
                "ModelX",
                "Smartphone",
                100,
                "Details",
                999.99,
                "2024-01-01"
            )
        ).resolves.toBeUndefined();

        expect(dao.registerProducts).toHaveBeenCalledWith(
            "ModelX",
            "Smartphone",
            100,
            "Details",
            999.99,
            "2024-01-01"
        );
        expect(dao.registerProducts).toHaveBeenCalledTimes(1);
    });

    test("should handle error when registering a product", async () => {
        const error = new Error("Database error");
        dao.registerProducts.mockRejectedValue(error); // Simulate an error

        await expect(
            controller.registerProducts(
                "ModelX",
                "Smartphone",
                100,
                "Details",
                999.99,
                "2024-01-01"
            )
        ).rejects.toThrow("Database error");

        expect(dao.registerProducts).toHaveBeenCalledWith(
            "ModelX",
            "Smartphone",
            100,
            "Details",
            999.99,
            "2024-01-01"
        );
        expect(dao.registerProducts).toHaveBeenCalledTimes(1);
    });
    test("should change product quantity successfully", async () => {
        const model = "ModelX";
        const newQuantity = 50;
        const changeDate = "2024-06-10";
        const updatedQuantity = 150;
    
        dao.changeProductQuantity.mockResolvedValue(updatedQuantity); // Simulate successful quantity change
    
        await expect(
            controller.changeProductQuantity(model, newQuantity, changeDate)
        ).resolves.toBe(updatedQuantity);
    
        expect(dao.changeProductQuantity).toHaveBeenCalledWith(
            model,
            newQuantity,
            changeDate
        );
        expect(dao.changeProductQuantity).toHaveBeenCalledTimes(1);
    });
    
    test("should handle error when changing product quantity", async () => {
        const model = "ModelX";
        const newQuantity = 50;
        const changeDate = "2024-06-10";
        const error = new Error("Database error");
    
        dao.changeProductQuantity.mockRejectedValue(error); // Simulate an error
    
        await expect(
            controller.changeProductQuantity(model, newQuantity, changeDate)
        ).rejects.toThrow("Database error");
    
        expect(dao.changeProductQuantity).toHaveBeenCalledWith(
            model,
            newQuantity,
            changeDate
        );
        expect(dao.changeProductQuantity).toHaveBeenCalledTimes(1);
    });
    
    test("should sell product successfully", async () => {
        const model = "ModelX";
        const quantity = 10;
        const sellingDate = "2024-06-10";
        const newAvailableQuantity = 90; // Example of the new quantity after selling

        dao.sellProduct.mockResolvedValue(newAvailableQuantity); // Simulate successful product sale

        await expect(
            controller.sellProduct(model, quantity, sellingDate)
        ).resolves.toBe(newAvailableQuantity);

        expect(dao.sellProduct).toHaveBeenCalledWith(
            model,
            quantity,
            sellingDate
        );
        expect(dao.sellProduct).toHaveBeenCalledTimes(1);
    });

    test("should handle error when selling product", async () => {
        const model = "ModelX";
        const quantity = 10;
        const sellingDate = "2024-06-10";
        const error = new Error("Database error");

        dao.sellProduct.mockRejectedValue(error); // Simulate an error

        await expect(
            controller.sellProduct(model, quantity, sellingDate)
        ).rejects.toThrow("Database error");

        expect(dao.sellProduct).toHaveBeenCalledWith(
            model,
            quantity,
            sellingDate
        );
        expect(dao.sellProduct).toHaveBeenCalledTimes(1);
    });

    test("should return all products without any filters", async () => {
        const products = [
            new Product(999.99, "ModelX", Category.SMARTPHONE, "2024-01-01", "Details", 100),
            new Product(1999.99, "ModelY", Category.LAPTOP, "2024-02-01", "Details", 50)
        ];
        dao.getProducts.mockResolvedValue(products);

        await expect(controller.getProducts(null, null, null)).resolves.toEqual(products);

        expect(dao.getProducts).toHaveBeenCalledWith(null, null, null);
        expect(dao.getProducts).toHaveBeenCalledTimes(1);
    });

    test("should return products filtered by category", async () => {
        const products = [
            new Product(999.99, "ModelX", Category.SMARTPHONE, "2024-01-01", "Details", 100)
        ];
        const category = "Smartphone";
        dao.getProducts.mockResolvedValue(products);

        await expect(controller.getProducts("category", category, null)).resolves.toEqual(products);

        expect(dao.getProducts).toHaveBeenCalledWith("category", category, null);
        expect(dao.getProducts).toHaveBeenCalledTimes(1);
    });

    test("should return products filtered by model", async () => {
        const products = [
            new Product(999.99, "ModelX", Category.SMARTPHONE, "2024-01-01", "Details", 100)
        ];
        const model = "ModelX";
        dao.getProducts.mockResolvedValue(products);

        await expect(controller.getProducts("model", null, model)).resolves.toEqual(products);

        expect(dao.getProducts).toHaveBeenCalledWith("model", null, model);
        expect(dao.getProducts).toHaveBeenCalledTimes(1);
    });

    test("should handle error when retrieving products", async () => {
        const error = new Error("Database error");
        dao.getProducts.mockRejectedValue(error);

        await expect(controller.getProducts(null, null, null)).rejects.toThrow("Database error");

        expect(dao.getProducts).toHaveBeenCalledWith(null, null, null);
        expect(dao.getProducts).toHaveBeenCalledTimes(1);
    });

    test("should return all available products without grouping", async () => {
        const products = [
            new Product(999.99, "ModelX", Category.SMARTPHONE, "2024-01-01", "Details", 10),
            new Product(599.99, "ModelY", Category.LAPTOP, "2024-02-01", "Details", 5),
        ];
        dao.getAvailableProducts.mockResolvedValue(products);

        await expect(
            controller.getAvailableProducts(null, null, null)
        ).resolves.toEqual(products);

        expect(dao.getAvailableProducts).toHaveBeenCalledWith(null, null, null);
        expect(dao.getAvailableProducts).toHaveBeenCalledTimes(1);
    });

    test("should return available products grouped by category", async () => {
        const category = "Smartphone";
        const products = [
            new Product(999.99, "ModelX", Category.SMARTPHONE, "2024-01-01", "Details", 10),
            new Product(799.99, "ModelY", Category.SMARTPHONE, "2024-02-01", "Details", 5),
        ];
        dao.getAvailableProducts.mockResolvedValue(products);

        await expect(
            controller.getAvailableProducts("category", category, null)
        ).resolves.toEqual(products);

        expect(dao.getAvailableProducts).toHaveBeenCalledWith("category", category, null);
        expect(dao.getAvailableProducts).toHaveBeenCalledTimes(1);
    });

    test("should return available products grouped by model", async () => {
        const model = "ModelX";
        const products = [
            new Product(999.99, "ModelX", Category.SMARTPHONE, "2024-01-01", "Details", 10),
            new Product(999.99, "ModelX", Category.LAPTOP, "2024-03-01", "Details", 5),
        ];
        dao.getAvailableProducts.mockResolvedValue(products);

        await expect(
            controller.getAvailableProducts("model", null, model)
        ).resolves.toEqual(products);

        expect(dao.getAvailableProducts).toHaveBeenCalledWith("model", null, model);
        expect(dao.getAvailableProducts).toHaveBeenCalledTimes(1);
    });

    test("should handle error when getting available products", async () => {
        const error = new Error("Database error");
        dao.getAvailableProducts.mockRejectedValue(error);

        await expect(
            controller.getAvailableProducts(null, null, null)
        ).rejects.toThrow("Database error");

        expect(dao.getAvailableProducts).toHaveBeenCalledWith(null, null, null);
        expect(dao.getAvailableProducts).toHaveBeenCalledTimes(1);
    });

    test("should delete all products successfully", async () => {
        dao.deleteAllProducts.mockResolvedValue(true); // Simulate successful deletion

        await expect(controller.deleteAllProducts()).resolves.toBe(true);

        expect(dao.deleteAllProducts).toHaveBeenCalled();
        expect(dao.deleteAllProducts).toHaveBeenCalledTimes(1);
    });

    test("should handle error when deleting all products", async () => {
        const error = new Error("Database error");
        dao.deleteAllProducts.mockRejectedValue(error); // Simulate an error

        await expect(controller.deleteAllProducts()).rejects.toThrow("Database error");

        expect(dao.deleteAllProducts).toHaveBeenCalled();
        expect(dao.deleteAllProducts).toHaveBeenCalledTimes(1);
    });

    test("should delete a product successfully", async () => {
        const model = "ModelX";

        dao.deleteProduct.mockResolvedValue(true); // Simulate successful deletion

        await expect(controller.deleteProduct(model)).resolves.toBe(true);

        expect(dao.deleteProduct).toHaveBeenCalledWith(model);
        expect(dao.deleteProduct).toHaveBeenCalledTimes(1);
    });

    test("should handle error when deleting a product", async () => {
        const model = "ModelX";
        const error = new Error("Database error");

        dao.deleteProduct.mockRejectedValue(error); // Simulate an error

        await expect(controller.deleteProduct(model)).rejects.toThrow("Database error");

        expect(dao.deleteProduct).toHaveBeenCalledWith(model);
        expect(dao.deleteProduct).toHaveBeenCalledTimes(1);
    });

    test("should register a product successfully", async () => {
        dao.registerProducts.mockResolvedValue(undefined); // Simulate successful registration

        await expect(
            controller.registerProducts(
                "ModelX",
                "Smartphone",
                100,
                "Details",
                999.99,
                "2024-01-01"
            )
        ).resolves.toBeUndefined();

        expect(dao.registerProducts).toHaveBeenCalledWith(
            "ModelX",
            "Smartphone",
            100,
            "Details",
            999.99,
            "2024-01-01"
        );
        expect(dao.registerProducts).toHaveBeenCalledTimes(1);
    });

    test("should handle error when registering a product", async () => {
        const error = new Error("Database error");
        dao.registerProducts.mockRejectedValue(error); // Simulate an error

        await expect(
            controller.registerProducts(
                "ModelX",
                "Smartphone",
                100,
                "Details",
                999.99,
                "2024-01-01"
            )
        ).rejects.toThrow("Database error");

        expect(dao.registerProducts).toHaveBeenCalledWith(
            "ModelX",
            "Smartphone",
            100,
            "Details",
            999.99,
            "2024-01-01"
        );
        expect(dao.registerProducts).toHaveBeenCalledTimes(1);
    });
    
    test("should change product quantity successfully", async () => {
        const model = "ModelX";
        const newQuantity = 50;
        const changeDate = "2024-06-10";
        const updatedQuantity = 150;
    
        dao.changeProductQuantity.mockResolvedValue(updatedQuantity); // Simulate successful quantity change
    
        await expect(
            controller.changeProductQuantity(model, newQuantity, changeDate)
        ).resolves.toBe(updatedQuantity);
    
        expect(dao.changeProductQuantity).toHaveBeenCalledWith(
            model,
            newQuantity,
            changeDate
        );
        expect(dao.changeProductQuantity).toHaveBeenCalledTimes(1);
    });
    
    test("should handle error when changing product quantity", async () => {
        const model = "ModelX";
        const newQuantity = 50;
        const changeDate = "2024-06-10";
        const error = new Error("Database error");
    
        dao.changeProductQuantity.mockRejectedValue(error); // Simulate an error
    
        await expect(
            controller.changeProductQuantity(model, newQuantity, changeDate)
        ).rejects.toThrow("Database error");
    
        expect(dao.changeProductQuantity).toHaveBeenCalledWith(
            model,
            newQuantity,
            changeDate
        );
        expect(dao.changeProductQuantity).toHaveBeenCalledTimes(1);
    });
});

