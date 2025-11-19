# Khel Saarthi Backend

Node/Express API that powers authentication, event management, real-time chat, and media uploads.

## Requirements

- Node.js 18+
- npm 9+
- MongoDB Atlas cluster or local MongoDB
- Cloudinary account for image uploads (profile pictures)

## Environment Variables

Copy `.env.example` to `.env` and fill the values.

| Key | Required | Description |
| --- | --- | --- |
| `PORT` | Optional | API listening port. Defaults to `5001`. |
| `MONGO_URI` | Yes | MongoDB connection string (Atlas SRV or local). |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWT access tokens. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud identifier. |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret. |

### Generate a JWT Secret

- macOS / Linux
  ```bash
  openssl rand -hex 32
  ```
- Windows PowerShell
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Paste the value into `JWT_SECRET`. Changing the secret invalidates existing tokens but does not affect MongoDB data.

## Installation

```bash
cd backend
npm install
```

## Development

```bash
npm run dev
```

The script runs `nodemon server.js` and reloads when backend files change. The server will log the MongoDB host name once connected.

## API Overview

- `POST /api/users/register` — Register Participant/Host
- `POST /api/users/login` — Login, returns JWT
- `PUT /api/users/update` — Update profile details & picture
- `PUT /api/users/profile/badminton` — Update badminton profile information
- `GET /api/users/myevents` — List event IDs the user joined
- `GET /api/users/profile` — Fetch authenticated user profile
- `DELETE /api/users/profile-picture` — Remove profile picture
- `GET /api/events` — Filtered list query
- `GET /api/events/:id` — Event details
- `POST /api/events` — Host creates event
- `PUT /api/events/:id` — Host edits event
- `POST /api/events/:id/register` — Participant joins event
- `GET /api/events/:id/participants` — Host views participants
- `GET /api/events/:id/chat` — Fetch chat history

Socket.io events are defined in `socketHandler.js` for room join, send/receive message, and lightweight notifications.

## Testing

No automated tests yet. Use tools like Postman or Thunder Client to exercise the endpoints.