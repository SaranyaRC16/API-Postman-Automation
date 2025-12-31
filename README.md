# EmployeePortalAPI
The Employee Portal API is a RESTful service that provides endpoints for managing candidates, jobs, employments, and admin operations within an employment portal. It is designed to support recruitment, job posting, and employment tracking processes.

**Features**

Candidates API

Get all candidates

Retrieve candidate by ID

Jobs API

Get all jobs

Retrieve job by ID

Employments (Admin API)

Get all employments (requires admin token)

Create new employment

Get employment by ID

Update employment (PATCH)

Delete employment

Admin API

Register new admin users

**Internal API (Restricted)**

Create/Delete candidates (internal use only)

Create/Delete jobs (internal use only)

**Authentication**

Public endpoints (Candidates & Jobs) can be accessed without authentication.

Admin and Internal endpoints require a Bearer Token.

**Overview**

This repository contains Postman-based API automation for the Employee Portal REST API, hosted on Render:
Base URL: https://employee-portal-api-gv9l.onrender.com/

The project demonstrates end-to-end API testing, including request validation, response verification, data-driven testing, variable handling, scripting using JavaScript, and CI/CD execution using Postman CLI and GitHub Actions.

This automation suite is designed to help QA Engineers and SDETs validate API functionality, reliability, and data integrity efficiently.

**Tools & Technologies Used**

Postman

Postman Collection & Environments

JavaScript (Postman Scripts)

Postman CLI

GitHub Actions (CI/CD)

Render (API Hosting)

 Getting Started
 
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

**Mock Servers**

Postman Mock Servers are used to simulate API behavior.

**Running the Collection**

Manual Execution
Scheduled Runs (Postman Cloud)
Executes in Postman Cloud
Hourly / Weekly schedules
Email notifications
Postman CLI Execution

**CI/CD Integration – GitHub Actions**
