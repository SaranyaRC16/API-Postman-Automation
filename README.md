# API-Postman-Automation
This repository contains Postman API automation collections designed to validate RESTful APIs. It includes automated requests, test scripts, environment variables, and data-driven testing to ensure API functionality, reliability, and response validation.

**Overview**

This repository contains Postman-based API automation for the Employee Portal REST API, hosted on Render:

Base URL: https://employee-portal-api-gv9l.onrender.com/

The project demonstrates end-to-end API testing, including request validation, response verification, data-driven testing, variable handling, scripting using JavaScript, and CI/CD execution using Postman CLI and GitHub Actions.

This automation suite is designed to help QA Engineers and SDETs validate API functionality, reliability, and data integrity efficiently.

Tools & Technologies Used

Postman

Postman Collection & Environments

JavaScript (Postman Scripts)

Postman CLI

GitHub Actions (CI/CD)

Render (API Hosting)

Getting Started

**1️. Import Postman Collection**

Open Postman

Click Import

Upload EmploymentPortalAPI.json

The collection Employee Portal API will be added

Authorization Setup

Authorization is configured at the Folder Level

Requests inherit authentication using “Inherit Auth from Parent”

Ensures centralized and reusable authentication handling

**API Test Coverage**
   
**Positive Validations**

Status code validation

Response body verification

Header validation

Data type validation

Property existence checks

JSON format verification

**Negative Validations**

Invalid inputs

Missing required fields

Incorrect request formats

Error response verification

**Dynamic Test Data Handling**

Postman dynamic variables are used extensively:

{{$randomFullName}} – generates random candidate names

{{$randomExampleEmail}} – safe test email generation

**Collection Variables**

Collection variables are used to:

Pass data from one request to another


**JavaScript & Scripting Concepts Covered**

pm.test() callback-based validations

Variable scopes (local, collection, environment)

Functions & callback functions

Boolean validations

Regex-based validations

JSON object & array handling

JSON Schema validation

Header validation

Numeric vs string comparisons

Mock Servers

Postman Mock Servers are used to simulate API behavior.

Running the Collection
Manual Execution
Scheduled Runs (Postman Cloud)
Postman CLI Execution

**CI/CD Integration – GitHub Actions**

**Conclusion**

This project demonstrates a production-ready Postman API automation framework that can be easily extended, integrated into CI/CD pipelines, and used for continuous API quality validation.
