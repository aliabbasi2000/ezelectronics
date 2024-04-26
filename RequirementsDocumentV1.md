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

\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>

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

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>




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

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
