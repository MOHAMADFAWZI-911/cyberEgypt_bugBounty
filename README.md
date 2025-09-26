# CyberEgypt BugBounty platform — Full Stack (React + json-server + Docker)

## ������ Project Summary

This project is a full-featured Bug Bounty platform, built with **React** and **Vite**. It utilizes **json-server** as a simple backend, storing all data in a local `db.json` file. The entire application is containerized using **Docker** for stable deployment on platforms like AWS EC2.

### Key User Roles:
1.  **Researcher:** Submits vulnerability reports and discovers programs.
2.  **Company:** Manages assets, reports, and assigns service providers.
3.  **Service Provider:** Receives assignments, negotiates prices, and completes remediation work.

---

## ������ Tech Stack & Architecture

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite** | Modern UI library built with the fast Vite toolchain. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework (via CDN). |
| **Backend/API** | **json-server** | Mock REST API server for persistence via `db.json`. |
| **Deployment** | **Docker & Docker Compose** | Containerization solution for seamless deployment. |

---

## ������ Deployment to AWS EC2 via Docker

To resolve the `net::ERR_NAME_NOT_RESOLVED` error and ensure external access, the application must be built using the public IP of the EC2 instance.

### 1. Critical Docker Configuration Updates

| File | Purpose | Key Fixes Implemented |
| :--- | :--- | :--- |
| **`Dockerfile.backend`** | Stable API Server | Removed the unstable `--watch` flag and added `--host 0.0.0.0` for reliability. |
| **`Dockerfile.frontend`** | API URL Setup | Modified to accept the public API URL as an **`ARG`**. |
| **`src/api.js`** | API Root | Uses the injected `VITE_API_ROOT` variable. |

### 2. Update `docker-compose.yml`

**You MUST replace the placeholder IP with the actual Public IP Address of your EC2 server.**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: bugbounty-backend
    restart: always
    ports:
      - "4000:4000"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        # **<-- IMPORTANT: REPLACE THIS IP WITH YOUR EC2 PUBLIC IP -->**
        VITE_API_URL: [http://13.60.83.172:4000](http://13.60.83.172:4000) 
    container_name: bugbounty-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
      
      
      
3. Execution Steps on EC2
Pre-requisites: Your EC2 Security Group must have ports 22, 80, and 4000 open to the public internet (0.0.0.0/0).

Navigate to the project directory on your EC2 server.

Build and Run Containers: This command will handle the build process, network setup, and application launch.

Bash

sudo docker-compose up --build -d
Access the Application:

Frontend (Main App): http://<Your-EC2-Public-IP>/

Backend (API Test): http://<Your-EC2-Public-IP>:4000/users

##  ������️ Local Development (Without Docker)
Use this method for debugging and rapid development on your local machine.

1. Installation
Bash

# Install all dependencies (frontend and json-server)
npm install
2. Run
Bash

# Start the frontend (Vite) and the backend (json-server) concurrently
npm run dev
Access: The application will be available at http://localhost:5173.
---

