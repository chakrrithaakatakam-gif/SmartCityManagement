# UrbanOS — Smart City Management System

This project keeps the existing React/Vite frontend and adds an Express API backed by Oracle Database. SQL*Plus is used to administer the Oracle database; it is not itself the database server.

## Requirements
- Node.js (Node 20+ recommended)
- Oracle Database running locally or on a reachable server
- SQL*Plus available for running the included schema scripts

## 1. Configure Oracle

1. Open SQL*Plus and connect to the appropriate PDB/service as a DBA account (for a local XE install, the service is often `XEPDB1`; confirm your actual service name).
2. Open `backend/sql/create_app_user.sql`, replace its example password, and run it as the DBA account. If you already have a dedicated app schema, you may use it instead.
3. Connect as `URBANOS_APP` to the same service and run `backend/sql/schema.sql`.
4. Optional: run `backend/sql/seed.sql` to insert four fictional example complaints. This script is safe to run only once unless you first remove those sample rows.

Example SQL*Plus commands (adjust paths and service name):

```sql
CONNECT SYSTEM@localhost:1521/XEPDB1
@C:\path\to\SmartCityManagementSystem\backend\sql\create_app_user.sql
CONNECT URBANOS_APP@localhost:1521/XEPDB1
@C:\path\to\SmartCityManagementSystem\backend\sql\schema.sql
@C:\path\to\SmartCityManagementSystem\backend\sql\seed.sql
```

SQL*Plus prompts for passwords. Do not put real passwords into source code or commit them.

## 2. Configure backend environment

In VS Code, open a terminal at the project root:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and fill in the actual Oracle username, password, connect string and a long random `JWT_SECRET` (at least 32 characters). `DB_CONNECT_STRING` is normally `host:port/service_name`, for example `localhost:1521/XEPDB1` only if that is your real service.

Install and run the API:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

Test `http://localhost:5000/api/health`, then `http://localhost:5000/api/health/db`. The second endpoint must report a successful Oracle connection before database features can work.

## 3. Run the frontend

Open a second VS Code terminal from the project root:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the Vite URL (normally `http://localhost:5173`). The frontend calls the API at `http://localhost:5000/api` by default. To change it, create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:5000/api` (do not put secrets in a Vite environment file).

## Demo sign-in

- Citizen: `citizen@demo.local` / `demo123`
- Municipal authority: `admin@demo.local` / `demo123`

These demo accounts are verified by the backend and receive a short-lived JWT. They are not intended for public deployment. Change credentials and the JWT secret before sharing or deploying this app. Citizen demo can only view their own complaint records; authority can view and manage all complaints.

## Implemented backend

- Express API with CORS, Helmet headers, JSON request size limit and JWT authentication
- Oracle Thin driver connection and `/api/health/db` check
- Complaint list, detail, create, update and authority delete endpoints
- Citizen ownership checks and authority-only deletion/report endpoints
- Department listing and report summary endpoint
- Read-only SQL workspace endpoint limited to SELECT statements against the `complaints` compatibility view
- Oracle schema, department seed data and optional fictional complaint seed data

## Important limitations

This is a local development project, not a production municipal system. Oracle cannot be connected by packaging alone: the database service/listener must be installed/running and the `.env` connection details must match it. The SQL workspace is intentionally read-only; use SQL*Plus for DDL and data administration. Demo login accounts are not a real citizen-registration or identity-verification system. Before production deployment, add a proper user table and password hashing, password reset, rate limiting, stronger audit controls, HTTPS, backups, monitoring, and a review of authorization and data-retention requirements.
