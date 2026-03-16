# GuildDev 10-Day Sprint Plan (Rapid Deployment)

## Phase 1: The Foundation (Days 1-2)

### Day 1: Project Scaffolding & Authentication
- **Backend Setup**: Initialize a Node/Express server. Install `cors`, `dotenv`, `mongoose`, and `firebase-admin`.
- **Frontend Setup**: Initialize a React app using Vite (faster than CRA). Install `firebase`, `axios`, and `react-router-dom`.
- **Firebase Integration**: Set up a Firebase project and enable Email/Password login. Implement the Login/Sign-up UI on the frontend.
- **Database Connection**: Connect to MongoDB Atlas and create a basic `User` schema (`email`, `username`, `isQualified`, `xp`, `level`).

### Day 2: User Profiles & The Preliminary Stage
- **Dashboard UI**: Create a dark-mode dashboard shell using Tailwind CSS. 
- **Preliminary Module**: Build a "Level 0" quest page. This is a simple coding prompt (e.g., "Return the sum of two numbers").
- **Qualification Logic**: Create a backend route that updates `isQualified: true` in MongoDB once a user completes this initial task.

---

## Phase 2: Collaboration & Real-Time Sync (Days 3-5)

### Day 3: Guild Infrastructure
- **Guild Schema**: Create a `Guild` schema in MongoDB (`name`, `members[]`, `projectState`).
- **Joining Logic**: Build the "Adventurer’s Hub" where users can browse existing guilds or create a new one.
- **Socket.io Setup**: Initialize Socket.io on the server. Test a basic "Hello World" connection between the client and server.

### Day 4: The Shared Code Editor
- **Editor Integration**: Install `@monaco-editor/react`. 
- **Real-Time Sync**: Implement Socket.io "rooms" based on the `GuildID`. Use the `onChange` event in Monaco to emit code updates to the room.
- **Cursor Presence**: (Optional for MVP) Show simple "X is typing..." indicators to save time over full cursor sync.

### Day 5: Code Execution (Judge0)
- **API Integration**: Connect the "Run" button to the Judge0 API.
- **Execution Workflow**: Send the editor content to Judge0, receive the stdout/stderr, and display it in a terminal-style component below the editor.
- **Testing**: Ensure code runs correctly for at least one language (e.g., JavaScript).

---

## Phase 3: Gamification & RPG Elements (Days 6-8)

### Day 6: XP & Leveling Logic
- **Backend Rewards**: Create a utility function to calculate XP rewards based on completed tasks.
- **Progression System**: Implement logic to "level up" users when they hit XP milestones (e.g., 100 XP = Level 2).
- **Frontend Feedback**: Add a glowing XP bar to the navigation or sidebar that updates in real-time.

### Day 7: Badge & Achievement System
- **Badge Assets**: Source or create 4-5 RPG-themed icons (e.g., "Code Squire," "Bug Hunter").
- **Achievement Logic**: Trigger a "Badge Earned" modal when specific database flags are met (e.g., first guild joined, 5 code executions).

### Day 8: UI/UX Polish & Visual Feedback
- **Theme Injection**: Apply consistent charcoal backgrounds (`#0B0E14`) and neon accents across all pages.
- **Animations**: Use `framer-motion` for subtle transitions when menus open or levels increase.
- **Responsive Check**: Ensure the editor and dashboard are usable on laptop and tablet screens.

---

## Phase 4: Quality Assurance & Launch (Days 9-10)

### Day 9: Bug Squashing & Optimization
- **End-to-End Testing**: Walk through the user journey: Sign up -> Complete Preliminary Quest -> Create Guild -> Edit Code -> Run Code.
- **Error Handling**: Add "Try/Catch" blocks and user-facing alerts for failed API calls or disconnected sockets.
- **Environment Variables**: Move all keys (Firebase, MongoDB, Judge0) to a `.env` file and ensure they are not committed to Git.

### Day 10: Deployment
- **Database**: Perform a final cleanup of test data in MongoDB Atlas.
- **Backend Deployment**: Push the server to **Render** or **Railway**. Configure CORS to allow your frontend domain.
- **Frontend Deployment**: Push the React app to **Vercel**.
- **Documentation**: Finalize the `README.md` and project report based on the actual implemented features.

---

## 🛑 Vital "Don't Do" List (To Stay on Schedule)
1. **NO** Custom Authentication: Stick with Firebase; do not build your own JWT/Salt system.
2. **NO** Kubernetes/Docker: Deploy directly to PaaS providers (Vercel/Render) to avoid dev-ops overhead.
3. **NO** Native Mobile App: Keep it as a PWA or responsive web app.
4. **NO** Complex Backend Scalability: Focus on 5-10 concurrent users for the demo rather than 10,000.