# 🏥 Nitin Medial - Hospital Management & Billing System

A comprehensive, production-ready Hospital Management System (HMS) built with **React 19**, **Django 5**, and **PostgreSQL**.

---

## 🌐 Live Deployment
- **Frontend (Netlify)**: [nitinhospitalmanagementsystem.netlify.app](https://nitinhospitalmanagementsystem.netlify.app)
- **Backend (Railway)**: *(Your Railway Service URL)*

---

## 🛠️ Detailed Tech Stack

### 🎨 Frontend
- **Framework**: React 19 (Vite 8)
- **Styling**: Tailwind CSS 4, Radix UI
- **State/Animations**: Zustand, Framer Motion

### ⚙️ Backend
- **Framework**: Django 5 (Django REST Framework)
- **Database**: MongoDB Atlas (Cloud NoSQL)
- **Deployment**: Railway (Monorepo setup)

---

## 🚀 MongoDB Atlas Deployment Guide (Backend)

To deploy the backend with MongoDB Atlas:

1.  **Create Cluster**: Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared Cluster.
2.  **Get Connection String**: Go to "Database" -> "Connect" -> "Drivers" and copy the `SRV` connection string.
3.  **Configure Railway**:
    - Add `MONGODB_URI` environment variable with your connection string.
    - Add `DB_NAME` = `nitin_hospital`.

---

## 🐳 Docker Deployment
```bash
docker-compose up --build
```

---

## 📖 Key Features
- **GST Invoicing**: Precise tax calculation (CGST/SGST).
- **Patient Management**: Full admission and history.
- **Inventory & Pharmacy**: Real-time stock alerts.
- **Lab & Blood Bank**: Tracking and diagnostics.

---

## 🔐 Login Credentials (Demo)
- **Username**: `nitin123`
- **Password**: `nitin123`

---

Built for 60FPS performance and professional healthcare excellence.
