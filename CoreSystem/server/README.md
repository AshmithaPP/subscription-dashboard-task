 Subscription Management Dashboard

A mini SaaS admin dashboard that allows users to subscribe to plans, view their active plan, and manage their profile — built with modern full-stack technologies.

🛠️ Tech Stack
Frontend

React.js (Vite)

TailwindCSS

Zustand (state management)

Backend

Node.js + Express.js

PostgreSQL

Knex.js (Query Builder)

JWT Authentication (Access + Refresh Tokens)

Joi (Validation)

🚀 Features
 Authentication & Authorization

Register and login using JWT tokens

Role-based access (Admin, User)

💳 Subscription Module

Users can view all plans

Subscribe to a plan

View their active subscription

Admins can view all subscriptions

⚙️ Backend APIs
Method	Endpoint	             Description	             Auth Required
POST	/api/auth/register	     Register new user	           No
POST	/api/auth/login	User     login	                       No
GET	    /api/plans	             Fetch all plans	           No
POST	/api/subscribe/:planId	 Subscribe to a plan	       Yes
GET	    /api/my-subscription	 Get current user's plan	   Yes
GET	    /api/admin/subscriptions View all subscriptions	Admin


🧰 Setup Instructions

1️⃣ Clone the repository
git clone https://github.com/AshmithaPP/subscription-dashboard-task.git
cd subscription-dashboard-task/server

2️⃣ Install dependencies
npm install

3️⃣ Setup environment file

Create a .env file inside /server with the following:

NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subscription_db
DB_USER=postgres
DB_PASSWORD=ruduo@123
JWT_ACCESS_SECRET=your_super_secure_access_secret_key_here_123
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_456
ADMIN_REGISTRATION_KEY=admin

4️⃣ Run database migrations and seeds
npx knex migrate:latest
npx knex seed:run

5️⃣ Start the server
npm run dev


Your backend will run on 👉 http://localhost:5000

📂 Folder Structure
subscription-dashboard-task/
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── knexfile.js
│   ├── package.json
│   └── .env
└── README.md


 Developer Info

Name: Ashmitha PP
Role: Web Developer
Email: ashmitha048@gmail.com

LinkedIn: linkedin.com/in/ashmitha-pp-6585a0261

GitHub: github.com/AshmithaPP


💬 Contact

If you face any issues while running the project or need clarification,
feel free to contact me at ashmitha048@gmail.com 
phoneNumber: 8825909442
