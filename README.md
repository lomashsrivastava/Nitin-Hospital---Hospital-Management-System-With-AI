# 🏥 Nitin Medial - Hospital Management & Billing System

A comprehensive, production-ready Hospital Management System (HMS) built with **React 19**, **Django 5**, and **PostgreSQL**.

---

## 🌐 Live Deployment
**Live App**: [nitinhospitalmanagementsystem.netlify.app](https://nitinhospitalmanagementsystem.netlify.app)

---

## 🛠️ Detailed Tech Stack

### 🎨 Frontend
- **Framework**: [React 19](https://react.dev/) (Vite 8 Build Tool)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Next-gen utility-first CSS)
- **Components**: [Radix UI](https://www.radix-ui.com/) (Accessible headless primitives)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight client state)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Declarative UI transitions)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/) (D3-based data visualization)
- **API Client**: [Axios](https://axios-http.com/)

### ⚙️ Backend
- **Framework**: [Django 5](https://www.djangoproject.com/) (Python-based enterprise framework)
- **API Engine**: [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
- **Authentication**: [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) (Stateless token-based auth)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Production) / [SQLite](https://www.sqlite.org/) (Development)
- **Reporting**: [ReportLab](https://www.reportlab.com/) (PDF Generation)
- **Data Handling**: [Pandas](https://pandas.pydata.org/) & [Openpyxl](https://openpyxl.readthedocs.io/) (Excel import/export)
- **Imaging**: [Pillow](https://python-pillow.org/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Docker** (Optional)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 🐳 Docker Deployment
The project is containerized for easy deployment:
```bash
docker-compose up --build
```

---

## 📖 Key Features
- **GST Invoicing**: Precise tax calculation (CGST/SGST) with PDF generation.
- **Patient Management**: Full admission, ward tracking, and medical history.
- **Inventory & Pharmacy**: Real-time stock alerts and expiry tracking.
- **Lab & Blood Bank**: Test result management and blood availability tracking.
- **Ambulance Tracking**: Dispatch system for emergency vehicles.

---

## 🔐 Login Credentials (Demo)
- **Username**: `nitin123`
- **Password**: `nitin123`

---

Built for 60FPS performance and high-tech healthcare management.
