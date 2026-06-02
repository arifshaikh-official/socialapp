# ⚡ SocialApp — Mini Social Post Application

> Full-stack social feed app built with React + Node.js + MongoDB  
> Inspired by TaskPlanet's Social Page | 3W Full Stack Internship Assignment

---

## 📸 Features

- ✅ **Auth** — Signup & Login with JWT (email + password)
- ✅ **Create Post** — Text, image, or both
- ✅ **Public Feed** — All posts sorted by latest / most liked / most commented
- ✅ **Like** — Toggle like with instant optimistic update
- ✅ **Comment** — Add & view comments in real time
- ✅ **Delete** — Post owners can delete their own posts
- ✅ **Infinite Scroll** — Pagination via IntersectionObserver
- ✅ **Search** — Client-side search by text, username, or tags
- ✅ **Points System** — Users start with 50 points, earn +100 per post
- ✅ **Responsive** — Works on mobile and desktop

---

## 🗂️ Project Structure

```
socialapp/
├── backend/           # Node.js + Express API
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/       # (auto-created) image uploads
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/          # React.js app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── CreatePost.js
    │   │   └── PostCard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── SignupPage.js
    │   │   └── FeedPage.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── package.json
    └── .env.example
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/socialapp.git
cd socialapp
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env from example
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET

npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env from example
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api (already set)

npm start
# App runs on http://localhost:3000
```

---

## 🌐 Deployment

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — your Vercel/Netlify frontend URL

### Frontend → Vercel
1. Import repo on [Vercel](https://vercel.com)
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output: `build`
5. Add env variable:
   - `REACT_APP_API_URL` — your Render backend URL + `/api`

### Database → MongoDB Atlas
1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create DB user and whitelist IPs (or allow all: `0.0.0.0/0`)
3. Copy the connection string into your backend `.env`

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/posts?page=1&sort=latest` | ❌ | Paginated feed |
| POST | `/api/posts` | ✅ | Create post (multipart) |
| PUT | `/api/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/posts/:id/comment` | ✅ | Add comment |
| DELETE | `/api/posts/:id` | ✅ | Delete own post |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| UI Library | Material UI (MUI) v5 |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer |
| Deployment | Vercel + Render + MongoDB Atlas |

---

## 📩 Submission
Built for the **3W Full Stack Internship Assignment**  
Contact: hr@triplewsols.com
