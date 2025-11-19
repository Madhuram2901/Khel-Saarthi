# Khel Saarthi - Your Sport, Your Community

Khel Saarthi is a mobile-first platform designed to solve the fragmentation in India's local sports ecosystem. It serves as a single, unified hub that connects athletes with organizers, making it easy to discover, join, and manage sporting events.

## Features Implemented

- **Full User Authentication:** Secure user registration and login for "participant" and "host" roles.
- **Persistent Login:** The app remembers the user's session, providing a seamless experience upon reopening.
- **Event Creation (Hosts):** Logged-in hosts can create new sporting events.
- **Event Discovery:** The home screen fetches and displays a list of all available events.

## Screenshots

<details>
  <summary>Click to view screenshots</summary>

  ### Login Page
  ![Login Page](<frontend/project_screenshots/Login Page.jpeg>)

  ### Register Page
  ![Register Page](<frontend/project_screenshots/Register Page.jpeg>)

  ### User Home Page
  ![User Home Page](<frontend/project_screenshots/User Home Page.jpeg>)

  ### Host Home Page
  ![Host Home Page](<frontend/project_screenshots/Host Home Page.jpeg>)
</details>

## Tech Stack

### Backend
<div align="center">

# Khel Saarthi

**Your sport, your community.** A mobile-first platform that connects grassroots athletes with local organizers so they can discover, join, chat about, and manage sporting events together.

</div>

## Table of Contents
- [Product Overview](#product-overview)
- [Feature Matrix](#feature-matrix)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Environment & Secrets](#environment--secrets)
- [Quick Start](#quick-start)
- [Team Collaboration Playbook](#team-collaboration-playbook)
- [Screenshots](#screenshots)

## Product Overview

Khel Saarthi centralizes India’s fragmented local sports scene. Hosts can publish verified events, participants can browse via map or curated feeds, and everyone stays synced through in-app chat and push-style notifications powered by Socket.IO.

## Feature Matrix

| Area | Capabilities |
| --- | --- |
| **Authentication** | Participant/Host roles, JWT login/register, persistent sessions stored with AsyncStorage, profile refresh after edits. |
| **Event Discovery** | Category filters, search parameters (sport, skill level, fee, date range), map markers with “tap for details”, hero recommendations. |
| **Event Management** | Hosts create, edit, and delete events; participants can register/unregister; hosts see participant rosters. |
| **Profiles** | Upload/remove profile photos via Cloudinary, manage badminton-specific metrics (skill level, playstyle, height/weight, experience), edit core identity info. |
| **Chat & Notifications** | Per-event rooms, history fetch, real-time messaging, lightweight notification pings to others in the room. |
| **UX Niceties** | Styled cards, category chips, hero CTA, safe-area layouts, logout shortcut, Expo CLI tooling. |

## Architecture

- **Backend** — Node.js, Express, Mongoose, JWT, Socket.IO, Cloudinary SDK. See `backend/README.md` for API details, environment variables, and npm scripts.
- **Frontend** — Expo + React Native, React Navigation, Axios, Socket.IO client, AsyncStorage. See `frontend/README.md` for screen inventory and development tips.
- **Database** — MongoDB Atlas cluster referenced via `MONGO_URI`.
- **File Storage** — Cloudinary for profile images.

## Project Structure

```
backend/
    README.md          # API, env, scripts
    config/            # Mongo + Cloudinary setup
    controllers/       # User and Event business logic
    middleware/        # Auth guard
    models/            # Mongoose schemas (User, Event, Message)
    routes/            # Express routers
    socketHandler.js   # Socket.IO room + chat wiring
frontend/
    README.md          # Expo setup, screen tour
    api/               # Axios baseURL helper
    components/        # Cards, buttons, filters
    context/           # Auth provider
    navigation/        # Stack/tab navigators
    screens/           # Feature screens
```

## Environment & Secrets

- Copy `backend/.env.example` → `backend/.env`, then follow the table inside `backend/README.md` to fill `MONGO_URI`, `JWT_SECRET`, and Cloudinary keys.
- The frontend currently reads `API_BASE_URL` from Expo’s `hostUri` (see `frontend/api/api.js`). When sharing builds or running on different networks, update that helper or inject your own env handling as needed.
- Never commit `.env`. Use `.env.example` as the canonical template shared with collaborators.

## Quick Start

```bash
# Backend API
cd backend
npm install
cp .env.example .env   # fill secrets afterwards
npm run dev

# Frontend app (new terminal)
cd frontend
npm install
npx expo start --lan    # or --tunnel if devices cannot hit your LAN IP
```

Refer to the separate backend/frontend READMEs for extended commands (production builds, linting, etc.).

## Team Collaboration Playbook

| Step | What collaborators need |
| --- | --- |
| 1. Repo access | Share this GitHub repo or export a ZIP. |
| 2. Environment | Provide teammates with the `.env` contents **securely** (password manager, 1Password share link, etc.). They must place it inside `backend/.` and keep it private. |
| 3. Mongo/Cloudinary | If everyone points to the same Atlas cluster + Cloudinary account, they will see the same data/media. Otherwise, each teammate can configure their own resources and adjust `MONGO_URI` + Cloudinary keys locally. |
| 4. JWT secret | The `JWT_SECRET` is just the signing key for tokens. Sharing the same secret lets each backend instance verify tokens issued by the others. Tokens themselves still encode the user who logged in; do **not** reuse someone else’s token—just log in with your own credentials. |
| 5. Running locally | Follow the Quick Start commands above. Confirm the backend is reachable on the same LAN or run Expo with `--tunnel` so devices outside the LAN can talk to it. |
| 6. Git workflow | Create feature branches, open PRs, and keep `.env` out of version control. Update `.env.example` whenever a new configuration key is introduced so teammates instantly know what to add. |

> **FAQ:** If you privately share `.env`, your teammates will have the same `JWT_SECRET`, so their backend can issue/verify tokens just like yours. Tokens are per user, so they should create their own accounts (or use provided credentials) rather than reuse your token string. 

## Screenshots

<details>
    <summary>UI preview</summary>

    ### Login Page
    ![Login Page](<frontend/project_screenshots/Login Page.jpeg>)

    ### Register Page
    ![Register Page](<frontend/project_screenshots/Register Page.jpeg>)

    ### User Home Page
    ![User Home Page](<frontend/project_screenshots/User Home Page.jpeg>)

    ### Host Home Page
    ![Host Home Page](<frontend/project_screenshots/Host Home Page.jpeg>)
</details>
