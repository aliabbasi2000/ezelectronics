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

     <report the here the dependency graph of EzElectronics>

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

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement or scenario | Test(s) |
| :--------------------------------: | :-----: |
|                FRx                 |         |
|                FRy                 |         |
|                ...                 |         |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
