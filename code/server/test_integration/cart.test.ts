import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { cleanup } from "../src/db/cleanup" 
import { app } from "../index"


const routePath = "/ezelectronics" 

const customer = { username: "customer1", name: "customer1", surname: "customer1", password: "customer1", role: "Customer" }
const customer2 = { username: "customer2", name: "customer2", surname: "customer2", password: "customer2", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const productToAdd = { model: "iPhone", category: "Smartphone", quantity: 10, details: "", sellingPrice: 999 }

let customerCookie: string
let adminCookie: string


//create a user 
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}


//log in a user
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
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

const logout = async (cookie: string) => {
    await request(app)
        .delete(`${routePath}/sessions/current`)
        .set('Cookie', cookie)
        .expect(200)

}



beforeAll(async () => {
    await postUser(customer)
    await postUser(admin)
    await postUser(customer2)
})



afterAll(() => {
    cleanup()
})

describe("Cart routes integration tests", ()=>{
    describe("GET ezelectronics/carts", ()=>{
        test("It should return a 200 success code and retrieve the cart of the user", async ()=>{
            customerCookie = await login(customer)
            
            const carts = await request(app)
                .get(`${routePath}/carts`)
                .set('Cookie', customerCookie)
                .expect(200)
                let cart = carts.body
                expect(cart).toBeDefined()
                expect(cart.paid).toBe(false)
                expect(cart.total).toBe(0)

            await logout(customerCookie)
        })
    })



    describe("PATCH ezelectronics/carts", ()=>{

        test("It should return a 404 error code if the cart doesn't exists", async()=>{
            customerCookie = await login(customer)
            
            const cart = await request(app)
                .patch(`${routePath}/carts/Invalid`)
                .set('Cookie', customerCookie)
                .expect(404)
            await logout(customerCookie)
        })
    })

    describe("GET ezelectronics/carts/history", ()=>{
        test("It should return a 200 success code", async()=>{
            
            customerCookie = await login(customer)
            const carts = await request(app)
                .get(`${routePath}/carts/history`)
                .set("Cookie", customerCookie)
                .expect(200)

                expect(carts.body).toBeDefined()
            await logout(customerCookie)
        })
    })



    describe("GET ezelectronics/carts/all", ()=>{
        test("It should return a 200 success code and retrieve all carts", async ()=>{
            const customerx = {username:"customerx", name:"customer", surname:"customer", password:"customer", role:"Customer"}
            adminCookie = await login(admin)
            const carts = await request(app)
                .get(`${routePath}/carts/all`)
                .set('Cookie', adminCookie)
                .expect(200)
                let cartsArray = carts.body
                expect(cartsArray).toBeDefined()
            await logout(adminCookie)
        })

        test("It should return a 401 error code if the user is not an admin or manager", async ()=>{
            customerCookie = await login(customer)
            await request(app)
                .get(`${routePath}/carts/all`)
                .set('Cookie', customerCookie)
                .expect(401)
            await logout(customerCookie)
        })
    })

    describe("DELETE ezelectronics/carts", ()=>{
        test("It should return a 200 success code ", async ()=>{
            const adminCookie = await login(admin)
            await request(app)
                .delete(`${routePath}/carts`)
                .set('Cookie', adminCookie)
                .expect(200)
            await logout(adminCookie)
        })
    })




    
describe("POST ezelectronics/carts", () => {
    test("It should add a product to the cart successfully", async () => {
        
        customerCookie = await login(customer);
        adminCookie = await login(admin);

        await request(app)
        .post(`${routePath}/products`)
        .set("Cookie", adminCookie)
        .send(productToAdd).expect(200);

      await request(app)
        .post(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .send({ model: productToAdd.model })
        .expect(200);

      await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(200);

        await logout(adminCookie);
        await logout(customerCookie);
    });
});

})

