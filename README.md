# Warehouse Management System

A comprehensive solution for managing warehouse operations, inventory, and logistics with a modern web-based interface.

## 🚀 Overview

This Warehouse Management System (WMS) provides an end-to-end solution for warehouse operations including inventory management, order processing, and logistics tracking. Built with a modern tech stack, it offers an intuitive user interface and robust backend functionality for efficient warehouse operations.

## ✨ Features

- **Inventory Management**: Track stock levels, item locations, and product details
- **Order Processing**: Manage customer orders from receipt to fulfillment
- **Receiving & Putaway**: Process incoming shipments and optimize storage locations
- **Picking & Packing**: Streamline order fulfillment processes
- **Shipping Management**: Coordinate outbound logistics and carrier integration
- **User Management**: Role-based access control and user authentication
- **Reporting & Analytics**: Generate insights with customizable reports
- **Barcode/RFID Support**: Scan-based operations for increased accuracy
- **Mobile Responsive**: Access from any device including warehouse handhelds

## 🛠️ Technology Stack

### Frontend
- React-based SPA for responsive UI
- Interactive dashboard with real-time updates
- Data visualization components
- Responsive design for various devices

### Backend
- RESTful API architecture (Express.js)
- Secure authentication and authorization
- PostgreSQL integration using `pg` library
- Real-time data processing

### Database
- PostgreSQL relational database
- Structured schema for categories, items, and transactions
- High performance for warehouse operations
- Scalable data architecture

## 📋 Setup & Installation

### Prerequisites
- Node.js (v22+)
- PostgreSQL (v17+)
- Git

### Backend Setup
1. Navigate to the Backend directory
```bash
cd Backend
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env to set your PostgreSQL connection string
```

4. Start the backend server
```bash
pnpm dev
```

### Frontend Setup
1. Navigate to the Frontend directory
```bash
cd Frontend
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

## 🔧 Configuration

The system can be configured through environment variables:
- PostgreSQL connection settings (`POSTGRES_URI`)
- Authentication parameters
- Storage paths
- Logging options
- Port configurations

© 2025 Warehouse Management System
