import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";

const routePath = "/ezelectronics";



const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" }

let customerCookie: string
let adminCookie: string
let managerCookie: string


const postUser = async (userInfo: any) => {
    await request(app)
        .post(routePath+'/users')
        .send(userInfo)
        .expect(200)
}


const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(routePath+'/sessions')
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}


beforeAll(async () => {
    cleanup()
    await postUser(admin)
    await postUser(customer)
    await postUser(manager)
    adminCookie = await login(admin)
    customerCookie = await login(customer)
    managerCookie = await login(manager)
})


afterAll(() => {
    cleanup()
})


const product1 = {model: 'product1', category: "Smartphone", quantity: 3, details: "product1 so cool", sellingPrice: 100, arrivalDate: "2011-11-11"}
const product2 = {model: 'product2', category: "Laptop", quantity: 2, details: "product2 is ok", sellingPrice: 100}
const product3 = {model: 'product3', category: "Laptop", quantity: 1, details: "product3 not so cool", sellingPrice: 100, arrivalDate: "2066-11-11"}


describe("Product routes integration tests", () => {


    describe("POST /products", () => {
        test("It should return a 401 error code Unautgorized", async () => {    
            await request(app)
            .post(routePath+'/products')
            .send(product1)
            .set("Cookie", customerCookie)
            .expect(401)

        })
        test("It should return a 200 success code and create a new product", async () => {
            await request(app)
            .post(routePath+'/products')
            .send(product1)
            .set("Cookie", adminCookie)
            .expect(200)

            await request(app)
            .post(routePath+'/products')
            .send(product2)
            .set("Cookie", adminCookie)
            .expect(200)
        })

        test("It should return a 422 error code as the date is invalid", async () => {    
            await request(app)
            .post(routePath+'/products')
            .send(product3)
            .set("Cookie", adminCookie)
            .expect(422)

        })
    })

    describe("PATCH /products/:model", () => {
        test("Changing the quantity of a product, expecting 200 success code", async () => {    
            
            let product  = await request(app)
            .patch(routePath+'/products/product1')
            .send({quantity: 2, changeDate: "2014-12-12"})
            .set("Cookie", adminCookie)
            .expect(200)

            let adm = product.body
            expect(adm.quantity).toBe(product1.quantity+2)


            product  = await request(app)
            .patch(routePath+'/products/product2')
            .send({quantity: 2})
            .set("Cookie", adminCookie)
            .expect(200)
            adm = product.body
            expect(adm.quantity).toBe(product2.quantity+2)


        })
        test("Changing the quantity of a product that doesn't exist, expecting 404 success code", async () => {    
            
            let product = await request(app)
            .patch(routePath+'/products/product122')
            .send({quantity: 2, changeDate: "2014-12-12"})
            .set("Cookie", adminCookie)
            .expect(404)
        })

        test("Changing the quantity of a product with invalid data, expecting error codes", async () => {    
            
            await request(app)
            .patch(routePath+'/products/product1')
            .send({quantity: 2, changeDate: "2055-01-01"})
            .set("Cookie", adminCookie)
            .expect(422)

            await request(app)
            .patch(routePath+'/products/product2')
            .send({quantity: 0})
            .set("Cookie", adminCookie)
            .expect(422)

        })
    })

    describe("PATCH /products/:model/sell", () => {
        test("Selling a product, expecting 200 success code", async () => {    
            
            let product = await request(app)
            .patch(routePath+'/products/product1/sell')
            .send({quantity: 2, sellingDate: "2014-12-12"})
            .set("Cookie", adminCookie)
            .expect(200)
            let adm = product.body
            expect(adm.quantity).toBe(product1.quantity)

            await request(app)
            .patch(routePath+'/products/product2/sell')
            .send({quantity: 1})
            .set("Cookie", adminCookie)
            .expect(200)
            adm = product.body
            expect(adm.quantity).toBe(3)
        })

        test("Selling a product that doesn't exist, expecting 404 success code", async () => {    
            
            let product = await request(app)
            .patch(routePath+'/products/product122/sell')
            .send({quantity: 2, sellingDate: "2014-12-12"})
            .set("Cookie", adminCookie)
            .expect(404)
        })

        test("Selling a product with invalid data, expecting error codes", async () => {    
            
            await request(app)
            .patch(routePath+'/products/product1/sell')
            .send({quantity: 2, sellingDate: "2025-10-10"})
            .set("Cookie", adminCookie)
            .expect(422)

            await request(app)
            .patch(routePath+'/products/product2/sell')
            .send({quantity: 0})
            .set("Cookie", adminCookie)
            .expect(422)

        })
    }) 
    
    describe("GET /products", () => {
        test("Getting a product list by category", async () => {  
            let product = await request(app)
            .get(routePath+'/products')
            .send()
            .set("Cookie", adminCookie)
            .query({grouping: "category", category: "Laptop"})
            .expect(200)
            let adm = product.body[0] 
            console.log(adm)
            expect(adm.model).toBe(product2.model)
            expect(adm.category).toBe(product2.category)
            expect(adm.quantity).toBe(3)

        })



        test("Getting a product list by model name", async () => {  
            let product = await request(app)
            .get(routePath+'/products')
            .set("Cookie", adminCookie)
            .query({grouping: "model", model: "product1"})
            .expect(200)
            let adm = product.body[0]
            expect(adm.model).toBe(product1.model)
            expect(adm.category).toBe(product1.category)
            expect(adm.quantity).toBe(product1.quantity)

        })

        test("Getting a product list: bad request, expecting an error (line 195)", async () => {  
            let product = await request(app)
            .get(routePath+'/products')
            .set("Cookie", adminCookie)
            .query({grouping: "model", category:"Smartphone"})
            .expect(422)
        })

        test("Getting a product list: bad request, expecting an error (line 202)", async () => {  
            let product = await request(app)
            .get(routePath+'/products')
            .set("Cookie", adminCookie)
            .query({grouping: "category", category:"bad"})
            .expect(422)
        })

        test("Getting a product list: bad request, expecting an error (line 210)", async () => {  
            let product = await request(app)
            .get(routePath+'/products')
            .set("Cookie", adminCookie)
            .query({grouping: "category", model:"product1"})
            .expect(422)
        })

        test("Getting a product list: bad request, expecting an error (line 217)", async () => {  
            let product = await request(app)
            .get(routePath+'/products')
            .set("Cookie", adminCookie)
            .query({grouping: "model", model:" "})
            .expect(422)
        })

        test("Getting a that doesn't: exist expecting error", async () => {  
            let product = await request(app)
            .get(routePath+'/products')
            .set("Cookie", adminCookie)
            .query({grouping: "model", model: "product1213312"})
            .expect(404)

        })


    })


    describe("GET /products/available", () => {
        
        test("Getting availble product list by model", async () => {  
            let product = await request(app)
            .get(routePath+'/products/available')
            .query({grouping: "model", model: "product1"})
            .set("Cookie", adminCookie)
            .expect(200)
            let adm = product.body[0]
            expect(adm.model).toBe(product1.model)
            expect(adm.category).toBe(product1.category)
            expect(adm.quantity).toBe(3)

        })

        test("Getting available product list by category", async () => {  
            let product = await request(app)
            .get(routePath+'/products/available')
            .query({grouping: "category", category: "Laptop"})
            .set("Cookie", adminCookie)
            .expect(200)
            let adm = product.body[0]
            expect(adm.model).toBe(product2.model)
            expect(adm.category).toBe(product2.category)
            expect(adm.quantity).toBe(3)

        })

        test("Getting available product list: bad request, expecting an error (line 249)", async () => {  
            let product = await request(app)
            .get(routePath+'/products/available')
            .set("Cookie", adminCookie)
            .query({grouping: "model", category:"Smartphone"})
            .expect(422)
        })

        test("Getting available product list: bad request, expecting an error (line 256)", async () => {  
            let product = await request(app)
            .get(routePath+'/products/available')
            .set("Cookie", adminCookie)
            .query({grouping: "category", category:"bad"})
            .expect(422)
        })

        test("Getting available product list: bad request, expecting an error (line 264)", async () => {  
            let product = await request(app)
            .get(routePath+'/products/available')
            .set("Cookie", adminCookie)
            .query({grouping: "category", model:"product1"})
            .expect(422)
        })

        test("Getting available product list: bad request, expecting an error (line 271)", async () => {  
            let product = await request(app)
            .get(routePath+'/products/available')
            .set("Cookie", adminCookie)
            .query({grouping: "model", model:" "})
            .expect(422)
        })

        test("Getting available that doesn't: exist expecting error", async () => {  
            let product = await request(app)
            .get(routePath+'/products/available')
            .set("Cookie", adminCookie)
            .query({grouping: "model", model: "product1213312"})
            .expect(404)

        })

    })  
    
    describe("DELETE /products/:model", () => {
        test("Deleting a specific product", async () => { 
            await request(app)
            .delete(routePath+'/products/product2')
            .set("Cookie", adminCookie)
            .expect(200)
        })

        test("Deleting a product that doesn't exist, should throw an error", async () => { 
            await request(app)
            .delete(routePath+'/products/product34')
            .set("Cookie", adminCookie)
            .expect(404)
        })

    })

    

    describe("DELETE /products", () => {
        test("Deleting ALL products", async () => { 
            await request(app)
            .delete(routePath+'/products')
            .set("Cookie", adminCookie)
            .expect(200)
        })

        
    })

})

