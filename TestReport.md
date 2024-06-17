# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Tests](#tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

![Dependency graph](./diagrams/test/dependency_graph.png)

# Integration approach

We used a bottom-up approach in our method. Initially, we tested the three different layers (DOA, Controller, and Routing) separately. After confirming their correct functionality in isolation, we proceeded to integrate them, starting with the DOA functions layer and progressively adding everything together, testing them in combination.


# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

|   Test case name    |           Object(s) tested           | Test level  |          Technique used          |
| :-----------------: | :----------------------------------: | :---------: | :------------------------------: |
|     routes_tests/user     |             User Routes              |     API     |             coverage             |
|   routes_tests/product    |            Product Routes            |     API     |             coverage             |
|     routes_tests/cart     |             Cart Routes              |     API     |             coverage             |
|    routes_tests/review    |            Review Routes             |     API     |             coverage             |
|                     |                                      |             |                                  |
|   controller_tests/user   |           User Controller            |    UNIT     |             coverage             |
| controller_tests/product  |          Product Controller          |    UNIT     |             coverage             |
|   controller_tests/cart   |           Cart Controller            |    UNIT     |             coverage             |
|  controller_tests/review  |          Review Controller           |    UNIT     |             coverage             |
|                     |                                      |             |                                  |
|     dao_tests/user      |               User DOA               |    UNIT     |             coverage             |
|     dao_tests/product      |             Product DOA              |    UNIT     |             coverage             |
|     dao_tests/cart      |               Cart DOA               |    UNIT     |             coverage             |
|     dao_tests/review      |              Review DOA              |    UNIT     |             coverage             |
|                     |                                      |             |                                  |
|                     |                                      |             |                                  |
|  integration/user   |      User routes / controller / DOA      | Integration | Equivalence classes partitioning |
| integration/product | Product & User routes / controller / DOA | Integration | Equivalence classes partitioning |
|  integration/cart   |  Cart & User routes / controller / DOA   | Integration | Equivalence classes partitioning |
| integration/review  | -  | - | - |

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >


|               Functional Requirement or scenario               | Test(s) |
| :------------------------------------------------------------: | :-----: |
|                                                                |         |
|                             USER                               |         |
|                           Create User                          |   4     |
|                             Login                              |    2    |
|                             Logout                             |     2   |
|                   Show the list of all users                   |      6  |
|        Show the list of all users with a specific role         |     6   |
|             Show the information of a single user              |      8  |
|            Update the information of a single user             |      10 |
|                 Delete a single non Admin user                 |    6    |
|                   Delete all non Admin users                   |     4   |
|                                                                |         |
|                          PRODUCT                               |         |
|                 Register a set of new products                 |    9    |
|                Update the quantity of a product                |    9    |
|                         Sell a product                         |    6    |
|                 Show the list of all products                  |    10   |
|            Show the list of all available products             |    11   |
|      Show the list of all products with the same category      |    3    |
| Show the list of all available products with the samSe category|  3      |
|       Show the list of all products with the same model        |    5    |
|  Show the list of all available products with the same model   |     3   |
|                        Delete a product                        |    7    |
|                      Delete all products                       |    9    |
|                                                                |         |
|                           REVIEW                               |         |
|                 Add a new review to a product                  |    -     |
|       Get the list of all reviews assigned to a product        |    -     |
|               Delete a review given to a product               |    -     |
|                Delete all reviews of a product                 |    -     |
|               Delete all reviews of all products               |    -     |
|                                                                |         |
|                             CART                               |         |
|            Show the information of the current cart            |    5     |
|               Add a product to the current cart                |    10     |
|                   Checkout the current cart                    |    10     |
|               Show the history of the paid carts               |     5    |
|             Remove a product from the current cart             |    7     |
|                    Delete the current cart                     |    5     |
|             See the list of all carts of all users             |     6    |
|                        Delete all carts                        |     6    |
|                                                                |         |
|                                                                |         |

## Coverage white box

![Coverage](./diagrams/test/coverage.png)
