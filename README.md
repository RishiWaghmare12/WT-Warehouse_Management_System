# WT Warehouse Management System

![Node.js](https://img.shields.io/badge/Node.js-Express-43853D?logo=node.js&logoColor=white) ![React](https://img.shields.io/badge/React-19.0-blue?logo=react&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-6.2.0-purple?logo=vite&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-managed-green?logo=pnpm&logoColor=white)

A full-stack warehouse management system built with React, Vite, Express, and MongoDB. It provides inventory monitoring, compartment reporting, send/receive workflows, and transaction history tracking.

---

## Project Overview

`WT Warehouse Management System` is a production-style warehouse inventory dashboard and API that enables compartment-based inventory tracking and stock movement management.

This project was built to demonstrate a modern warehouse management interface with:
- inventory item lifecycle operations
- compartment capacity tracking
- send/receive transaction handling
- a frontend dashboard connected to a service-oriented Express API

Real-world applications include warehouse inventory control, stock dispatch/receiving workflows, and operational reporting for small-to-medium warehouse environments.

---

## Key Features

- Warehouse compartment overview with current and available capacity
- Item management: list, create, delete
- Receive inventory and dispatch stock through send/receive flows
- Transaction history with SEND / RECEIVE types
- Seeded demo data for initial setup
- Reactive frontend with search, filtering, and toast notifications
- Structured backend services and controllers for maintainability

---

## Technology Stack

- Frontend
  - React 19
  - Vite
  - React Router DOM
  - Axios
  - Lucide React
- Backend
  - Node.js
  - Express
  - Mongoose
  - dotenv
  - cors
- Database
  - MongoDB
- Tools
  - pnpm
  - ESLint

---

## Repository Structure

```text
WT-Warehouse_Management_System
├── README.md
├── backend
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── categoryController.js
│   │   ├── itemController.js
│   │   └── transactionController.js
│   ├── db
│   │   ├── init.js
│   │   └── seed.js
│   ├── middleware
│   │   ├── cors.js
│   │   └── errorHandler.js
│   ├── models
│   │   ├── Category.js
│   │   ├── Item.js
│   │   └── Transaction.js
│   ├── routes
│   │   ├── compartments.js
│   │   ├── items.js
│   │   ├── transactions.js
│   │   └── index.js
│   ├── services
│   │   ├── categoryService.js
│   │   ├── itemService.js
│   │   └── transactionService.js
│   ├── .env.example
│   └── index.js
└── frontend
    ├── public
    ├── src
    │   ├── components
    │   ├── context
    │   ├── hooks
    │   ├── pages
    │   ├── services
    │   └── utils
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## System Architecture / Workflow

```mermaid
flowchart LR
  U[User Browser]
  F[React SPA]
  B[Express API]
  D[MongoDB]

  U --> F
  F -->|HTTP| B
  B -->|Mongoose| D
  D --> B
  B --> F
```

### Workflow

1. User interacts with the React frontend.
2. Frontend sends API requests to Express routes under `/api`.
3. Controllers delegate to service layer logic.
4. Services use Mongoose to query or update MongoDB.
5. Updated inventory and transactions are returned to the UI.

---

## Installation Guide

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)
- Git

### Backend setup

```bash
cd backend
pnpm install
```

Copy environment variables and configure MongoDB:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_db
PORT=3000
```

Start the backend:

```bash
pnpm dev
```

### Frontend setup

```bash
cd frontend
pnpm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
pnpm dev
```

---

## Usage Guide

1. Open the frontend URL provided by Vite.
2. Browse pages using the navbar: Home, Warehouse, Items, Send/Receive, Transactions.
3. Use `Items` to add new products or delete existing inventory.
4. Use `Warehouse` to inspect compartment utilization and available space.
5. Use `Send/Receive` to dispatch stock or receive inventory.
6. Use `Transactions` to view and filter operation history.

---

## Results / Outputs

- Compartment report with utilization percentage
- Item cards showing stock levels and available quantity
- Transaction history feed with pagination-style filtering
- Seeded categories and items available after initial startup

> No screenshot assets are included in the repository.

---

## Future Improvements

- Add authentication and role-based access control
- Add item edit/update forms
- Add category management UI
- Add PDF/CSV export for reports
- Add Docker support for simplified local deployment
- Add test coverage for backend and frontend

---

## Contribution Guidelines

If you want to contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-change`
3. Install dependencies and run locally.
4. Submit a pull request with a clear summary.

Please keep contributions aligned with the existing service/controller architecture.

---

## License

No license file is included in this repository. Add a `LICENSE` file to define reuse terms.

