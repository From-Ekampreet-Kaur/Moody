## Plan: Build Complete Backend for Moody App

Your Moody app has a beautiful, fully-functional frontend with all UI components complete. The core gap is implementing the entire backend layer — authentication, database integration, API routes, and data persistence. This plan transforms your client-side prototype into a production-ready full-stack application.

### Steps

1. **Set up MongoDB connection and environment configuration** — Create `.env` file with MongoDB URI and session secret, install required packages (`mongoose`, `bcryptjs`, `express-session`, `connect-mongo`, `dotenv`), and configure database connection in `app.js` with proper error handling.

2. **Create Mongoose models and database schema** — Build `models/User.js` (name, email, hashed password, age, dob, condition, allergies, medications, supportPersonEmail), `models/Mood.js` (userId ref, mood, note, affirmations array, date), and `models/Craving.js` (userId ref, type, customInput, date) with proper validation and indexing.

3. **Implement complete authentication system** — Configure `express-session` with MongoDB store, create `middleware/auth.js` with route protection, hash passwords with bcrypt in `routes/authRoutes.js`, implement register/login/logout endpoints with proper validation, and update POST `/login` and POST `/signup` handlers in `app.js`.

4. **Build RESTful API routes for features** — Create `routes/moodRoutes.js` (POST log mood, GET mood history), `routes/cravingRoutes.js` (POST log craving, GET craving history), `routes/profileRoutes.js` (GET/PUT user profile, POST support person), and mount all routes in `app.js` with authentication middleware protecting endpoints.

5. **Connect frontend forms to backend APIs** — Update EJS files to submit to backend endpoints, add fetch/AJAX calls in `moods.ejs` and `cravings.ejs` to persist data, modify `profile.ejs` to load and update user data from database, create dashboard page showing real data from MongoDB, and add success/error toast notifications.

6. **Add security hardening and production features** — Implement input validation using `express-validator`, add CSRF protection, configure CORS properly, create centralized error handling middleware, add rate limiting on auth routes, and set secure session configuration (httpOnly, secure flags).

### Further Considerations

1. **Dashboard vs Landing** — Current `landing.ejs` serves as home page. Should we create a separate authenticated `dashboard.ejs` showing personalized stats (mood summary, recent cravings, affirmation), or convert landing page to dashboard after login?

2. **Partner connection feature scope** — Should support person functionality include: (A) Just store email in user profile, (B) Allow inviting another Moody user with connection approval, or (C) Enable basic notifications/sharing between connected users?

3. **Data migration strategy** — Users currently have data in localStorage (moods, cravings, profile). Should we: (A) Provide import tool to migrate localStorage to database on first login, (B) Start fresh and ignore localStorage, or (C) Keep localStorage as fallback for offline mode?
