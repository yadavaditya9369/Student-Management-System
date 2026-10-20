# EduTrack — Student Management System

An administrative student management platform built with the MERN stack. EduTrack combines a React dashboard with an Express REST API and MongoDB for student records, attendance, examination results, and dashboard summaries.

> **Project status:** This repository contains a working application intended for local development and further customization. Review the security, deployment, privacy, and licensing notes before using it with real institutional or student data.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Create the first administrator](#create-the-first-administrator)
- [API overview](#api-overview)
- [Security and data handling](#security-and-data-handling)
- [Production deployment](#production-deployment)
- [Contributing](#contributing)
- [Copyright and attribution](#copyright-and-attribution)
- [License](#license)

## Features

- Admin sign-in using bcrypt password hashing and a JWT stored in an HTTP-only cookie.
- Role-protected administration routes for student records, attendance, and results.
- Student directory with search, pagination, status and course filters, and record management.
- Daily attendance recording and examination result entry with request validation.
- Dashboard summaries and charts populated from API data.
- Support message submission with request validation and rate limiting.
- Responsive React interface, built with Vite.
- API hardening with Helmet, credentialed CORS, centralized error handling, and login rate limiting.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, React Hook Form, Zod, Lucide |
| Backend | Node.js, Express 4, Mongoose, Zod |
| Database | MongoDB |
| Authentication | JSON Web Token, bcryptjs, HTTP-only cookies |

## Architecture

```text
frontend/  React single-page application (Vite)
   │ HTTP / JSON, cookie credentials
   ▼
backend/   Express API, validation, authentication and authorization
   │ Mongoose
   ▼
MongoDB    Application records and administrator accounts
```

The frontend uses `VITE_API_URL` to locate the API. The API defaults to port `5000`; the Vite development server typically uses port `5173`.

## Requirements

- Node.js 18 or later and npm.
- A MongoDB database, local or hosted (for example, MongoDB Atlas).
- Git to clone the repository.

## Local development

### 1. Get the code

```bash
git clone <repository-url>
cd Student-Management-System
```

### 2. Configure the backend

Create `backend/.env` with the variables described in [Environment variables](#environment-variables). This repository does not currently provide a backend `.env.example`, so create the file manually. Never commit `.env` or paste its secrets into an issue or pull request.

### 3. Install dependencies and start the API

```bash
cd backend
npm install
npm run dev
```

The API connects to MongoDB before listening at `http://localhost:5000`. Keep this terminal running.

### 4. Create an administrator

In a second terminal, from `backend/`:

```bash
npm run seed:admin
```

The script prompts for a name, email, and password, then creates an admin account. Use a unique, strong password.

### 5. Configure and start the frontend

Create `frontend/.env` if the API is not at the default URL:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite and sign in with the administrator account you created.

### Useful commands

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm run dev` | Start API with Node watch mode |
| `backend/` | `npm start` | Start API normally |
| `backend/` | `npm run seed:admin` | Interactively create an administrator |
| `frontend/` | `npm run dev` | Start Vite development server |
| `frontend/` | `npm run build` | Build frontend assets into `frontend/dist/` |
| `frontend/` | `npm run preview` | Preview the production frontend build locally |

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection URI for the application database. |
| `JWT_SECRET` | Yes | Long, unpredictable secret used to sign authentication tokens. |
| `CLIENT_ORIGIN` | Recommended | Exact frontend origin allowed by CORS; defaults to `http://localhost:5173`. |
| `PORT` | No | API listening port; defaults to `5000`. |
| `COOKIE_SECURE` | Production | Set to `true` when serving over HTTPS and using cross-site cookies. |

Example (replace all placeholder values):

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
COOKIE_SECURE=false
```

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | API base URL; defaults to `http://localhost:5000/api`. |

Vite exposes `VITE_` variables to browser code. Do not put credentials, private keys, or other secrets in frontend environment variables.

## Create the first administrator

Administrator creation is available through the local `npm run seed:admin` command. Treat access to the deployed environment and database as privileged: a person who can connect to the database may be able to create or alter accounts. The API also includes a registration route; assess whether that route should be available in your deployment before exposing the service publicly.

## API overview

All routes are under `/api`. Except for health, authentication, and support submission, the application routes require authentication. Write operations apply role checks as implemented by the backend.

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/health` | Basic API health response | Public |
| `POST` | `/auth/register` | Register an account | Public route; review before production use |
| `POST` | `/auth/login` | Sign in and issue auth cookie | Public, rate limited |
| `POST` | `/auth/logout` | Clear auth cookie | Public route |
| `GET` | `/auth/me` | Return current authenticated user | Authenticated |
| `GET` | `/students` | List/search/filter/page student records | Authenticated |
| `GET` | `/students/:id` | Read a student record | Authenticated |
| `POST` | `/students` | Create a student | Admin or teacher |
| `PUT` | `/students/:id` | Update a student | Admin or teacher |
| `DELETE` | `/students/:id` | Delete a student | Admin |
| `GET` | `/attendance` | List attendance records | Authenticated |
| `POST` | `/attendance` | Record or update attendance | Admin or teacher |
| `GET` | `/results` | List examination results | Authenticated |
| `POST` | `/results` | Create an examination result | Admin or teacher |
| `DELETE` | `/results/:id` | Delete an examination result | Admin or teacher |
| `GET` | `/dashboard` | Read dashboard summary data | Authenticated |
| `POST` | `/support` | Submit a support message | Public, rate limited |

The health check is available at `GET http://localhost:5000/api/health`. Request field schemas and detailed query parameter behavior are defined in the backend validators and controllers.

## Security and data handling

- Keep environment files, database URIs, JWT secrets, and real credentials private. Rotate any secret that has been exposed.
- Use HTTPS in production and configure secure cookies and exact allowed CORS origins for the deployed frontend.
- Restrict database network access and database credentials to the minimum required access.
- The application handles student records and educational results. Before entering real data, establish appropriate authorization, retention, backup, access-control, and privacy practices for your organization and jurisdiction.
- Review authentication and account-registration behavior, logging, and deployment configuration before public exposure. Application features alone do not guarantee regulatory compliance or security for every deployment.
- The health endpoint indicates that the API process responded; it is not a complete database or service readiness check.

## Production deployment

1. Provision MongoDB and create a dedicated database user with scoped permissions.
2. Set production secrets through your hosting provider's secret manager or environment configuration.
3. Build the frontend with `npm run build` in `frontend/` and deploy `frontend/dist/` to a static host.
4. Deploy the backend as a Node.js service, setting `CLIENT_ORIGIN` to the deployed frontend origin, `PORT` as required by the host, and `COOKIE_SECURE=true` when the secure cross-site cookie configuration applies.
5. Configure HTTPS, database network access, backups, and monitoring at the hosting and database layers.
6. Verify the authentication flow and API access rules in the deployed environment before adding real student data.

The repository does not define a specific hosting provider or a production deployment pipeline. Adapt these steps to the chosen platform.

## Contributing

Contributions are welcome. A practical contribution process:

1. Fork the repository and create a focused branch from the default branch.
2. Make a scoped change and keep credentials and personal data out of commits.
3. Run the relevant local checks for the part you changed (for example, `npm run build` in `frontend/`).
4. Open a pull request describing the change, its rationale, and any setup or migration impact.

By submitting a contribution, you confirm that you have the right to submit it and that it may be reviewed and distributed under the project's applicable terms. The repository currently has no `CONTRIBUTING.md` or declared open-source license; see [License](#license) before reusing or redistributing the code.

## Copyright and attribution

The project is associated with **Aditya Yadav**. **Aayush Sharma contributed to Aditya Yadav's project.** This attribution records the contribution and does not by itself imply a transfer of ownership, a joint copyright determination, or a grant of permission to reuse or redistribute the code. Confirm the relevant ownership and third-party asset terms with the rights holders before publishing or reusing the project.

## License

**No license is currently specified in this repository.** Until the project owner adds a license, do not assume that the code may be copied, modified, redistributed, or used commercially. The copyright attribution above is not a license. The project owner should choose and add a license file if they intend to grant reuse permissions.
