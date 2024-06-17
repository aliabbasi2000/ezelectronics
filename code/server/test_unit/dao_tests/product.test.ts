import { test, expect, jest } from "@jest/globals";
import ProductDAO from "../../src/dao/productDAO";
import db from "../../src/db/db";
import {
  ProductAlreadyExistsError,
  ProductNotFoundError,
} from "../../src/errors/productError";
import { Database } from "sqlite3";
import { Category, Product } from "../../src/components/product";

jest.mock("../../src/db/db");

test("registerProducts should resolve if the product is successfully added", async () => {
  const productDAO = new ProductDAO();

  const testProduct = {
    model: "testModel",
    category: "testCategory",
    quantity: 10,
    details: "testDetails",
    sellingPrice: 100,
    arrivalDate: "2023-01-01",
  };

  // Mock db.run for successful insertion
  jest
    .spyOn(db, "run")
    .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void) => {
      callback(null);
      return {} as Database;
    });

  await expect(
    productDAO.registerProducts(
      testProduct.model,
      testProduct.category,
      testProduct.quantity,
      testProduct.details,
      testProduct.sellingPrice,
      testProduct.arrivalDate
    )
  ).resolves.toBeUndefined();

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining("INSERT INTO products"),
    [
      testProduct.model,
      testProduct.sellingPrice,
      testProduct.category,
      testProduct.arrivalDate,
      testProduct.details,
      testProduct.quantity,
    ],
    expect.any(Function)
  );

  jest.restoreAllMocks();
});

test("registerProducts should reject with ProductAlreadyExistsError if the product model already exists", async () => {
  const productDAO = new ProductDAO();

  const testProduct = {
    model: "testModel",
    category: "testCategory",
    quantity: 10,
    details: "testDetails",
    sellingPrice: 100,
    arrivalDate: "2023-01-01",
  };

  // Mock db.run to simulate a unique constraint failure
  jest
    .spyOn(db, "run")
    .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void) => {
      const error = new Error("UNIQUE constraint failed: products.model");
      callback(error);
      return {} as Database;
    });

  await expect(
    productDAO.registerProducts(
      testProduct.model,
      testProduct.category,
      testProduct.quantity,
      testProduct.details,
      testProduct.sellingPrice,
      testProduct.arrivalDate
    )
  ).rejects.toThrow(ProductAlreadyExistsError);

  jest.restoreAllMocks();
});

test("registerProducts should reject with an error if any other error occurs", async () => {
  const productDAO = new ProductDAO();

  const testProduct = {
    model: "testModel",
    category: "testCategory",
    quantity: 10,
    details: "testDetails",
    sellingPrice: 100,
    arrivalDate: "2023-01-01",
  };

  const genericError = new Error("Generic error");

  // Mock db.run to simulate a generic error
  jest
    .spyOn(db, "run")
    .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void) => {
      callback(genericError);
      return {} as Database;
    });

  await expect(
    productDAO.registerProducts(
      testProduct.model,
      testProduct.category,
      testProduct.quantity,
      testProduct.details,
      testProduct.sellingPrice,
      testProduct.arrivalDate
    )
  ).rejects.toThrow(genericError);

  jest.restoreAllMocks();
});


  
  test("should reject with ProductNotFoundError when product is not found", async () => {
    // Mocking database response
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
      return callback(null, null); // Simulating product not found
    });

    const productDAO = new ProductDAO();
    const newQuantity = 15;
    await expect(
      productDAO.changeProductQuantity("nonExistentModel", newQuantity, "2024-06-12")
    ).rejects.toThrow(ProductNotFoundError);
  });

  test("should reject with error when database update fails", async () => {
    // Mocking database response
    const mockError = new Error("Database error");
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
      return callback(null, { model: "testModel", quantity: 10 });
    });
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
      return callback(mockError);
    });

    const productDAO = new ProductDAO();
    const newQuantity = 15;
    await expect(
      productDAO.changeProductQuantity("testModel", newQuantity, "2024-06-12")
    ).rejects.toThrow(mockError);
  });
  
 
  
  test("sellProduct should reject with ProductNotFoundError when product not found", async () => {
    const productDAO = new ProductDAO();
  
    const testModel = "testModel";
    const testQuantity = 5;
    const sellingDate = "2024-06-12";
  
    // Mock db.get to return null (product not found)
    jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: Function) => {
      return callback(null, null);
    });
  
    await expect(productDAO.sellProduct(testModel, testQuantity, sellingDate)).rejects.toThrow(ProductNotFoundError);
  
    jest.restoreAllMocks();
  });
  
  

  test("should return products filtered by category", async () => {
    const productDAO = new ProductDAO();
    const expectedProducts: Product[] = [{
        sellingPrice: 0,
        model: "",
        category: Category.SMARTPHONE,
        arrivalDate: null,
        details: null,
        quantity: 0
    }];
    const category = "testCategory";

    jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: Product[]) => void) => {
      callback(null, expectedProducts);
      return {} as any; // Mock return value for database operation
    });

    const result = await productDAO.getProducts("category", category, null);
    expect(result).toEqual(expectedProducts);
  });

  test("should return products filtered by model", async () => {
    const productDAO = new ProductDAO();
    const expectedProducts: Product[] = [{
        sellingPrice: 0,
        model: "",
        category: Category.SMARTPHONE,
        arrivalDate: null,
        details: null,
        quantity: 0
    }];
    const model = "testModel";

    jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: Product[]) => void) => {
      callback(null, expectedProducts);
      return {} as any; // Mock return value for database operation
    });

    const result = await productDAO.getProducts("model", null, model);
    expect(result).toEqual(expectedProducts);
  });



  
  
  test("getAvailableProducts should return products filtered by category when grouping is 'category'", async () => {
    // Similar setup as above, but provide category and grouping
    const productDAO = new ProductDAO();
    const result = await productDAO.getAvailableProducts("category", "testCategory", null);
  
    // Assertions
  });
  
  test("getAvailableProducts should return products filtered by model when grouping is 'model'", async () => {
    // Similar setup as above, but provide model and grouping
    const productDAO = new ProductDAO();
    const result = await productDAO.getAvailableProducts("model", null, "testModel");
  
    // Assertions
  });
  
  test("getAvailableProducts should reject with an error if an exception occurs", async () => {
    const productDAO = new ProductDAO();
  
    // Mock the reject path
    jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: Product[]) => void) => {
       callback(new Error("Mock error"),[]);
      return {} as Database;
    });
  
    await expect(productDAO.getAvailableProducts(null, null, null)).rejects.toThrowError();
  
    jest.restoreAllMocks();
  });

  test("should resolve to true when deletion is successful", async () => {
    const productDAO = new ProductDAO();

    // Mock db.run for successful deletion
    jest.spyOn(db, "run").mockImplementation((sql, callback) => {
      return callback(null);
    });

    await expect(productDAO.deleteAllProducts()).resolves.toBe(true);

    expect(db.run).toHaveBeenCalledWith(
      "DELETE FROM products",
      expect.any(Function)
    );

    jest.restoreAllMocks();
  });

  test("should reject with an error if deletion fails", async () => {
    const productDAO = new ProductDAO();
    const error = new Error("Database error");

    // Mock db.run to simulate an error during deletion
    jest.spyOn(db, "run").mockImplementation((sql, callback) => {
      return callback(error);
    });

    await expect(productDAO.deleteAllProducts()).rejects.toThrow(error);

    expect(db.run).toHaveBeenCalledWith(
      "DELETE FROM products",
      expect.any(Function)
    );

    jest.restoreAllMocks();
  });

  test("should delete the product from the database", async () => {
    const productDAO = new ProductDAO();

    const testModel = "testModel";

    // Mock db.get to return a product
    jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
      callback(null, { model: testModel });
      return {} as Database;
    });

    // Mock db.run for successful deletion
    jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void) => {
      callback(null);
      return {} as Database;
    });

    await expect(productDAO.deleteProduct(testModel)).resolves.toBe(true);

    expect(db.get).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM products"),
      [testModel],
      expect.any(Function)
    );

    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM products"),
      [testModel],
      expect.any(Function)
    );
  });
  
  test("should reject with ProductNotFoundError if the product does not exist", async () => {
    const productDAO = new ProductDAO();
  
    const nonExistingModel = "nonExistingModel";
  
    // Mock db.get to return null (product not found)
    jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
      callback(null, null);
      return {} as Database;
    });
  
    await expect(productDAO.deleteProduct(nonExistingModel)).rejects.toThrow(ProductNotFoundError);
  
    expect(db.get).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM products"),
      [nonExistingModel],
      expect.any(Function)
    );
  });
  
  test("should resolve to true if the model exists in the database", async () => {
    const productDAO = new ProductDAO();
    const model = "existingModel";

    // Mock db.get to simulate that the model exists in the database
    jest
      .spyOn(db, "get")
      .mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: { count: number }) => void) => {
        callback(null, { count: 1 });
        return {} as Database;
      });

    await expect(productDAO.productModelExists(model)).resolves.toBe(true);

    expect(db.get).toHaveBeenCalledWith(
      "SELECT COUNT(*) as count FROM products WHERE model = ?",
      [model],
      expect.any(Function)
    );

    jest.restoreAllMocks();
  });

  test("should resolve to false if the model does not exist in the database", async () => {
    const productDAO = new ProductDAO();
    const model = "nonExistingModel";

    // Mock db.get to simulate that the model does not exist in the database
    jest
      .spyOn(db, "get")
      .mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: { count: number }) => void) => {
        callback(null, { count: 0 });
        return {} as Database;
      });

    await expect(productDAO.productModelExists(model)).resolves.toBe(false);

    expect(db.get).toHaveBeenCalledWith(
      "SELECT COUNT(*) as count FROM products WHERE model = ?",
      [model],
      expect.any(Function)
    );

    jest.restoreAllMocks();
  });

 