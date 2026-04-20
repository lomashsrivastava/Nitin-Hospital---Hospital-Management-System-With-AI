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
- **Database**: PostgreSQL (Railway Managed)
- **Deployment**: Railway (Monorepo setup)

---

## 🚀 Railway Deployment Guide (Backend)

To deploy the backend on Railway:

1.  **Connect Repo**: Link your GitHub repository to a new Railway project.
2.  **Add Database**: Click "New" -> "Database" -> "Add PostgreSQL".
3.  **Configure Backend**:
    - Railway will automatically detect the `railway.json` and use the `backend` root directory.
    - The `Procfile` handles the Gunicorn process.
4.  **Environment Variables**:
    - `DATABASE_URL`: Automatically linked by Railway if you add the Postgres service.
    - `DJANGO_SECRET_KEY`: Your production secret key.
    - `DJANGO_DEBUG`: `False`
    - `CORS_ALLOWED_ORIGINS`: `https://nitinhospitalmanagementsystem.netlify.app`
    - `ALLOWED_HOSTS`: `*.up.railway.app`

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
