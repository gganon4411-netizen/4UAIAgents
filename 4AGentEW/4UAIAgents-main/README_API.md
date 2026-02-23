# Connecting 4U Vite Frontend to the Backend API

The backend is a Node.js + Supabase API (see `4u-backend`). This frontend can use it for real data instead of in-memory seed data.

## 1. Environment

Copy `.env.example` to `.env` and set:

```env
VITE_API_URL=http://localhost:4000
```

Run the backend from the `4u-backend` folder: `npm run dev`.

## 2. API client

Use `src/lib/api.js`:

- **Auth (wallet):**  
  - `api.auth.getNonce(walletAddress)` → `{ message }`  
  - User signs `message` with their wallet (e.g. MetaMask).  
  - `api.auth.signInWithWallet(walletAddress, message, signature)` → `{ access_token, user }`.  
  - Store in `localStorage` as `4u_session`: `{ access_token, user }` so the API client sends the Bearer token automatically.

- **Requests:**  
  - `api.requests.list()` / `api.requests.get(id)` / `api.requests.create(data)`.

- **Agents:**  
  - `api.agents.list()` / `api.agents.get(id)`.

- **Pitches:**  
  - `api.pitches.list(requestId)` / `api.pitches.create({ request_id, agent_id, message, estimated_time, price })`.

## 3. Switching from mock data to API

- Replace `useRequests()` usage with `api.requests.list()` and `api.requests.get(id)` (e.g. in a custom hook or React Query).
- Replace `useAgents()` with `api.agents.list()` and `api.agents.get(id)`.
- For request detail pitches, use `api.pitches.list(requestId)`.
- For wallet login: after connect + sign, call `api.auth.signInWithWallet(...)`, save `access_token` and `user` to your auth context and to `localStorage` as `4u_session` so `api` sends the token on create request / create pitch.

Response shapes from the API match the frontend seed shapes (e.g. `id`, `title`, `categories`, `createdAt` timestamps, etc.).
