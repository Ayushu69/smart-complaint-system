# 🏛️ CivicAI — Smart Complaint Management System

An AI-powered MERN stack application for filing, tracking, and analyzing citizen complaints with Claude AI integration.

## 🚀 Tech Stack

- **Frontend**: React + Vite, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: Anthropic Claude API
- **Auth**: JWT + bcrypt
- **Deployment**: Render

---

## 📂 Project Structure

```
smart-complaint-system/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── aiController.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── aiRoutes.js
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/index.js
    │   ├── components/Navbar.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── RegisterComplaint.jsx
    │   │   ├── ComplaintList.jsx
    │   │   └── ComplaintDetail.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── .env
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally
- Anthropic API key

### Backend

```bash
cd backend
npm install
# Edit .env with your values
npm run dev
```

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/complaintdb
JWT_SECRET=...
OPENROUTER_API_KEY=...
NODE_ENV=development
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Complaints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/complaints` | Add complaint | Protected |
| GET | `/api/complaints` | Get all complaints | Protected |
| GET | `/api/complaints/:id` | Get single complaint | Protected |
| PUT | `/api/complaints/:id` | Update status | Protected |
| DELETE | `/api/complaints/:id` | Delete complaint | Protected |
| GET | `/api/complaints/search?location=X` | Search by location | Protected |

### AI
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/analyze` | AI analysis of complaint | Protected |

---

## 🤖 AI Features

- **Priority Detection**: Low / Medium / High / Critical
- **Department Recommendation**: Auto-suggests responsible government dept
- **Complaint Summary**: 2-3 sentence AI-generated summary
- **Auto Response**: Professional response to send to the citizen

---

## 🔐 Authentication

- JWT stored in localStorage
- bcrypt password hashing (salt rounds: 10)
- Protected routes via `Authorization: Bearer <token>` header

---

## 🌐 Deployment on Render

### Backend
1. Create **Web Service** on Render
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add environment variables:
   - `MONGO_URI` → MongoDB Atlas connection string
   - `JWT_SECRET` → strong random string
   - `ANTHROPIC_API_KEY` → your key
   - `NODE_ENV=production`

### Frontend
1. Create **Static Site** on Render
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` → your Render backend URL + `/api`

---

## 🧪 Test Cases

| Action | Expected Result |
|--------|----------------|
| Add valid complaint | Complaint stored successfully |
| Missing title | Validation error |
| Invalid email | Error message |
| Filter by location | Matching complaints displayed |
| Valid login | Token generated |
| Invalid password | Unauthorized error |
| Access without token | Access denied |
| Run AI on water leakage | Water Supply dept suggested |
| Run AI on electricity issue | High priority alert |
| Delete complaint | Complaint removed |

---

## 👤 Author

**Your Name** — B.Tech 4th Semester  
AI Driven Full Stack Development (AI308B)  
ESE Examination — Even Sem 2025-26
