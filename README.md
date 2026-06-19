# ⚡ GreenHub — India's Renewable Energy Marketplace

<div align="center">

![GreenHub Banner](https://img.shields.io/badge/GreenHub-Renewable%20Energy%20Marketplace-4ade80?style=for-the-badge&logo=leaflet&logoColor=white)

**Buy & Sell Green Energy Directly — No Middlemen. No Broker Fees. 100% Green.**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-greenhub--frontend--coral.vercel.app-4ade80?style=for-the-badge)](https://greenhub-frontend-coral.vercel.app)
[![Backend API](https://img.shields.io/badge/🔧%20Backend%20API-Render-46E3B7?style=for-the-badge)](https://greenhub-backend.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Vinaytomar--xm-181717?style=for-the-badge&logo=github)](https://github.com/Vinaytomar-xm)

</div>

---

## 🌍 Live Demo

| | Link |
|---|---|
| 🌐 **Frontend (Vercel)** | [https://greenhub-frontend-coral.vercel.app](https://greenhub-frontend-coral.vercel.app) |
| 🔧 **Backend API (Render)** | [https://greenhub-backend.onrender.com](https://greenhub-backend.onrender.com) |
| 🗄️ **Database** | MongoDB Atlas (ap-south-1, Mumbai) |

### 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@greenhub.in` | `admin123` |
| **User** | Register freely | Any password |

---

## ✨ Features

- 🔆 **Sell Energy** — Register as a solar, wind, or biogas producer
- 🛒 **Buy Energy** — Browse and send buy requests to producers
- 🔄 **P2P Trading** — Direct peer-to-peer energy trades
- 🤝 **Community** — Join micro-grids, co-ops, and energy clusters
- 🗺️ **Energy Map** — Live energy producers map of India
- 📊 **Dashboard** — Track your listings, requests, and trades
- 💬 **Support** — Ticket-based support system
- 🛡️ **Admin Panel** — Manage producers, buy requests, and support tickets
- ✉️ **Email Notifications** — Auto email on approval/rejection via SendGrid
- 🔒 **Auth** — JWT + Cookie-based authentication
- 🍪 **Cookie Consent** — GDPR-style consent banner with Accept/Reject
- 📱 **Mobile Responsive** — Hamburger menu below 768px

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4-000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render)

### Email
![SendGrid](https://img.shields.io/badge/Email-SendGrid%20API-1A82E2?logo=sendgrid)

---

## 📁 Project Structure

```
GreenHub/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express app, all API routes
│   │   ├── models.js       # Mongoose schemas
│   │   ├── middleware.js   # JWT auth middleware
│   │   └── email.js        # SendGrid email templates
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── PrivacyPolicy.jsx   # Cookie & data usage policy
    │   │   └── ...                # 13+ pages
    │   ├── components/
    │   │   ├── CookieBanner.jsx    # GDPR-style consent banner
    │   │   ├── Navbar.jsx
    │   │   └── ...
    │   ├── context/        # AuthContext, NotificationContext
    │   └── api.js          # Axios config
    ├── .env.example
    └── vite.config.js
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- SendGrid account (free) for emails

### 1. Clone the repo

```bash
git clone https://github.com/Vinaytomar-xm/GreenHub-backend.git
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT secret key | `your_secret_key` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://greenhub-frontend-coral.vercel.app` |
| `SENDGRID_API_KEY` | SendGrid API key | `SG.xxxxxxxxxxxx` |
| `EMAIL_FROM` | Verified sender email | `tomarvinaysingh70@gmail.com` |

### Frontend `.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `https://greenhub-backend.onrender.com/api` |

---

## 📧 Email Notifications

Emails are sent via **SendGrid HTTP API** (port 443 — works on Render, since SMTP ports are blocked on the free plan):

| Trigger | Recipient | Email Type |
|---|---|---|
| Producer approved/rejected | Producer | Listing status update |
| Buy request accepted/rejected | Buyer | Request status update |
| Support ticket replied | User | Admin reply notification |

---

## 🍪 Cookie Consent

GreenHub uses a lightweight, GDPR-style cookie consent system — no third-party cookie libraries required.

### How it works

| Step | Behavior |
|---|---|
| First visit | `CookieBanner` checks `localStorage.cookieConsent` — if absent, banner slides up from the bottom after a short delay |
| Accept | Stores `cookieConsent = "accepted"` in `localStorage`, banner dismisses |
| Reject | Stores `cookieConsent = "rejected"` in `localStorage`, banner dismisses |
| Repeat visit | If consent already exists in `localStorage`, banner never shows again |

### Files

| File | Purpose |
|---|---|
| `frontend/src/components/CookieBanner.jsx` | Reusable banner — fade-in/slide-up animation, Accept/Reject buttons, ARIA labels, keyboard accessible |
| `frontend/src/pages/PrivacyPolicy.jsx` | Explains the `gh_token` authentication cookie, data collection, and security practices |

### What it covers

- Informs users about the **`gh_token`** HttpOnly authentication cookie (required for login — not affected by Accept/Reject)
- No tracking or advertising cookies are used by GreenHub
- Links to a dedicated **Privacy Policy** page (`/privacy-policy`)
- Mounted globally in `App.jsx`, so it renders on every route

> ℹ️ Rejecting cookies only affects future *optional* tracking — it does **not** log the user out, since `gh_token` is essential for authentication.

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. **[render.com](https://render.com)** → **New +** → **Web Service**
3. Connect `greenhub-backend` repo
4. Build: `npm install` · Start: `node src/server.js`
5. **Environment** tab → add all env variables
6. Deploy → Render auto-generates the URL

### Frontend → Vercel

1. Push code to GitHub
2. **[vercel.com](https://vercel.com)** → Import project
3. Framework: **Vite** · Output: `dist`
4. Add `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy → Redeploy after backend URL is ready

---

## 📸 Pages Overview

| Page | Route | Description |
|---|---|---|
| Home | `/` | Landing page with stats & how it works |
| Marketplace | `/marketplace` | Browse all energy producers |
| Sell Energy | `/sell-energy` | Multi-step producer registration |
| Buy Energy | `/buy-energy` | Browse & send buy requests |
| Trading | `/trading` | P2P energy trading |
| Community | `/community` | Energy groups & micro-grids |
| Energy Map | `/energy-map` | Live map of India |
| Dashboard | `/dashboard` | User dashboard |
| Support | `/support` | Ticket support system |
| Admin Panel | `/admin` | Admin management panel |
| Privacy Policy | `/privacy-policy` | Cookie & data usage policy |

---

## 👨‍💻 Author

**Vinay Singh Tomar**
- GitHub: [@Vinaytomar-xm](https://github.com/Vinaytomar-xm)

---

## 📄 License

MIT License — feel free to use and modify.

---

<div align="center">
  Made with ❤️ Vinay Singh Tomar
</div>
