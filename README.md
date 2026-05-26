# GreenHub — Renewable Energy Marketplace

India's decentralized peer-to-peer green energy marketplace. Built with React + Express + MongoDB.

---

## ✨ What's New in v3

- **Email Notifications** — Admin actions trigger automatic emails:
  - Producer registration approved/rejected → email to producer
  - Buy request accepted/rejected → email to buyer
  - Support ticket admin reply → email to user
- **Cookie Authentication** — HTTP-only secure cookies alongside JWT (dual auth)
- **Vercel Deployment Ready** — Full env config, `vercel.json` for both frontend and backend
- **100% English** — All Hinglish text converted to English
- **Mobile Responsive** — Grid layouts use `auto-fit` and `clamp()` throughout

---

## 🗂 Project Structure

```
GreenHub/
├── backend/
│   ├── src/
│   │   ├── server.js      ← Express API, all routes
│   │   ├── models.js      ← Mongoose schemas
│   │   ├── middleware.js  ← JWT + cookie auth middleware
│   │   └── email.js       ← Nodemailer email utility
│   ├── .env.example
│   ├── package.json
│   └── vercel.json        ← Vercel serverless config
│
└── frontend/
    ├── src/
    │   ├── pages/          ← All page components
    │   ├── components/     ← Navbar, Background, etc.
    │   ├── context/        ← Auth + Notification contexts
    │   ├── api.js          ← Axios API client
    │   └── App.jsx
    ├── .env.example
    ├── vite.config.js
    └── vercel.json         ← SPA routing config
```

---

## 🚀 Local Development

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values (MongoDB URI, email credentials, etc.)
npm install
npm run dev
# → Runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
# No changes needed for local development
npm install
npm run dev
# → Runs on http://localhost:3000
```

### Default Admin Credentials
- Email: `admin@greenhub.in`
- Password: `admin123`

---

## ⚙️ Environment Variables

### Backend `.env`

| Variable       | Description                              | Example                              |
|----------------|------------------------------------------|--------------------------------------|
| `PORT`         | Server port                              | `5000`                               |
| `NODE_ENV`     | Environment                              | `development` / `production`         |
| `MONGO_URI`    | MongoDB connection string                | `mongodb+srv://...`                  |
| `JWT_SECRET`   | Secret key for JWT signing               | `your_random_secret_here`            |
| `FRONTEND_URL` | Frontend URL (for CORS)                  | `https://your-app.vercel.app`        |
| `EMAIL_HOST`   | SMTP host                                | `smtp.gmail.com`                     |
| `EMAIL_PORT`   | SMTP port                                | `587`                                |
| `EMAIL_SECURE` | Use SSL (true for port 465)              | `false`                              |
| `EMAIL_USER`   | SMTP username / email                    | `you@gmail.com`                      |
| `EMAIL_PASS`   | SMTP password / App Password             | `xxxx xxxx xxxx xxxx`                |
| `EMAIL_FROM`   | Sender name and address                  | `"GreenHub" <you@gmail.com>`         |

> **Gmail tip:** Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

### Frontend `.env`

| Variable           | Description                               | Example                                    |
|--------------------|-------------------------------------------|--------------------------------------------|
| `VITE_API_URL`     | Backend API base URL (production only)    | `https://your-backend.vercel.app/api`      |
| `VITE_BACKEND_URL` | Backend URL for Vite dev proxy            | `http://localhost:5000`                    |

---

## 🌐 Deploy to Vercel

### Step 1 — Deploy Backend

1. Push the `backend/` folder to a GitHub repo (or a subfolder)
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `backend`
4. Add all **Environment Variables** from the table above
5. Deploy → note the URL, e.g. `https://greenhub-api.vercel.app`

### Step 2 — Deploy Frontend

1. Go to Vercel → New Project → Import same (or different) repo
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = `https://greenhub-api.vercel.app/api`
4. Deploy → your app is live!

### Step 3 — Update Backend FRONTEND_URL

Go back to your backend Vercel project → Settings → Environment Variables:
- Update `FRONTEND_URL` to your frontend Vercel URL (e.g. `https://greenhub.vercel.app`)
- Redeploy the backend

---

## 📧 Email Flow

| Action                        | Recipient     | Template                          |
|-------------------------------|---------------|-----------------------------------|
| Admin approves producer       | Producer      | ✅ Listing Approved email         |
| Admin rejects producer        | Producer      | ❌ Listing Status Update email    |
| Admin accepts buy request     | Buyer         | ✅ Buy Request Accepted email     |
| Admin rejects buy request     | Buyer         | ❌ Buy Request Status Update email|
| Admin replies to support ticket| Ticket owner | 💬 Support Team Reply email      |

---

## 🔐 Authentication

The app uses **dual authentication**:
1. **HTTP-only Cookie** (`gh_token`) — set by server on login, sent automatically with `credentials: 'include'`
2. **Authorization Header** — `Bearer <token>` stored in `localStorage` as fallback

Both are verified in `middleware.js`. The token expires in **7 days**.

---

## 📱 Mobile Responsive

All layouts use CSS Grid with `repeat(auto-fit, minmax(...))` and `clamp()` for font sizes, ensuring full responsiveness on all screen sizes without media queries.
