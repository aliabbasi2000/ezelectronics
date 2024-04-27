# Requirements Document - current EZElectronics

Date: 22/04/2024

Version: V1 - description of EZElectronics in CURRENT form (as received by teachers)

| Version number | Change |
| :------------: | :----: |
|       V1.0.3         |     V1    |

# Contents

- [Requirements Document - current EZElectronics](#requirements-document---current-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Stakeholder name | Description |
| :--------------: | :---------: |
| Customer  |       Users of Application who purchase product      |
| Manager  |      Users of Application who sell product       |
| Start up Company  |    Developer of Software and Admins and CEO         |
| Product Company  |      The Company producing the Product       |
| Competitors  |       Competitor companies E.g. Ebay, Amazon retail, ...      |
| Payment Sevice ???  |       pay online / Pay by cash - E.g. paypal      |

# Context Diagram and interfaces

## Context Diagram

![ContextDiagram.jpg](./Diagrams/v1/ContextDiagram.jpg)

## Interfaces

\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

|   Actor   | Logical Interface | Physical Interface |
| :-------: | :---------------: | :----------------: |
| Users: Customer, Manager |           Smartphone, PC        |       Web Page              |
| Tech Admin |         PC          |           Web Page         |
| Payment Service |       Internet Link           |       https://developer.paypal.com/api/rest/             |
| Data Base |      SQL           |      Server              |





# Stories and personas

\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>

# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

|  ID   | Description |
| :---: | :---------: |
|  FR1: Manage Products  |     • FR1.0 Create a new Product / Delete a Product/ Delete all Products <br /> • FR1.1 Registers the arrival of Products with same model    <br /> • FR1.2 Mark a product as sold  <br /> • FR1.3 Retrieve a product (All / with the same Category / Model)  <br /> • FR1.4 Registers the arrival of a set of products <br /> • FR1.5 Mark a product as sold |
|  FR2: Manage Users  |   • FR2.0 Retrieves logged in user's Info.  <br /> • FR2.1 Retrieve a User (list of all users/ all users with a role / specific User with username)  <br /> •FR2.2 Create User / Delete User / Delete user with username / Delete all the users    |
|  FR3: Manage Cart  |      • FR3.0 Return the curent cart <br /> • FR3.1 Add / Remove a product to cart   <br /> • FR3.2  Returns the history of the paid carts of the User <br /> • FR3.3 Delete the cart of current user /Delete all carts |
|  FR4: Manage Payment  |     • FR4.0 Pay the current cart |
|  FR5: Authorization and Authentication  |       • FR5.0 Log in/Log out     |



## Non Functional Requirements

\<Describe constraints on functional requirements>

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   |              Reliability                      |      • No more than one defect per user      |      All Functions     |
|  NFR2   |                 Usability                   |      •  Customer should be able to use Web app with no training less than 2 min.       |     FR3, FR4, FR5      |
|  NFR3   |                 Usability                   |      • Manager  should be able to use Web app with no training less than 5 min.       |     FR1, FR5      |
|  NFR4   |                 Efficiency                   |    • Website should be loaded in less than 2 sec <br /> • execution of functions take less than 0.1 sec      |      All Functions     |
| NFR5 |               Portability                     |     • Web App  should be compatible with different browsers (Chrome, Edge, Safari, Mozila)    |     All Functions      |
| NFR6 |               Portability                     |     • Web App  should have different versrions for Devices (Desktop Version, Smartphone Version)     |     All Functions      |
| NFR7 |               Privacy                     |     • Customer data should not be used for commercial purposes in other companies and the purchase history should be available just for the Customer and the Company.     |     FR2, FR3      |
| NFR8 |               Security                     |     • The user information should be saved in data base in encrypted format and the payment portal shouold be safe   |     FR2, FR4, FR5      |

# Use case diagram and use cases

## Use case diagram

![UseCaseDiagram.jpg](./Diagrams/v1/UseCaseDiagram.jpg)

### Use case 1, View Account Info

| Actors Involved  |            Customer, Manager               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has account and is Logged in (authenticated) |
|  Post condition  | User See his Account Information  |
| Nominal Scenario | 1.1 The Page Containting Customer info pop ups  </br> 1.2 The Page Containting Manager info pop ups   |
|     Variants     |                                  |
|    Exceptions    | 1.3 Connection with database is lost and cannot retrieve the data       |

##### Scenario 1.1

|  Scenario 1.1  |       The Page Containting Customer info pop ups        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has account and is Logged in as Customer (authenticated) |
| Post condition |  Customer See his Account Information |
|     Step#      |            Description                   |
|       1        |   The User Clicks on the Account Info    |
|       2        |   FR2.0 Retrieves logged in user's Info.  |
|       3       |    Show it on the web page                      |

##### Scenario 1.2

|  Scenario 1.2  |       The Page Containting Manager info pop ups        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has account and is Logged in as Manager (authenticated) |
| Post condition |  Manager See his Account Information |
|     Step#      |            Description                   |
|       1        |   The User Clicks on the Account Info    |
|       2        |   FR2.0 Retrieves logged in user's Info.  |
|       3       |    Show it on the web page                      |

##### Scenario 1.3

|  Scenario 1.3  |   1.3 Connection with database is lost and cannot retrieve the data  |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has account and is Logged in (authenticated) |
| Post condition |  User See an Error |
|     Step#      |            Description                   |
|       1        |   The User Clicks on the Account Info    |
|       2        |   FR2.0 Retrieves logged in user's Info. |
|       3        |    The dataBase returns an error for internal reason        |
|       4        |    User see the Error message on the Web Page        |



### Use case 2, Delete Account

| Actors Involved  |             Customer, Manager               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is not logged in (it is a problem the fixed in Version 2) |
|  Post condition  | User has been Deleted his Account  |
| Nominal Scenario |  2.1 User has been Deleted his Account  |
|     Variants     |                                  |
|    Exceptions    |  2.2 404 Error, Username does not exist in the dataBase    |

##### Scenario 2.1

|  Scenario 2.1  |       User has been Deleted his Account        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is not logged in |
| Post condition |  User has been Deleted his Account |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the Delete Account button    |
|       2        |  User Provides its username (It should be fixed in V2, deleting account without authentication !!)   |
|       4        |  FR.2.1 Delete User     |
|       5        |  A message pops up that your account has been deleted       |
|       6        |  Redirect user to the home page       |

##### Scenario 2.2

|  Scenario 2.1  |       404 Error, Username does not exist in the dataBase         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is not logged in |
| Post condition |  User has been faced with 404 Error |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the Delete Account button    |
|       2        |  User provides its username   |
|       3        |  database says there in no record with Provided info! |
|       5        |  404 Error message pops up      |



### Use case 3, Create Account

| Actors Involved  |             Customer, Manager               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has no account  |
|  Post condition  | User has been Created an Account  |
| Nominal Scenario |  3.1 User has been Created a Customer Account </br> 3.2 User has been Created a Manager Account |
|     Variants     |                                  |
|    Exceptions    |  3.3 409 Error, user already exist in database    |


##### Scenario 3.1

|  Scenario 3.1  |       User has been Created a Customer Account        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has no account |
| Post condition |  User has been Created a Customer Account |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the Create Account button    |
|       2        |  Enter the information as input and the role is Customer  |
|       3        |  FR2.1 Create User  |
|       4        |  A message pops up that your account has been created       |
|       5        |  Redirect user to the Login page       |

##### Scenario 3.2

|  Scenario 3.2  |       User has been Created a Manager Account        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has no account |
| Post condition |  User has been Created a Manager Account |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the Create Account button    |
|       2        |  Enter the information as input and the role is Manager  |
|       3        |  FR2.1 Create User  |
|       4        |  A message pops up that your account has been created       |
|       5        |  Redirect user to the Login page       |

##### Scenario 3.3

|  Scenario 3.3  |       409 Error, user already exist in database        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account |
| Post condition |  409 Error, user already exist in database |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the Create Account button    |
|       2        |  Enter the information as input and the role is Manager  |
|       2        |  FR2.1 Create User  |
|       3        |  database retrieves an error that the username is already exist  |
|       5        |  409 Error pops up: user already exist in database       |
|       6        |  Redirect user to the Login page       |




### Use case 4, View Product List

| Actors Involved  |             Customer, Manager               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in (Authenticated) |
|  Post condition  | User see the result as list of products   |
| Nominal Scenario |  4.1 User Views the product list based on Model </br> 4.2 User Views the product list based on Category |
|     Variants     |                                  |
|    Exceptions    |  4.3 No Product Found based on the criteria    |


##### Scenario 4.1

|  Scenario 4.1  |       User Views the product list based on Model       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in (Authenticated) |
| Post condition |  User Views the product list based on Model |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the View by Model button    |
|       2        |  FR1.3 Retrieve product list with same model  |
|       3        |  the list of products with same model show up in the web page  |

##### Scenario 4.2

|  Scenario 4.2  |       User Views the product list based on Category       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in (Authenticated) |
| Post condition |  User Views the product list based on Category |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the View by Category button    |
|       2        |  FR1.3 Retrieve product list with same Category  |
|       3        |  the list of products with same Category show up in the web page  |

##### Scenario 4.3

|  Scenario 4.3  |       No Product Found based on the criteria       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in (Authenticated) |
| Post condition |  No Product Found based on the criteria |
|     Step#      |            Description                   |
|       1        |  The User Clicks on the View by Category button    |
|       2        |  FR1.3 Retrieve product list with same Category  |
|       3        |  Database Retrieves: Null  |
|       4        |  This message pops up: No Product Found based on the criteria  |



### Use case 5, View Cart 

| Actors Involved  |             Customer               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Customer (Authenticated) |
|  Post condition  | Customer view the Details of the cart   |
| Nominal Scenario |  5.1 Customer can view the details of his cart |
|     Variants     |                                  |
|    Exceptions    |  5.2 No Product in the cart.    |


##### Scenario 5.1

|  Scenario 5.1  |       Customer view the Details of the cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition |  Customer view the Details of the cart |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on the View Cart button    |
|       2        |  FR3.0 Return History of the paid carts of the user |
|       3        |  The Cart details will be Displayed on the web page |

##### Scenario 5.2

|  Scenario 5.2  |       No Product in the Cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition |  Customer see No Product has been added to cart Message. |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on the View Cart button    |
|       2        |  FR3.0 Return History of the paid carts of the user |
|       3        |  DataBase returns NULL |
|       3        |  "No Product has been added to the cart. Keep Shopping.." will pops up. |





### Use case 6, View Cart History

| Actors Involved  |             Customer               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Customer (Authenticated) |
|  Post condition  | Customer view the history of cart   |
| Nominal Scenario |  6.1 Customer can view the history of his cart |
|     Variants     |                                  |
|    Exceptions    |  6.2 No history for cart is available    |


##### Scenario 6.1

|  Scenario 6.1  |       Customer can view the history of his cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition |  Customer can view the history of his cart |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on the View Cart History button    |
|       2        |  FR3.2 Return History of the paid carts of the user |
|       3        |  The list will be Displayed on the web page |

##### Scenario 6.2

|  Scenario 6.2  |       No history for cart is available       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition |  Error Message: No Cart History Available |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on the View Cart History button    |
|       2        |  FR3.2 Return History of the paid carts of the user |
|       3        |  DataBase returns NULL |
|       3        |  No Cart History Message will be desplayed to the Customer |





### Use case 7, Add Product to the Cart

| Actors Involved  |             Customer               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Customer (Authenticated) |
|  Post condition  | The cart contains the product   |
| Nominal Scenario |  6.1 Customer successfully add product to his cart |
|     Variants     |  6.2 Customer add n product to his cart   |
|    Exceptions    |  6.2 The product is sold out or unavailable    |


##### Scenario 7.1

|  Scenario 7.1  |       Customer add a product to his cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition |  The cart contains the product |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on Add Product button    |
|       2        |  FR3.1 Add product to the current cart |
|       3        |  if Customer clicks on "Show Cart" FR3.0 Return current cart|

##### Scenario 7.2

|  Scenario 7.2  |      Customer add n product to his cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition |  The cart contains n product |
|     Step#      |            Description                   |
|       1        |  The Customer selects n number of products    |
|       2        |  The Customer Clicks on Add Product button  |
|       3        |  n * FR3.1 Add product to the current cart |
|       4        |   if Customer clicks on "Show Cart" FR3.0 Return current cart  |


##### Scenario 7.3

|  Scenario 7.2  |      The product is sold out or unavailable       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition | This msg Pops up: The product is sold out or unavailable |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on Add Product button  |
|       2        |  FR3.1 Add product to the current cart |
|       3        |  DataBase return an Error  |
|       4        |  This msg Pops up: The product is sold out or unavailable |


### Use case 8, Remove Product from the Cart

| Actors Involved  |             Customer               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Customer and it has at least one product in Cart |
|  Post condition  | The product is Removed from the cart   |
| Nominal Scenario |  8.1 The product is Successfully Removed from the cart |
|     Variants     |     |
|    Exceptions    |  8.2 The product does not exist in cart - 404 Error   |


##### Scenario 8.1

|  Scenario 8.1  |       The product is Removed from the cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer and it has at least one product in Cart  |
| Post condition |  The product is Removed from the cart |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on Remove Product button    |
|       2        |  FR3.1 Remove the product from the current cart |
|       3        |  if Customer clicks on "Show Cart" FR3.0 Return current cart|

##### Scenario 8.2

|  Scenario 8.2  |      The product does not exist in cart - 404 Error       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer and it has at least one product in Cart  |
| Post condition |  The product does not exist in cart and nothing changed |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on Remove Product button  |
|       2        |  FR3.1 Remove the product from the current cart |
|       3        |  Database Returns an Error  |
|       4        |  "The product does not exist in cart - 404 Error"  Message Pops up  |


### Use case 9, Delete Cart

| Actors Involved  |             Customer               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Customer and it has at least one product in Cart  |
|  Post condition  | The cart has been deleted   |
| Nominal Scenario |  9.1 Customer successfully deleted his cart |
|     Variants     |    |
|    Exceptions    |  9.2 There is no product in the cart    |


##### Scenario 9.1

|  Scenario 9.1  |       Customer successfully deleted his cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer and it has at least one product in Cart  |
| Post condition |  The cart has been deleted |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on Delete Cart button    |
|       2        |  FR3.3 Delete current cart of the current cart |
|       3        |  Database successfully deletes the records related to the Cart |
|       4        |  "you Deleted your cart successfully" msg pops up |
|       5        |  Navigate customer to Home Page |

##### Scenario 9.1

|  Scenario 9.2  |      There is no product in the cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Customer (Authenticated) |
| Post condition |  There is no product in the cart and nothing changed |
|     Step#      |            Description                   |
|       1        |  The Customer Clicks on Delete Cart button    |
|       2        |  FR3.3 Delete current cart of the current cart |
|       3        |  Database Returns an error |
|       4        |  "You do not have any cart" msg pops up |
|       5        |  Navigate customer to Home Page |




### Use case 10, Create a new Product

| Actors Involved  |             Manager               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Manager (Authenticated) |
|  Post condition  | The product is added to the Inventory   |
| Nominal Scenario |  10.1 Manager successfully add product to the Inventory |
|     Variants     |    |
|    Exceptions    |  10.2 The product is already exist in the database - 409 Error </br> 10.3 The arrivalDate of the product is after the current date    |


##### Scenario 10.1

|  Scenario 10.1  |       Manager add a product to his cart       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product is added to the Inventory |
|     Step#      |            Description                   |
|       1        |  The Manager Clicks on Add a new Product  button    |
|       2        |  The Manager enters the information of the product    |
|       3        |  FR1.0 Create a new product |
|       4        |  Insert the Product in DataBase |
|       5        |  DataBase Returns success |
|       6        |  "The product has been added" msg pops up and manager can see the new product in his product list|


##### Scenario 10.2
|  Scenario 10.2  |      The product is already exist in the database - 409 Error       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product is already exist in the database - 409 Error |
|     Step#      |            Description                   |
|       1        |  The Manager Clicks on Add a new Product  button    |
|       2        |  The Manager enters the information of the product    |
|       3        |  FR1.0 Create a new product |
|       4        |  Insert the Product in DataBase |
|       5        |  DataBase Returns error - "Duplicated product ID" |
|       6        |  "The product is already exist in our DataBase" msg pops up|


##### Scenario 10.3

|  Scenario 10.2  |      Manager Inserts an invalid arrival Date - 409 Error       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |   The arrivalDate of the product is after the current date - 409 Error |
|     Step#      |            Description                   |
|       1        |  The Manager Clicks on Add a new Product  button    |
|       2        |  The Manager enters the information of the product    |
|       3        |  The Manager inserts the arrival date manually    |
|       4        |  FR1.4 Register the Arrival of a set of product |
|       3        |  FR1.0 Create a new product |
|       4        |  Insert the Product in DataBase |
|       5        |  we check Arrival date which manager entered is after the current date = True  |
|       6        |  "The arrivalDate of the product is after the current date - 409 Error" msg pops up|



### Use case 11, Delete a Product

| Actors Involved  |             Manager               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Manager (Authenticated) |
|  Post condition  | The product is Deleted from the Inventory   |
| Nominal Scenario |  11.1 Manager successfully Deletes the product from the Inventory |
|     Variants     |    |
|    Exceptions    |  11.2 The product does not represent a product in our database - 404 Error    |


##### Scenario 11.1

|  Scenario 11.1  |       Manager successfully Deletes the product from the Inventory       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product is Deleted from the Inventory |
|     Step#      |            Description                   |
|       1        |   The Manager Selects the product to be deleted   |
|       2        |   The Manager Clicks on Delete the Product  button  |
|       3        |  FR1.0 Delete a product |
|       4        |  Delete the Product from the DataBase |
|       5        |  DataBase Returns successfull result |
|       6        |  "The product has been Deleted" msg pops up|


##### Scenario 11.2
|  Scenario 11.2  |      The product does not represent a product in our database       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product does not represent a product in our database - 404 Error |
|     Step#      |            Description                   |
|       1        |   The Manager Selects the product to be deleted   |
|       2        |   The Manager enters the product ID  |
|       3        |  FR1.0 Delete a product |
|       4        |  Delete the Product from the DataBase |
|       5        |  DataBase Returns Error - Does not represent a record in Database |
|       6        |  "There is no such a Product" msg pops up|



### Use case 12, Registers the arrival of a set of products

| Actors Involved  |             Manager               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Manager (Authenticated) |
|  Post condition  | All the products are added to the inventory   |
| Nominal Scenario |  12.1 Manager successfully added All the products to the inventory |
|     Variants     |    |
|    Exceptions    |  12.2 The product is already registered in our database </br>  12.3 The ArrivalDate is invalid   |


##### Scenario 12.1

|  Scenario 12.1  |       Manager successfully added All the products to the inventory        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  All the products are added to the inventory |
|     Step#      |            Description                   |
|       1        |   The Manager selects Register a set of arrivals   |
|       2        |   The Manager inserts the information of them  |
|       3        |  FR1.4 Register the arrival of set of products |
|       4        |  Insert data to the DataBase |
|       5        |  DataBase Returns successfull result |
|       6        |  "The products successfully have been Registered" msg pops up|


##### Scenario 12.2

|  Scenario 12.2  |       The product is already registered in our database        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product is already in our database - Error |
|     Step#      |            Description                   |
|       1        |   The Manager selects Register a set of arrivals   |
|       2        |   The Manager inserts the information of them  |
|       3        |  FR1.4 Register the arrival of set of products |
|       4        |  Insert data to the DataBase |
|       5        |  DataBase Returns Error - Duplicate Data |
|       6        |  "Error: The products have not been Registered - Already in our Database " msg pops up|

##### Scenario 12.3

|  Scenario 12.3  |       The ArrivalDate is invalid         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The ArrivalDate is invalid - Error |
|     Step#      |            Description                   |
|       1        |   The Manager selects Register a set of arrivals   |
|       2        |   The Manager inserts the information of them  |
|       3        |  FR1.4 Register the arrival of set of products |
|       4        |  if (The Arrival date is after current date) == True |
|       5        |  "Error: The products have not been Registered due to the invalid ArrivalDate" msg pops up|



### Use case 13, Sell Product

| Actors Involved  |             Manager, Customer               |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User has an account and Logged in as Manager (Authenticated) |
|  Post condition  | The product marked as sold in the system  |
| Nominal Scenario |  13.1 Manager successfully sold an Item  |
|     Variants     |    |
|    Exceptions    |  13.2 404 Error - The product ID does not represent a product in database </br>  13.3 Error - The product has already been sold  </br>  13.4 Error - SellingDate is after the current date </br>  13.5 Error - SellingDate is before the product's arrivalDate  |


##### Scenario 13.1

|  Scenario 13.1  |       Manager successfully sold an Item of his Inventory        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product marked as sold in the system and the  |
|     Step#      |            Description                   |
|       1        |   ProductID is recieved from Customer which wants to buy   |
|       2        |  check the productId exist in database == True  |
|       3        |  check the product has been sold out == False |
|       4        |  Check the SellingDate is after the current date == False |
|       5        |  SellingDate is before the product's arrivalDate == False |
|       6        |  FR1.2 Mark the product as sold |
|       7        |  Update the inventory |

##### Scenario 13.2

|  Scenario 13.2  |       404 Error - The product ID does not represent a product in database        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition | 404 Error - The product ID does not represent a product in database  |
|     Step#      |            Description                   |
|       1        |   ProductID is recieved from Customer which wants to buy   |
|       2        |  check the productId exist in database == False  |
|       3        |  404 Error message pops up "The product ID does not represent a product in database" |

##### Scenario 13.3

|  Scenario 13.3  |       Error - The product has already been sold        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  Error - The product has already been sold  |
|     Step#      |            Description                   |
|       1        |   ProductID is recieved from Customer which wants to buy   |
|       2        |  check the product has been sold out == True |
|        3       |  Error messag pops up: "The product has already been sold out" |

##### Scenario 13.4

|  Scenario 13.4  |       Error - SellingDate is after the current date        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product marked as sold in the system and the  |
|     Step#      |            Description                   |
|       1        |   ProductID is recieved from Customer which wants to buy   |
|       2        |  Check the SellingDate is after the current date == True |
|       3        |  Error message pops up: "SellingDate is after the current date" |

##### Scenario 13.5

|  Scenario 13.5  |      Error - SellingDate is before the product's arrivalDate        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account and Logged in as Manager (Authenticated) |
| Post condition |  The product marked as sold in the system and the  |
|     Step#      |            Description                   |
|       1        |   ProductID is recieved from Customer which wants to buy   |
|       2        |  SellingDate is before the product's arrivalDate == True |
|       3        |  error message pops up: "SellingDate is before the product's arrivalDate" |

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
