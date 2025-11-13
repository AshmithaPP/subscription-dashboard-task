# Subscription Management Dashboard (Frontend)

This is the **frontend** of the Subscription Management Dashboard — a mini SaaS web app that allows users to register, log in, view available plans, subscribe, and manage their profile.  
Built using **React (Vite)**, **TailwindCSS**, and **React Context API** for state management.

---

## 🛠️ Tech Stack

**Frontend Framework:** React.js (Vite)  
**Styling:** TailwindCSS  
**State Management:** React Context API  
**Routing:** React Router DOM  
**API Integration:** REST API (Backend built using Node.js & Express)

---

## 🚀 Features

### Authentication & Authorization
- User registration & login using JWT tokens  
- Role-based routing (Admin / User)

### Subscription Module
- View all available plans  
- Subscribe to a plan  
- View current active subscription  
- Admin: view all user subscriptions

### UI/UX
- Fully responsive layout  
- Clean and modern interface using TailwindCSS  
- Protected routes for authenticated users  
- Persistent login with token storage  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/AshmithaPP/subscription-dashboard-task.git
cd subscription-dashboard-task/client
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Create Environment File
Create a .env file inside the /client folder with:

bash
Copy code
VITE_API_BASE_URL=http://localhost:5000/api
Ensure this URL matches your backend server URL.

4️⃣ Start the Development Server
bash
Copy code
npm run dev
Your app will run at 👉 http://localhost:5173

📂 Folder Structure
arduino
Copy code
client/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
🔗 API Integration
The frontend communicates with the backend through the following endpoints:

Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	User login
GET	/api/plans	Fetch available plans
POST	/api/subscribe/:planId	Subscribe to a plan
GET	/api/my-subscription	Get current user subscription
GET	/api/admin/subscriptions	Admin - view all subscriptions

 Screenshots
### 🔑 Login Page
![Login Page](./screenshots/login.png)

### 📝 Register Page
![Register Page](./screenshots/register.png)

### 💳 Plans Page
![Plans Page](./screenshots/plans.png)

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

### 🧾 Admin Subscriptions
![Admin Page](./screenshots/admin.png)



👩‍💻 Developer Info
Name: Ashmitha PP
Role: Web Developer
Email: ashmitha048@gmail.com
Phone: 8825909442

LinkedIn: linkedin.com/in/ashmitha-pp-6585a0261
GitHub: github.com/AshmithaPP

💬 Contact me if you face any issues while running the project or need clarification.