# 🌐 Miravo – A Minimal Social Media App

**SDE Intern Assessment Project | Built with NestJS + Next.js + MongoDB + Redis + WebSocket**

Miravo is a lightweight social media application that demonstrates key backend and frontend engineering concepts such as authentication, real-time notifications, queuing, and clean UI structure. Designed for performance, modularity, and simplicity.

---

## 🎯 Project Goals

- Implement secure **JWT-based authentication**
- Use **Redis + BullMQ** for async processing
- Send **real-time notifications via WebSockets**
- Apply **rate-limiting** to protect endpoints
- Build a clean, responsive UI using **Next.js (App Router)** and **shadcn/ui**
- Maintain **modular, clean code structure** following best practices

---

## 🛠 Tech Stack

| Layer        | Tech Used               |
| ------------ | ----------------------- |
| Language     | TypeScript              |
| Backend      | NestJS (REST APIs)      |
| Database     | MongoDB (via Mongoose)  |
| Queue        | Redis + BullMQ          |
| Real-time    | WebSocket (via Gateway) |
| Frontend     | Next.js (App Router)    |
| UI Library   | shadcn/ui               |
| Auth         | JWT-based Authentication|

---

## 🔐 Authentication

- Signup & Login using JWT
- NestJS AuthGuard for protected routes
- **Rate Limit:**  
  - **Signup:** Max 5 requests/min  
  - **Login:** Max 5 requests/min  

---

## ✍️ Post Creation (Queued + Notified)

- Users can create posts (title, description)
- Post creation is processed via **BullMQ** with a **5s delay**
- After delay:
  - Post is saved to **MongoDB**
  - A **WebSocket notification** is sent to all followers:
    > _"User X created a new post"_
- **Rate Limit:** Max 3 posts/min

---

## 🤝 Follow / Unfollow Users

- Instantly follow/unfollow any user
- On follow, the followed user receives a **real-time WebSocket notification**:
  > _"User X followed you"_

---

## 📰 Timeline Page

- Displays **posts from followed users only**
- Sorted by **newest first**
- No auto-refresh (manual refresh or navigation)

---

## 💡 Additional Features

- Like/Unlike a post with **realtime visual toggle**
- Comment on posts with dynamic loading
- **Follow/Unfollow** toggles update instantly
- **Like Count** displayed with each post
- **Dark/Light Mode** toggle for better accessibility
- UI toasts via `shadcn/ui` for feedback

---

## ⚙️ Rate Limiting Summary

| Endpoint       | Limit              |
| -------------- | ------------------ |
| Signup         | 5 requests/min     |
| Login          | 5 requests/min     |
| Create Post    | 3 requests/min     |

---

## 📸 Screenshots / Demo

_Add your screenshots/gif here when ready._

---

## 🧱 Folder Structure (Sample)

``

📁 backend/
│   ├── auth/
│   ├── posts/
│   ├── users/
│   ├── comments/
│   ├── websockets/
│   ├── queue/
│   └── main.ts
📁 frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── redux/
│   ├── styles/
│   └── utils/

``

---

## 📦 Setup Instructions

```bash
# Clone the repo
git clone https://github.com/your-username/miravo.git
cd miravo

# Setup backend
cd backend
npm install
npm run start:dev

# Setup frontend
cd ../frontend
npm install
npm run dev
```
## 📣 Author

**Tanu Panwar**  
*Full Stack Developer*  
📫 [LinkedIn](https://www.linkedin.com/in/tanu-panwar01/) | 🌐 [Portfolio](https://tanu-panwar-portfolio.vercel.app/)


## 📄 License

This project is licensed under the MIT License.
