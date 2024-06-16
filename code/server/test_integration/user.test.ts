import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";

const routePath = "/ezelectronics";


const customer = {username: "customer", name: "customer",surname: "customer", password: "customer",role: "Customer"};
const admin = {username: "admin",name: "admin",surname: "admin",password: "admin",role: "Admin"};
const newUserData = {name: "newName",surname: "newSurname",address: "newAddress",birthdate: "2016-06-10"};
const newadmin = {username: "newadmin",name: "admin",surname: "admin",password: "admin",role: "Admin",};

let customerCookie: string;
let adminCookie: string;

const postUser = async (userInfo: any) => {
  await request(app)
    .post(routePath + "/users")
    .send(userInfo)
    .expect(200);
};


const login = async (userInfo: any) => {
  return new Promise<string>((resolve, reject) => {
    request(app)
      .post(routePath + "/sessions")
      .send(userInfo)
      .expect(200)
      .end((err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res.header["set-cookie"][0]);
      });
  });
};



beforeAll(async () => {
  cleanup();
  await postUser(admin);
  adminCookie = await login(admin);
});


afterAll(() => {
  cleanup();
});


describe("User Routes integration tests", () => {
  describe("POST ezelectronics/users", () => {
    test("It should return a 200 success code and create a user", async () => {
      await request(app)
        .post(routePath + "/users")
        .send(customer)
        .expect(200);
      const users = await request(app)
        .get(routePath + "/users")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(2);
      let customerData = users.body.find(
        (user: any) => user.username === customer.username,
      );
      expect(customerData).toBeDefined();
      expect(customerData.name).toBe(customer.name);
      expect(customerData.surname).toBe(customer.surname);
      expect(customerData.role).toBe(customer.role);
    });


    test("It should return a 422 error code if user tries to Create a new user with missing parameters", async () => {
      await request(app)
        .post(routePath + "/users")
        .send({
          username: "",
          name: "test",
          surname: "test",
          password: "test",
          role: "Customer",
        })
        .expect(422);
      await request(app)
        .post(`${routePath}/users`)
        .send({
          username: "test",
          name: "",
          surname: "test",
          password: "test",
          role: "Customer",
        })
        .expect(422);
    });

    test("It should return a 409 error code if user Creating a user that already exists", async () => {
      await request(app)
        .post(routePath + "/users")
        .send(customer)
        .expect({ error: "The username already exists", status: 409 });
    });
  });


  describe("GET ezelectronics/users", () => {
    test("It should return a 200 success code and Retrive a list of all the users", async () => {
      const users = await request(app)
        .get(routePath + "/users")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(2);
      let customerData = users.body.find(
        (user: any) => user.username === customer.username,
      );
      expect(customerData).toBeDefined();
      expect(customerData.name).toBe(customer.name);
      expect(customerData.surname).toBe(customer.surname);
      expect(customerData.role).toBe(customer.role);
      let adminData = users.body.find(
        (user: any) => user.username === admin.username,
      );
      expect(adminData).toBeDefined();
      expect(adminData.name).toBe(admin.name);
      expect(adminData.surname).toBe(admin.surname);
      expect(adminData.role).toBe(admin.role);
    });


    test("It should return a 401 Unauthorized error code if The user that requesting the list, is not an admin ", async () => {
      customerCookie = await login(customer);
      await request(app)
        .get(routePath + "/users")
        .set("Cookie", customerCookie)
        .expect({ error: "User is not an admin", status: 401 });
      await request(app)
        .get(routePath + "/users")
        .expect({ error: "Unauthenticated user", status: 401 });
    });
  });


  describe("GET ezelectronics/users/roles/:role", () => {
    test("It should return a 200 success code and retrieve all the admin users", async () => {
      const admins = await request(app)
        .get(routePath + "/users/roles/Admin")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(admins.body).toHaveLength(1);
      let adminData = admins.body[0];
      expect(adminData.username).toBe(admin.username);
      expect(adminData.name).toBe(admin.name);
      expect(adminData.surname).toBe(admin.surname);
    });


    test("It should return a 422 validationError code if requesting the users with invalid role ", async () => {
      await request(app)
        .get(routePath + "/users/roles/InvalidRole")
        .set("Cookie", adminCookie)
        .expect(422);
    });


    test("It should return a 200 success code while Requesting all the users with a role", async () => {
      let result = await request(app)
        .get(routePath + "/users/roles/Manager")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(result.body).toHaveLength(0);
    });
  });


  describe("GET ezelectronics/users/:username", () => {
    test("It should return a 200 success code and Retrieve the user data from username", async () => {
      const admins = await request(app)
        .get(routePath + "/users/admin")
        .set("Cookie", adminCookie)
        .expect(200);
      let adm = admins.body;
      expect(adm.username).toBe(admin.username);
      expect(adm.name).toBe(admin.name);
      expect(adm.surname).toBe(admin.surname);
    });


    test("It should return a 200 success code while an admin accessing other user data", async () => {
      const req = await request(app)
        .get(routePath + "/users/customer")
        .set("Cookie", adminCookie)
        .expect(200);
      let customerDate = req.body;
      expect(customerDate.username).toBe(customer.username);
      expect(customerDate.name).toBe(customer.name);
      expect(customerDate.surname).toBe(customer.surname);
    });


    test("It should return a 401 error code while a normal user try to access other users data", async () => {
      customerCookie = await login(customer);
      await request(app)
        .get(routePath + "/users/admin")
        .set("Cookie", customerCookie)
        .expect({
          error: "This operation can be performed only by an admin",
          status: 401,
        });
    });


    test("It should return a 404 error code If the provided username does not exist", async () => {
      await request(app)
        .get(routePath + "/users/invalidUsername")
        .set("Cookie", adminCookie)
        .expect({ error: "The user does not exist", status: 404 });
    });
  });


  describe("DELETE ezelectronics/users/:username", () => {
    test("It should return a 401 error code if the Customer try to delete another user", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(routePath + "/users/admin")
        .set("Cookie", customerCookie)
        .expect({
          error: "This operation can be performed only by an admin",
          status: 401,
        });
    });


    test("It should return a 401 error code if the username does not exist in the database", async () => {
      await request(app)
        .delete(routePath + "/users/invalidUsername")
        .set("Cookie", adminCookie)
        .expect({ error: "The user does not exist", status: 404 });
    });


    test("It should return a 401 error code if Admin user try to delete another admin user", async () => {
      await postUser(newadmin);
      await login(newadmin);
      await request(app)
        .delete(routePath + "/users/newadmin")
        .set("Cookie", adminCookie)
        .expect({ error: "Admins cannot be deleted", status: 401 });
    });


    test("It should return a 200 success code if Admin user delete a non admin user", async () => {
      await request(app)
        .delete(routePath + "/users/customer")
        .set("Cookie", adminCookie)
        .expect(200);
      let users = await request(app)
        .get(routePath + "/users")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(2);
      let adminData = users.body.find(
        (user: any) => user.username === admin.username,
      );
      expect(adminData).toBeDefined();
      expect(adminData.name).toBe(admin.name);
      expect(adminData.surname).toBe(admin.surname);
      expect(adminData.role).toBe(admin.role);
      await postUser(customer);
      users = await request(app)
        .get(routePath + "/users")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(3);
    });
  });


  describe("PATCH ezelectronics/users/:username", () => {
    test("It should return a 401 error code if The user is not logged in", async () => {
      await request(app)
        .patch(routePath + "/users/customer")
        .send(newUserData)
        .expect({ error: "Unauthenticated user", status: 401 });
    });


    test("It should return a 422 error code if The name field is missing", async () => {
      await request(app)
        .patch(routePath + "/users/customer")
        .send({
          surname: "newSurname",
          address: "newAddress",
          birthdate: "2016-06-09",
        })
        .set("Cookie", adminCookie)
        .expect(422);
    });

    
    test("It should return a 422 error code if The birthdate is in the future", async () => {
      await request(app)
        .patch(routePath + "/users/customer")
        .send({
          name: "newName",
          surname: "newSurname",
          address: "newAddress",
          birthdate: "2024-07-30",
        })
        .set("Cookie", adminCookie)
        .expect(422);
    });

    
    test("It should return a 404 error code if The username is not an existing user", async () => {
      await request(app)
        .patch(routePath + "/users/invalidUsername")
        .send(newUserData)
        .set("Cookie", adminCookie)
        .expect({ error: "The user does not exist", status: 404 });
    });

    
    test("It should return a 401 error code if The user is an admin and tries to modify another admin", async () => {
      await request(app)
        .patch(routePath + "/users/newadmin")
        .send(newUserData)
        .set("Cookie", adminCookie)
        .expect({
          error: "You cannot access the information of other users",
          status: 401,
        });
    });



  describe("DELETE ezelectronics/users", () => {
    test("It should return a 401 error code if a normal user try to delete all users", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(routePath + "/users")
        .set("Cookie", customerCookie)
        .expect({ error: "User is not an admin", status: 401 });
    });

    
    test("It should return a 200 success code if an admin user deletes all users", async () => {
      await request(app)
        .delete(routePath + "/users")
        .set("Cookie", adminCookie)
        .expect(200);
      let users = await request(app)
        .get(routePath + "/users")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(2);
      let firstAdminData = users.body.find(
        (user: any) => user.username === admin.username,
      );
      expect(firstAdminData).toBeDefined();
      expect(firstAdminData.name).toBe(admin.name);
      expect(firstAdminData.surname).toBe(admin.surname);
      expect(firstAdminData.role).toBe(admin.role);
      let secondAdminData = users.body.find(
        (user: any) => user.username === newadmin.username,
      );
      expect(secondAdminData).toBeDefined();
      expect(secondAdminData.name).toBe(admin.name);
      expect(secondAdminData.surname).toBe(admin.surname);
      expect(secondAdminData.role).toBe(admin.role);
      await postUser(customer);
      users = await request(app)
        .get(routePath + "/users")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(3);
    });
  });

  describe("POST ezelectronics/sessions", () => {
    test("It should return an error if the user is not in the database", async () => {
      await request(app)
        .post(routePath + "/sessions")
        .send({ username: "invalidUsername", password: "invalidPassword" })
        .expect({ message: "Incorrect username and/or password" });
    });
    test("It should return a 200 success code if the login was Successful", async () => {
      await request(app)
        .post(routePath + "/sessions")
        .send({ username: "admin", password: "admin" })
        .expect(200);
    });
  });


  describe("GET ezelectronics/sessions/current", () => {
    test("It should return a 200 success code if the retrieval of the logged in user was Successful", async () => {
      const user = await request(app)
        .get(routePath + "/sessions/current")
        .set("Cookie", adminCookie)
        .expect(200);
      expect(user.body.username).toBe(admin.username);
      expect(user.body.name).toBe(admin.name);
      expect(user.body.surname).toBe(admin.surname);
    });
  });

  describe("DELETE ezelectronics/sessions/current", () => {
    test("It should return a 200 success code if the logout was Successful", async () => {
      await request(app)
        .delete(routePath + "/sessions/current")
        .set("Cookie", adminCookie)
        .expect(200);
    });
  });
});

});
