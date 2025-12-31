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

**Postman Collection**
This repository includes a Postman collection (EmploymentPortalAPI.postman_collection.json) with all endpoints pre-configured for testing and exploration.

Public endpoints (Candidates & Jobs) can be accessed without authentication.

Admin and Internal endpoints require a Bearer Token.
