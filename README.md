🚀 MERN Blog App

A fully featured MERN (MongoDB, Express, React, Node.js) blogging platform built with:

🔐 JWT Authentication

🎨 Modern, aesthetic UI with glassmorphism

🌗 Light & Dark Theme toggle

📝 Create, edit, delete posts

📸 Image & video upload support

📊 User streak heatmap (GitHub-style activity graph)

👤 User Profiles with stats

📜 User post history

🔔 Toast notifications

📱 Responsive & mobile friendly

This app allows users to create stunning blog posts, manage accounts, track posting streaks, and interact inside a clean & elegant UI.

🌟 Features
🔐 Authentication

Register & Login using JWT

“Keep me logged in” option using localStorage / sessionStorage

Forgot Password + Reset Password flow

Secure protected routes

📝 Posts

Create, edit, delete posts

Rich text formatting (Markdown-like styling)

Upload images or videos with preview

Send button with posting status animation

👤 User Profile

Avatar bubble (auto-initials)

Profile photo upload support

Joined date

Total posts count

Posting streak

Heatmap activity visualization

Quick profile dropdown: Account → History → Sign Out

🎨 UI / UX

Glass-effect header

Soft elevation animations for cards & buttons

Full light & dark theme support

Hover animations on all components

Fully responsive layout

📂 Project Structure
blog-app/
│
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Navbar, ProfileDropdown, Heatmap, etc.
│   │   ├── pages/       # Home, Login, Register, Account, NewPost...
│   │   ├── context/     # AuthContext
│   │   ├── api.js       # Axios base config
│   │   └── styles.css   # Global styles + theme variables
│   └── vite.config.js
│
└── server/              # Node + Express backend
    ├── src/
    │   ├── models/      # User, Post
    │   ├── routes/      # auth.js, posts.js, users.js
    │   └── index.js     # Main server entry point
    └── uploads/         # User uploads (images / videos)

🛠️ Tech Stack
Frontend

React 18 + Vite

React Router

Axios

Custom CSS (glassmorphism + theme variables)

Backend

Node.js

Express

MongoDB + Mongoose

JSON Web Tokens (JWT)

Multer (file uploads)

bcrypt (password hashing)

🚀 Running the Project Locally
1. Clone this repository
git clone https://github.com/yourusername/blog-app.git
cd blog-app

2. Install server dependencies
cd server
npm install

3. Install client dependencies
cd ../client
npm install

🔑 Environment Variables

Create a .env file inside server/:

MONGO_URI=mongodb://127.0.0.1:27017/blog_app
JWT_SECRET=your_secret_key
RESET_TOKEN_SECRET=another_secret
BASE_URL=http://localhost:5173

▶️ Start the app
Start Backend
cd server
npm run dev

Start Frontend
cd client
npm run dev


App will run at:

👉 Frontend: http://localhost:5173

👉 Backend: http://localhost:5000

📸 Screenshots
<img width="959" height="438" alt="f1" src="https://github.com/user-attachments/assets/fc52654c-ae99-48f0-9ff8-a7ced3120eb8" />
<img width="947" height="439" alt="f2" src="https://github.com/user-attachments/assets/41b6d8e8-54c0-4679-9469-7758811545ff" />
<img width="959" height="436" alt="f3" src="https://github.com/user-attachments/assets/81893da8-12e6-4acb-9bd2-61095bd8ba73" />
<img width="947" height="439" alt="f4" src="https://github.com/user-attachments/assets/7bd7cd53-755d-42b3-9b7e-2745626f8e41" />
<img width="946" height="439" alt="f5" src="https://github.com/user-attachments/assets/55d79625-bbe1-4b32-ac44-78a3aaf4ed7a" />
<img width="941" height="431" alt="f6" src="https://github.com/user-attachments/assets/3cc7be19-7746-4bae-88b3-8d2e6ac4ea3b" />

📈 Future Enhancements

Full WYSIWYG markdown editor

Comment system

Categories & tags

Save draft functionality

Infinite scroll on posts

