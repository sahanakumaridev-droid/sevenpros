# SevenPros

A Fiverr-style local service marketplace for California, built from the SevenPros PRD
(`Downloads/Seven-Pros-PRD.docx`). FastAPI backend + React (Vite/Tailwind) frontend.

## Structure

```
backend/    FastAPI + SQLAlchemy + SQLite (swap DATABASE_URL for Postgres in prod)
frontend/   React 19 + Vite + Tailwind v4 + React Router
```

## Running locally

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.seed.seed      # one-time: seeds 340 categories + demo providers/reviews
uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App at http://localhost:5173 (proxies `/api` to the backend on port 8000).

### Demo logins (from the seed script)

- Customer: `maria.garcia@example.com` / `password123`
- Provider: `owner0@sevenpros-demo.com` / `password123` (use the Customer/Pro switch
  in the navbar after logging in)

## What's real vs. mocked

Built for real, backed by the database:
- Email + phone (OTP) auth, JWT sessions
- Customer <-> Provider mode switch ("Become a Pro", mirrors Fiverr's buyer/seller toggle)
- 340 service categories from the PRD, grouped into the 20 top-level groups
- Search with filters (verified/licensed/insured/background-checked, price, rating,
  emergency, instant booking) and 5 sort modes including a transparent "Best Match"
  scoring heuristic (see `app/routers/search.py::match_score` -- not a trained model)
- Booking lifecycle (pending -> accepted -> in_progress -> completed/cancelled)
- Reviews + provider replies, favorites, provider service/business-profile management,
  provider dashboard with earnings/stats

Mocked, with a clear integration point in the code:
- **Payments**: `app/routers/payments.py` records a "succeeded" payment with no card
  processor call. Swap in Stripe PaymentIntents using `STRIPE_SECRET_KEY`.
- **Chat**: `app/routers/chat.py` is a polling REST thread, no WebSocket push, no
  voice/video calling.
- **Maps / live tracking**: provider lat/lng is stored and used for distance sorting,
  but there's no live GPS tracking or map rendering yet -- add `GOOGLE_MAPS_API_KEY`.
- **Social login (Google/Apple/Facebook)**: not implemented -- needs real OAuth app
  credentials per provider.
- **AI features** (chat assistant, fraud detection, review summaries, translation):
  not implemented -- `OPENAI_API_KEY` is the integration point.

See `.env.example` for every key a production deployment would need.
