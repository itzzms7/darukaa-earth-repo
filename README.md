# Darukaa.Earth

> **Geospatial Intelligence for Carbon, Biodiversity & Environmental
> Projects**

Darukaa.Earth is a full-stack geospatial data analytics platform for
managing environmental projects, defining geographically bounded sites,
and visualizing site-level measurements over time.

The platform combines authenticated project management, interactive
polygon-based mapping, spatial persistence through PostgreSQL/PostGIS,
and analytical visualization in a focused dashboard.

------------------------------------------------------------------------

## Live Application

**Production Frontend:**\
https://darukaa-proj-darkmode.vercel.app/

------------------------------------------------------------------------

## Core Capabilities

-   JWT-based user registration and authentication
-   Project creation and project-level organization
-   Interactive polygon drawing for geographic site definition
-   GeoJSON-based site boundaries
-   PostgreSQL + PostGIS spatial persistence
-   Interactive MapLibre GL JS visualization
-   Satellite, terrain, and street-oriented basemap views
-   Site-level environmental measurements
-   Time-series analytics with Chart.js
-   Database migrations with Alembic
-   GitHub Actions CI
-   Vercel frontend deployment
-   Railway backend deployment

------------------------------------------------------------------------

## Product Workflow

``` text
Authenticate
     ↓
Create / manage projects
     ↓
Define sites on an interactive map
     ↓
Persist geographic boundaries
     ↓
Open an individual site
     ↓
Review spatial information
     ↓
Add and visualize measurements over time
```

------------------------------------------------------------------------

# Architecture

``` mermaid
flowchart LR
    U[Authenticated User] --> FE[React + Vite Frontend]

    FE --> AUTH[Authentication]
    FE --> PROJECT[Project API]
    FE --> SITE[Site API]
    FE --> ANALYTICS[Analytics API]

    AUTH --> API[FastAPI]
    PROJECT --> API
    SITE --> API
    ANALYTICS --> API

    API --> ORM[SQLAlchemy + GeoAlchemy2]
    ORM --> DB[(PostgreSQL + PostGIS)]

    FE --> MAP[MapLibre GL JS]
    MAP --> TILES[Esri / OpenStreetMap]

    CI[GitHub Actions] --> FE
    CI --> API
```

### Deployment

``` text
Vercel
React + Vite
     │
     │ HTTPS
     ▼
FastAPI API
     │
     ▼
PostgreSQL + PostGIS
```

The frontend API origin is configured through `VITE_API_BASE_URL`.

------------------------------------------------------------------------

# Technology Stack

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  Frontend                            React 19

  Build Tool                          Vite

  Styling                             Tailwind CSS

  Motion                              Motion

  Icons                               Lucide React

  Mapping                             MapLibre GL JS

  Basemaps                            Esri World Imagery, Esri World
                                      Topographic Map, OpenStreetMap

  Visualization                       Chart.js + react-chartjs-2

  Backend                             Python + FastAPI

  ORM                                 SQLAlchemy 2

  Geospatial ORM                      GeoAlchemy2

  Geometry                            Shapely

  Validation                          Pydantic

  Authentication                      JWT / OAuth2 Bearer

  Password Security                   pwdlib

  Database                            PostgreSQL

  Spatial Database                    PostGIS

  Migrations                          Alembic

  CI                                  GitHub Actions

  Frontend Deployment                 Vercel

  Backend Deployment                  Railway

  Local Infrastructure                Docker Compose
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Data Model

The application uses a simple project → site → analytics hierarchy with
authenticated user ownership.

``` mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ SITES : contains
    SITES ||--o{ ANALYTICS : records

    USERS {
        int id PK
        string email UK
        string password_hash
    }

    PROJECTS {
        int id PK
        string name
        int owner_id FK
    }

    SITES {
        int id PK
        string name
        int project_id FK
        geometry polygon
    }

    ANALYTICS {
        int id PK
        int site_id FK
        string metric
        date date
        float value
    }
```

### Users

  Field             Type      Purpose
  ----------------- --------- -------------------------
  `id`              Integer   User identifier
  `email`           String    Authentication identity
  `password_hash`   String    Stored password hash

### Projects

  Field        Type      Purpose
  ------------ --------- --------------------
  `id`         Integer   Project identifier
  `name`       String    Project name
  `owner_id`   Integer   Owning user

### Sites

  Field          Type                  Purpose
  -------------- --------------------- ---------------------
  `id`           Integer               Site identifier
  `name`         String                Site name
  `project_id`   Integer               Parent project
  `geometry`     Polygon / SRID 4326   Geographic boundary

### Analytics

  Field       Type      Purpose
  ----------- --------- ------------------------
  `id`        Integer   Measurement identifier
  `site_id`   Integer   Parent site
  `metric`    String    Measurement type
  `date`      Date      Observation date
  `value`     Float     Numeric measurement

------------------------------------------------------------------------

# Geospatial Layer

Site boundaries are created as polygons in the frontend and persisted as
spatial geometry in PostGIS.

``` text
Polygon drawing
      ↓
GeoJSON
      ↓
FastAPI validation
      ↓
Shapely geometry
      ↓
GeoAlchemy2
      ↓
PostGIS Polygon / SRID 4326
      ↓
GeoJSON response
      ↓
MapLibre visualization
```

The mapping layer uses **MapLibre GL JS**. The current default basemaps
use public raster sources from Esri and OpenStreetMap.

The frontend also contains support for a `VITE_MAPBOX_ACCESS_TOKEN`
environment variable for Mapbox-compatible map configuration; the
current default raster basemaps do not require that token.

------------------------------------------------------------------------

# Authentication & Authorization

Authentication uses JWT bearer tokens.

``` text
Credentials
    ↓
Registration / Login
    ↓
Password verification
    ↓
JWT access token
    ↓
Bearer Authorization header
    ↓
Authenticated user
    ↓
Ownership-constrained resources
```

The current authorization model is based on authenticated users and
project ownership. A separate Admin/Viewer role-based authorization
system is not implemented.

------------------------------------------------------------------------

# API Overview

## Health

``` http
GET /health
GET /health/db
```

## Authentication

``` http
POST /auth/register
POST /auth/login
```

## Projects

``` http
POST /projects
GET  /projects
GET  /projects/{project_id}
```

## Sites

``` http
POST /projects/{project_id}/sites
GET  /projects/{project_id}/sites
```

## Analytics

``` http
POST /sites/{site_id}/analytics
GET  /sites/{site_id}/analytics
```

FastAPI also provides interactive API documentation through its standard
OpenAPI interface when the backend is running.

------------------------------------------------------------------------

# Frontend Structure

``` text
frontend/
└── src/
    ├── api/
    │   └── client.js
    ├── components/
    │   ├── AnalyticsChart.jsx
    │   ├── Dashboard.jsx
    │   ├── DataModal.jsx
    │   ├── EditPolygonModal.jsx
    │   ├── MapView.jsx
    │   ├── Navbar.jsx
    │   ├── PolygonMapEditor.jsx
    │   ├── ProfilePage.jsx
    │   ├── ProjectDetailsModal.jsx
    │   ├── ProjectModal.jsx
    │   ├── SignInPage.jsx
    │   ├── SignUpPage.jsx
    │   ├── SiteDetailPage.jsx
    │   └── SiteModal.jsx
    ├── utils/
    │   └── mapbox.js
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

The frontend API client centralizes authentication, project, site, and
analytics communication.

------------------------------------------------------------------------

# Backend Structure

``` text
backend/
├── alembic/
│   └── versions/
├── app/
│   ├── api/
│   │   ├── analytics.py
│   │   ├── auth.py
│   │   ├── projects.py
│   │   └── sites.py
│   ├── core/
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── security.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   ├── schemas/
│   └── main.py
├── alembic.ini
└── requirements.txt
```

------------------------------------------------------------------------

# Local Development

## Prerequisites

-   Node.js 20+
-   npm
-   Python 3.12
-   Docker / Docker Compose

------------------------------------------------------------------------

## 1. Start PostgreSQL + PostGIS

From the project root:

``` bash
docker compose up -d db
```

The supplied Docker configuration provides a local PostGIS database on:

``` text
localhost:5432
```

------------------------------------------------------------------------

## 2. Configure the backend

Create:

``` text
backend/.env
```

Example:

``` env
DATABASE_URL=postgresql+psycopg://darukaa:darukaa_dev_password@localhost:5432/darukaa
DATABASE_SCHEMA=darukaa
JWT_SECRET=replace-with-a-development-secret
JWT_EXPIRE_MINUTES=60
```

------------------------------------------------------------------------

## 3. Install backend dependencies

``` bash
cd backend

python -m venv .venv
```

### Windows

``` bash
.venv\Scripts\activate
```

### macOS / Linux

``` bash
source .venv/bin/activate
```

Install:

``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

## 4. Run migrations

``` bash
alembic upgrade head
```

------------------------------------------------------------------------

## 5. Start the backend

``` bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Local API:

``` text
http://localhost:8000
```

------------------------------------------------------------------------

## 6. Configure the frontend

Create:

``` text
frontend/.env.local
```

``` env
VITE_API_BASE_URL=http://localhost:8000
```

Install dependencies:

``` bash
cd frontend
npm ci
```

Start the development server:

``` bash
npm run dev
```

The frontend runs on:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# Database Migrations

Alembic manages the application schema.

### Apply migrations

``` bash
cd backend
alembic upgrade head
```

### Create a migration

``` bash
alembic revision --autogenerate -m "describe schema change"
```

### Roll back one revision

``` bash
alembic downgrade -1
```

------------------------------------------------------------------------

# Environment Configuration

## Frontend

``` env
VITE_API_BASE_URL=<backend-api-origin>
```

Optional Mapbox-compatible configuration:

``` env
VITE_MAPBOX_ACCESS_TOKEN=<public-mapbox-token>
```

## Backend

``` env
DATABASE_URL=<postgresql-connection-string>
DATABASE_SCHEMA=darukaa
JWT_SECRET=<production-secret>
JWT_EXPIRE_MINUTES=60
```

Production secrets should be supplied through the deployment environment
rather than committed to source control.

------------------------------------------------------------------------

# CI / Quality Pipeline

GitHub Actions validates the application on pushes and pull requests
targeting `main`.

``` text
GitHub
   │
   ├── Backend
   │     ├── Python 3.12
   │     ├── Install dependencies
   │     └── Python compile validation
   │
   └── Frontend
         ├── Node.js 20
         ├── npm ci
         └── Production build
```

Workflow:

``` text
.github/workflows/ci.yml
```

Developer validation commands:

``` bash
cd frontend
npm run lint
npm run build
```

------------------------------------------------------------------------

# Deployment

### Frontend

The production frontend is deployed through Vercel.

``` text
https://darukaa-proj-darkmode.vercel.app/
```

The production frontend uses:

``` env
VITE_API_BASE_URL=<production-api-origin>
```

### Backend

The FastAPI service is deployed through Railway and serves the
frontend's API requests.

------------------------------------------------------------------------

# Engineering Decisions

### PostgreSQL + PostGIS

PostgreSQL provides the relational foundation while PostGIS provides
native spatial storage for geographic site boundaries.

### SQLAlchemy + GeoAlchemy2

SQLAlchemy manages relational persistence while GeoAlchemy2 integrates
PostgreSQL spatial types into the ORM layer.

### FastAPI

FastAPI provides typed request handling, dependency injection,
authentication integration, and OpenAPI documentation.

### React + Vite

React provides component-based UI architecture while Vite provides the
frontend development and production build pipeline.

### MapLibre GL JS

MapLibre provides the interactive mapping runtime and supports the
project's spatial visualization and polygon interaction requirements.

### Generic Analytics Model

Measurements use the flexible:

``` text
(metric, date, value)
```

model, allowing additional environmental indicators without redesigning
the core site schema.

------------------------------------------------------------------------

# Challenge Alignment

The implementation addresses the principal requirements of the
Darukaa.Earth full-stack challenge:

  Requirement                 Implementation
  --------------------------- --------------------------------
  User authentication         JWT authentication
  Project management          Project API + dashboard
  Multiple geographic sites   Project → Site relationship
  Polygon site creation       Interactive polygon editor
  Geospatial visualization    MapLibre GL JS
  Analytics                   Site-level measurement records
  Data visualization          Chart.js
  Database                    PostgreSQL + PostGIS
  Database migrations         Alembic
  CI/CD                       GitHub Actions
  Public deployment           Vercel + Railway
  Local infrastructure        Docker Compose
  Technical documentation     Project README

------------------------------------------------------------------------

# Current Scope

### Implemented

-   [x] User registration
-   [x] User login
-   [x] JWT authentication
-   [x] Project creation and listing
-   [x] Project ownership
-   [x] Interactive site polygon creation
-   [x] GeoJSON validation
-   [x] PostGIS geometry persistence
-   [x] Site visualization
-   [x] Site analytics
-   [x] Chart-based visualization
-   [x] Alembic migrations
-   [x] Local PostGIS infrastructure
-   [x] GitHub Actions CI
-   [x] Vercel frontend deployment
-   [x] Railway backend deployment

------------------------------------------------------------------------

# Future Hardening

The current implementation establishes the core product and deployment
architecture. Further production hardening can extend the platform with:

-   Automated backend and frontend test suites
-   End-to-end testing
-   Rate limiting
-   Structured logging and observability
-   Monitoring and error tracking
-   Database backup and recovery procedures
-   Secret rotation
-   Expanded spatial validation and indexing
-   More granular authorization policies
-   Automated deployment gates

------------------------------------------------------------------------

# Project Identity

**Darukaa.Earth**\
*Geospatial Intelligence for Carbon, Biodiversity & Environmental
Projects*

**Architecture:** React + Vite · FastAPI · PostgreSQL/PostGIS

**Mapping:** MapLibre GL JS

**Analytics:** Chart.js

**CI:** GitHub Actions

**Deployment:** Vercel + Railway

------------------------------------------------------------------------

## License

No project-specific open-source license is currently defined in the
repository.

**Copyright © 2026 Muhammad Suhail.**
