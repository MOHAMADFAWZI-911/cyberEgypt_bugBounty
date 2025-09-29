# CyberEgypt BugBounty — Full Stack (React + Vite + json-server + Docker)


## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Repository Structure](#repository-structure)
5. [Prerequisites](#prerequisites)
6. [Local Development (no Docker)](#local-development-no-docker)
7. [Docker / Production Deployment (EC2)](#docker--production-deployment-ec2)
8. [Docker Compose Example (recommended)](#docker-compose-example-recommended)
9. [Environment Variables](#environment-variables)
10. [API (json-server) — Quick Reference](#api-json-server--quick-reference)
11. [Troubleshooting & Common Fixes](#troubleshooting--common-fixes)
12. [Security — EC2 / Network](#security--ec2--network)
13. [Best Practices & Recommendations](#best-practices--recommendations)
14. [Contributing](#contributing)
15. [License](#license)

---

# Project Overview
CyberEgypt BugBounty is a lightweight but full-featured bug-bounty management platform for:
- Researchers (submit vulnerability reports)
- Companies (manage programs and assign remediation)
- Service Providers (accept assignments, negotiate, and fix issues)

The app uses React + Vite for the frontend, `json-server` as a simple REST backend (data persisted in `db.json`), and Docker for deployment.
platform link : http://13.48.56.144/

---

# Features
- Researcher workflows: discover programs, submit reports
- Company workflows: manage assets, view reports, assign providers
- Service Provider workflows: accept/decline assignments, submit remediation
- Mock REST API backed by `db.json` (easy to inspect & extend)
- Containerized frontend + backend via Docker Compose
- Easy to run locally for development or on EC2 for public access

---

# Tech Stack
- Frontend: React + Vite  
- Styling: Tailwind CSS (via CDN or local, depending on setup)  
- Backend: json-server (single-file JSON DB)  
- Containerization: Docker, Docker Compose  
- Optional: Nginx as reverse-proxy (for HTTPS / single port 80/443)

---

# Repository Structure (example)
```
/
├─ frontend/                 # React + Vite app
│  ├─ src/
│  └─ Dockerfile.frontend
├─ backend/                  # json-server config or simple wrapper
│  ├─ db.json
│  └─ Dockerfile.backend
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

---

# Prerequisites
- Node.js (v16+) and npm (for local development)  
- Docker & Docker Compose (for container deployment)  
- For EC2: An AWS EC2 instance (Ubuntu / Amazon Linux) with Docker installed and Security Group open for required ports.

---

# Local Development (no Docker)

1. Install dependencies (in project root or both subfolders if split)
```bash
npm install
# or if frontend/backend are separate
cd frontend && npm install
cd ../backend && npm install
```

2. Start both frontend and json-server (concurrently script recommended)
Example `package.json` scripts:
```json
"scripts": {
  "dev": "concurrently \"vite\" \"json-server --watch backend/db.json --port 4000 --host 0.0.0.0\""
}
```

3. Run:
```bash
npm run dev
```

4. Access:
- Frontend (Vite): `http://localhost:5173`  
- Backend (json-server): `http://localhost:4000` (example endpoint `http://localhost:4000/users`)

---

# Docker / Production Deployment (EC2)

> NOTE: To avoid `net::ERR_NAME_NOT_RESOLVED` you must set the frontend environment to point to your EC2 public IP (or domain). Using an environment file or build-arg is recommended instead of hardcoding.

## Key Dockerfile recommendations
- Backend (json-server): run with `--host 0.0.0.0` and avoid `--watch` in production
- Frontend: build static site and serve with a small webserver (e.g., `nginx` or `http-server`) and inject `VITE_API_ROOT` at build-time via ARG/ENV.

### Example: Building & running on EC2
1. Copy project to EC2
2. Ensure Docker & Docker Compose installed
3. Ensure EC2 security group allows ports: `22` (SSH), `80` (HTTP), `4000` (API) — optionally `443` for HTTPS
4. Create a `.env` file with your EC2 public IP:
```
API_URL=http://<YOUR_EC2_PUBLIC_IP>:4000
```
5. Build and run:
```bash
sudo docker-compose up --build -d
```
6. Access:
- Frontend: `http://<YOUR_EC2_PUBLIC_IP>/`  
- Backend: `http://<YOUR_EC2_PUBLIC_IP>:4000/users`

---

# Docker Compose Example (recommended)
This example uses an environment file (`.env`) where `API_URL` is set to your EC2 public IP (or domain).

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    container_name: bugbounty-backend
    restart: always
    ports:
      - "4000:4000"
    volumes:
      - ./backend/db.json:/app/db.json

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
      args:
        VITE_API_URL: ${API_URL}
    container_name: bugbounty-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
```

**Important**:
- Add `.env` (not checked into VCS) with:
```
API_URL=http://13.48.56.144
```
- Replace `13.48.56.144` with your EC2 public IP or DNS.

---

# Environment Variables

- `VITE_API_URL` / `VITE_API_ROOT` (build-arg or env) — frontend uses this to call the backend API
- `.env` example:
```
API_URL=http://<YOUR_EC2_PUBLIC_IP>:4000
```

How the frontend should read it:
```js
// src/api.js
export const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

Dockerfile (frontend) sample build-arg:
```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build
```

---

# API (json-server) — Quick Reference
(These endpoints are examples; adjust to your `db.json` schema.)

- `GET /programs` — list bug bounty programs
- `POST /reports` — submit a new vulnerability report
- `GET /reports` — list reports
- `PUT /reports/:id` — update report status, assign provider etc.
- `GET /users` — list users (researchers, companies, providers)

You can inspect the full schema in `backend/db.json`.

---

# Troubleshooting & Common Fixes

- `net::ERR_NAME_NOT_RESOLVED`:
  - Ensure frontend uses the **public IP** or domain (not `localhost`) when running in Docker on EC2.
  - In `docker-compose.yml`, pass `VITE_API_URL` as an ARG not in square brackets.
- CORS issues:
  - json-server usually allows requests if run on `0.0.0.0`. If CORS errors occur, add CORS headers or run a small proxy (Nginx) that sets necessary headers.
- Changes to `db.json` not reflected:
  - If backend uses a mounted volume, edits to `db.json` will persist. If built into image, rebuild or mount file as a volume.
- Port conflicts:
  - Verify no other process uses port `4000` or `80` on your host.

---

# Security — EC2 / Network
- Security Groups: open only required ports (22 for your IP only if possible, 80 and 443 publicly if needed). Avoid 0.0.0.0/0 for SSH.
- Use HTTPS in production. Place an Nginx reverse proxy + Let's Encrypt cert (Certbot) or use AWS Load Balancer with a certificate.
- Do **not** expose administration endpoints or seeded credentials publicly. Use authentication and role checks for real deployments (json-server is mock-only).

---

# Best Practices & Recommendations
- Use a real backend (Node/Express, Django, etc.) for production instead of `json-server`.
- Add authentication (JWT + role-based access) before storing PII or production data.
- Use Docker volumes for persistent data and backups of `db.json`.
- Use environment variables and secrets manager for sensitive data.
- Add CI to build and test images before deploying.

---

# Contributing
1. Fork the repo
2. Create a feature branch: `git checkout -b feature/awesome`
3. Run & test locally
4. Submit a PR with description and testing steps

---

# License
This project is provided as-is. Add your preferred license (e.g., MIT) here.

---
