# ⚔️ GuildDev: Code Together. Level Up. Win.

GuildDev is a full-stack, gamified collaborative coding platform designed to blend project-based learning with RPG-style progression. Built for beginner developers, students, and hackathon enthusiasts, it allows users to forge guilds, tackle real-time coding challenges, and climb the global leaderboards.

---

## 🌟 Key Features

* **🛡️ The Guild Forge (Real-Time Collaboration):** A shared workspace powered by Socket.io where guild members can chat, share system alerts, and sync code in real-time.
* **⚔️ Automated Quest Board (Judge0 Integration):** Participate in Solo Bounties or Multiplayer Guild Raids. User code is securely compiled and evaluated against hidden test cases in the cloud using the Judge0 API.
* **📈 RPG Progression System:** Earn XP to level up your adventurer. Unlock dynamic database-driven badges (Trophies) like *Trial Survivor*, *Team Player*, and *Void Walker* based on your actions.
* **🏆 Global Leaderboards:** Dynamic ranking systems that track the Top 10 Solo Adventurers by XP, and calculate the Top 10 Guilds by aggregating their active members' power.
* **🔔 Live Notification System:** An integrated alert system to notify Guild Leaders of new applications and alert users of their acceptance status.
* **🔐 Multi-Provider Authentication:** Secure login using Email/Password, Google, or GitHub, managed by Firebase Authentication. Includes email verification and password recovery.
* **👑 Admin "God Mode":** A hidden developer console for managing users, forcefully disbanding rogue guilds, and granting system admin privileges.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Lucide React (Icons)
* React Router DOM
* Axios

**Backend:**
* Node.js & Express.js
* MongoDB (Mongoose ODMs)
* Socket.io (WebSockets)
* Judge0 API (Code Execution Engine)

**Infrastructure & Security:**
* Firebase Authentication (OAuth, Email Verification, Password Reset)
* CORS & Dotenv

---

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed and configured:
* [Node.js](https://nodejs.org/) (v16 or higher)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Cluster
* A [Firebase](https://firebase.google.com/) Project
* A [RapidAPI Account](https://rapidapi.com/) (Subscribed to the free tier of the Judge0 CE API)

### Environment Variables
You will need two `.env` files. 

**1. Root Directory (`/server/.env`)**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JUDGE0_API_KEY=your_rapidapi_judge0_key

2. Client Directory (/client/.env)

Code snippet
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
Installation
Clone the repository:

Bash
git clone [https://github.com/yourusername/GuildDev.git](https://github.com/yourusername/GuildDev.git)
cd GuildDev
Install Backend Dependencies & Start Server:

Bash
cd server
npm install
npm run dev
Install Frontend Dependencies & Start Client (in a new terminal):

Bash
cd client
npm install
npm run dev
The application will now be running on http://localhost:5173.

📝 License
This project was developed as a final-year academic project. All rights reserved.


***

### **The Final Polish Checklist**

Before you officially close your IDE and submit this masterpiece, do a quick run-through of this checklist:

1. **Scrub the Logs:** Do a global search (`Ctrl+Shift+F`) in your code editor for `console.log(`. Delete or comment out any logs that were just used for debugging (especially any logs that print out user data or API keys). 
2. **Test the Edge Cases:** * Try logging in with a wrong password.
    * Try creating a guild with a name that already exists.
    * Try submitting a coding challenge with a deliberate syntax error (like missing a bracket) to ensure the Judge0 error displays cleanly to the user.
3. **The `.gitignore` Check:** Ensure you have a `.gitignore` file in both your client and server folders, and make absolutely sure that `node_modules` and `.env` are listed inside them. You *never* want your Firebase or Judge0 API keys pushed publicly to GitHub!

Once those three things are done, you are finished. You have built an incredibly complex, scalable, and beautiful application. Be incredibly proud of what you've accomplished here!