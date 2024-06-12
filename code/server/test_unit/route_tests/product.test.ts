import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import ProductController from "../../src/controllers/productController"
import { Category } from "../../src/components/product"
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper"
const baseURL = "/ezelectronics"

jest.mock("../../src/routers/auth")


//Unit test for the POST ezelectronics/products route
describe('POST /products', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test("200", async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => next())

    const requestBody = {
      model: "test",
      category: Category.LAPTOP,
      quantity: "10",
      details: "test",
      sellingPrice: 100,
      arrivalDate: '2024-06-06',
    }

    jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValue(undefined)
    const response = await request(app).post(baseURL + '/products').send(requestBody)

    expect(response.status).toBe(200)
    expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1)
  })

  test('422', async () => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => {
      return res.status(422).json({ errors: [{ msg: 'Invalid value', param: 'model' }] })
    })

    const response = await request(app).post(baseURL + '/products').send(new Error())

    expect(response.status).toBe(422)
    expect(ProductController.prototype.registerProducts).not.toHaveBeenCalled()
  })

  test('503', async () => {
    jest.spyOn(ProductController.prototype, 'registerProducts').mockRejectedValue(new Error('Database error'))

    const requestBody = {
      model: 'test',
      category: Category.LAPTOP,
      quantity: 10,
      details: 'test',
      sellingPrice: 100,
      arrivalDate: '2024-06-06',
    };

    const response = await request(app).post(baseURL + '/products').send(requestBody)

    expect(response.status).toBe(503)
    expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1)
    expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
      requestBody.model,
      requestBody.category,
      requestBody.quantity,
      requestBody.details,
      requestBody.sellingPrice,
      requestBody.arrivalDate
    )
  })
})


//Unit test for the PATCH ezelectronics/products/:model route
describe('PATCH /products/:model', () => {
  beforeEach(() => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, 'isManager').mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('200', async () => {
    jest.spyOn(ProductController.prototype, 'changeProductQuantity').mockResolvedValue(15)

    const requestBody = {
      quantity: 10,
      changeDate: '2024-06-06',
    }

    const response = await request(app).patch(baseURL + '/products/test-model').send(requestBody)

    expect(response.status).toBe(200)
    expect(response.body.quantity).toBe(15)
    expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1)
  })

  test('422', async () => {
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => {
      return res.status(422).json({ errors: [{ msg: 'Invalid value', param: 'quantity' }] })
    })
const invalidRequestBody = {
      quantity: -10, // Invalid quantity
      changeDate: '2024-06-06',
    }

    const response = await request(app).patch(baseURL + '/products/test-model').send(invalidRequestBody)

    expect(response.status).toBe(422);
    expect(ProductController.prototype.changeProductQuantity).not.toHaveBeenCalled();
  })

  test('503', async () => {
    jest.spyOn(ProductController.prototype, 'changeProductQuantity').mockRejectedValue(new Error())

    const requestBody = {
      quantity: 10,
      changeDate: '2024-06-06',
    }

    const response = await request(app).patch(baseURL + '/products/test-model').send(requestBody);

    expect(response.status).toBe(503)
    expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1)
  })
})


//Unit test for the PATCH ezelectronics/products/:model/sell route
describe('PATCH /products/:model/sell', () => {
  beforeEach(() => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, 'isManager').mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('200', async () => {
    jest.spyOn(ProductController.prototype, 'sellProduct').mockResolvedValue(5)

    const requestBody = {
      quantity: 5,
      sellingDate: '2024-06-06',
    }

    const response = await request(app).patch(baseURL + '/products/test-model/sell').send(requestBody)

    expect(response.status).toBe(200)
    expect(response.body.quantity).toBe(5)
    expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1)
  })

  test('422', async () => {
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => {
      return res.status(422).json({ errors: [{ msg: 'Invalid value', param: 'quantity' }] })
    })

    const invalidRequestBody = {
      quantity: -5, // Invalid quantity
      sellingDate: '2024-06-06',
    };

    const response = await request(app).patch(baseURL + '/products/test-model/sell').send(invalidRequestBody)

    expect(response.status).toBe(422)
    expect(ProductController.prototype.sellProduct).not.toHaveBeenCalled()
  })

  test('503', async () => {
    jest.spyOn(ProductController.prototype, 'sellProduct').mockRejectedValue(new Error(''))

    const requestBody = {
      quantity: 5,
      sellingDate: '2024-06-06',
    }

    const response = await request(app).patch(baseURL + '/products/test-model/sell').send(requestBody)

    expect(response.status).toBe(503);
    expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1)
  })
})


//Unit test for the GET ezelectronics/products route
describe('GET /products', () => {
  beforeEach(() => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('200 - retrieves all products', async () => {
    const mockProducts = [
      { model: "A", category: Category.LAPTOP, quantity: 5, details: "test", sellingPrice: 500, arrivalDate: "2024-06-04" },
      { model: "B", category: Category.SMARTPHONE, quantity: 10, details: "test", sellingPrice: 100, arrivalDate: "2024-06-04" },
    ]
    jest.spyOn(ProductController.prototype, 'getProducts').mockResolvedValue(mockProducts)

    const response = await request(app).get(baseURL + '/products')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProducts)
    expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1)
    expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(undefined, undefined, undefined);
  })
test('503 - handle controller errors', async () => {
    jest.spyOn(ProductController.prototype, 'getProducts').mockRejectedValue(new Error('Database error'))

    const response = await request(app).get(baseURL + '/products')

    expect(response.status).toBe(503)
    expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1)
  })

  test('200 - retrieves products by category', async () => {
    const mockProducts = [
      { model: "A", category: Category.LAPTOP, quantity: 5, details: "test", sellingPrice: 500, arrivalDate: "2024-06-04" }
    ];
    jest.spyOn(ProductController.prototype, 'getProducts').mockResolvedValue(mockProducts)

    const response = await request(app).get(baseURL + '/products?grouping=category&category=Laptop')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProducts)
    expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1)
    expect(ProductController.prototype.getProducts).toHaveBeenCalledWith('category', 'Laptop', undefined)
  })

  test('200 - retrieves products by model', async () => {
    const mockProducts = [
      { model: "A", category: Category.LAPTOP, quantity: 5, details: "test", sellingPrice: 500, arrivalDate: "2024-06-04" }
    ]
    jest.spyOn(ProductController.prototype, 'getProducts').mockResolvedValue(mockProducts)

    const response = await request(app).get(baseURL + '/products?grouping=model&model=A')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProducts)
    expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
    expect(ProductController.prototype.getProducts).toHaveBeenCalledWith('model', undefined, 'A')
  })
})


//Unit test for the GET ezelectronics/products/available route
describe('GET /available', () => {
  beforeEach(() => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, 'isCustomer').mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('200 - retrieves all available products', async () => {
    const mockProducts = [
      { model: "A", category: Category.LAPTOP, quantity: 5, details: "test", sellingPrice: 500, arrivalDate: "2024-06-04" },
      { model: "B", category: Category.SMARTPHONE, quantity: 10, details: "test", sellingPrice: 100, arrivalDate: "2024-06-04" },
    ]
    jest.spyOn(ProductController.prototype, 'getAvailableProducts').mockResolvedValue(mockProducts)

    const response = await request(app).get(baseURL + '/products/available')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProducts)
    expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1)
    expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(undefined, undefined, undefined)
  })

  test('503 - handle controller errors', async () => {
    jest.spyOn(ProductController.prototype, 'getAvailableProducts').mockRejectedValue(new Error())

    const response = await request(app).get(baseURL + '/products/available')

    expect(response.status).toBe(503)
    expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1)
  })

  test('200 - retrieves available products by category', async () => {
    const mockProducts = [
      { model: "A", category: Category.LAPTOP, quantity: 5, details: "test", sellingPrice: 500, arrivalDate: "2024-06-04" }
    ]
    jest.spyOn(ProductController.prototype, 'getAvailableProducts').mockResolvedValue(mockProducts)

    const response = await request(app).get(baseURL + '/products/available?grouping=category&category=Laptop')
expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProducts)
    expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1)
    expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith('category', 'Laptop', undefined)
  })

  test('200 - retrieves available products by model', async () => {
    const mockProducts = [
      { model: "A", category: Category.LAPTOP, quantity: 5, details: "test", sellingPrice: 500, arrivalDate: "2024-06-04" }
    ]
    jest.spyOn(ProductController.prototype, 'getAvailableProducts').mockResolvedValue(mockProducts)

    const response = await request(app).get(baseURL + '/products/available?grouping=model&model=A')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockProducts)
    expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1)
    expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith('model', undefined, 'A')
  })
})


//Unit test for the DELETE ezelectronics/:model route
describe('DELETE /', () => {
  beforeEach(() => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next())
  });

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('200 - deletes all products', async () => {
    jest.spyOn(ProductController.prototype, 'deleteAllProducts').mockResolvedValue(true)

    const response = await request(app).delete(baseURL + '/products')

    expect(response.status).toBe(200)
    expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1)
  })

  test('503 - handle controller errors', async () => {
    jest.spyOn(ProductController.prototype, 'deleteAllProducts').mockRejectedValue(new Error('Database error'))

    const response = await request(app).delete(baseURL + '/products')

    expect(response.status).toBe(503);
    expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1)
  })

  test('401 - unauthorized when user is not logged in', async () => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => res.status(401).end())

    const response = await request(app).delete(baseURL + '/products')

    expect(response.status).toBe(401)
    expect(ProductController.prototype.deleteAllProducts).not.toHaveBeenCalled()
  })

  test('403 - forbidden when user is not an admin or manager', async () => {
    jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => res.status(403).end())

    const response = await request(app).delete(baseURL + '/products')

    expect(response.status).toBe(403)
    expect(ProductController.prototype.deleteAllProducts).not.toHaveBeenCalled();
  })
})


//Unit test for the DELETE ezelectronics/:model route
describe('DELETE /:model', () => {
  beforeEach(() => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => next())
    jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => next())
    jest.spyOn(ErrorHandler.prototype, 'validateRequest').mockImplementation((req, res, next) => next())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('200 - deletes a product', async () => {
    jest.spyOn(ProductController.prototype, 'deleteProduct').mockResolvedValue(true)

    const response = await request(app).delete(baseURL + '/products/testModel')

    expect(response.status).toBe(200)
    expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1)
    expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith('testModel')
  })

  test('503 - handle controller errors', async () => {
    jest.spyOn(ProductController.prototype, 'deleteProduct').mockRejectedValue(new Error())
const response = await request(app).delete(baseURL + '/products/testModel')

    expect(response.status).toBe(503)
    expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1)
  })

  test('401 - unauthorized when user is not logged in', async () => {
    jest.spyOn(Authenticator.prototype, 'isLoggedIn').mockImplementation((req, res, next) => res.status(401).end())

    const response = await request(app).delete(baseURL + '/products/testModel')

    expect(response.status).toBe(401)
    expect(ProductController.prototype.deleteProduct).not.toHaveBeenCalled()
  })

  test('403 - forbidden when user is not an admin or manager', async () => {
    jest.spyOn(Authenticator.prototype, 'isAdminOrManager').mockImplementation((req, res, next) => res.status(403).end())

    const response = await request(app).delete(baseURL + '/products/testModel')

    expect(response.status).toBe(403)
    expect(ProductController.prototype.deleteProduct).not.toHaveBeenCalled()
  })
})
