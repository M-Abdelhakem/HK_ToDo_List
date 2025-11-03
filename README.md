## Hallownest Quest Journal - Hierarchical Todo List

A full‑stack Hollow Knight–themed hierarchical todo app where multiple users create "quest journals" and organize quests with nested sub‑quests. The UI embraces a dark, elegant Hallownest aesthetic, and the backend persists data in PostgreSQL.


### Features

- **Multi-user authentication system**
- **Multiple quest journals (lists)** per user
- **Hierarchical tasks**
- **Collapse/expand** nested quests
- **Mark quests complete** with visual indicators
- **Move top‑level quests** between journals
- **Persistent storage** in PostgreSQL via SQLAlchemy
- **Dark Hollow Knight themed UI** with elegant typography
 - **Ambient background music with toggle**

**Optional Extensions Implemented:**

- Allowing for infinite sub‑tasks; UI remains clean via collapsible nesting
- Allowing for moving tasks and subtasks around arbitrarily.


### Tech Stack

**Backend**
- Python 3.x
- Flask (web framework)
- Flask‑JWT‑Extended (authentication)
- SQLAlchemy (ORM)
- PostgreSQL (database)
- Flask‑CORS (cross‑origin requests)

**Frontend**
- Next.js 14 (React framework)
- React 18
- TypeScript
- Tailwind CSS (styling)
- shadcn/ui (UI components)

**Additional**
- Google Fonts (Cinzel typography)
- JWT for authentication


### Project Structure

```text
project-root/
├── backend/
│   ├── models/            # Database models
│   │   ├── __init__.py
│   │   ├── user.py        # Users
│   │   ├── list.py        # Todo lists (journals)
│   │   └── item.py        # Todo items (quests)
│   ├── routes/            # API endpoints (blueprints)
│   │   ├── __init__.py
│   │   ├── auth.py        # Register, login, me
│   │   ├── lists.py       # CRUD for lists
│   │   └── items.py       # CRUD for items, nested retrieval
│   ├── app.py             # Flask app factory & blueprint registration
│   ├── config.py          # App configuration (env-driven)
│   ├── database.py        # DB init and data access helpers
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # UI & feature components
│   ├── contexts/          # React contexts (auth, data, music)
│   ├── lib/               # Utilities and API client
│   ├── public/            # Static assets
│   ├── styles/            # Global styles
│   └── package.json       # Node dependencies & scripts
│
└── README.md
```


### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm (or yarn/pnpm)


### Installation & Setup

#### Database Setup

```bash
# Open psql (adjust user/host as needed)
psql postgres

# Inside psql console:
CREATE DATABASE hollow_knight_todo;
```

#### Backend Setup (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 app.py
```

Note: Backend runs at `http://localhost:5001`.

#### Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Note: Frontend runs at `http://localhost:3000`.

If you encounter peer dependency errors during install:

```bash
npm install --legacy-peer-deps
```


### Environment Variables (Optional)

You do not need to add `.env` files for local testing/development — sensible defaults
are provided and the app will run out‑of‑the‑box. If you prefer environment‑based
configuration, create these files:

Backend (`backend/.env`):

```env
DATABASE_URL=postgresql://localhost/hollow_knight_todo
JWT_SECRET_KEY=your-secret-key-here
SECRET_KEY=another-secret-for-flask
FLASK_ENV=development
```

Frontend (`frontend/.env.local`):

```env
# If you wire this up in code, otherwise adjust API_BASE_URL in frontend/lib/api.ts
NEXT_PUBLIC_API_URL=http://localhost:5001
```

By default, the frontend’s API client points to `http://localhost:5001` (see `frontend/lib/api.ts`).


### Usage / How to Use

0. **Home**
   - Open `http://localhost:3000/` to access the home page
   - From Home you can browse journals or navigate to Register/Login

1. **Register/Login**
   - Go to `http://localhost:3000/register`
   - Create an account with your name, email, and password
   - Login with your credentials

2. **Create a Quest Journal (Todo List)**
   - On Home, click “Open New Path”
   - Enter a journal name
   - Click “Create”

3. **Add Quests (Tasks)**
   - Open a journal
   - Click “Mark Quest” to add a new quest
   - Enter details and submit

4. **Add Sub‑Quests**
   - Hover a quest to reveal actions
   - Click “+” to add a sub‑quest
   - Sub‑quests can have sub‑quests (up to 3 levels total)

5. **Manage Quests**
   - **Complete**: Checkbox to mark as conquered
   - **Edit**: Pencil icon to change details
   - **Delete**: Trash icon to remove
   - **Collapse/Expand**: Arrow to hide/show children
   - **Move**: Arrow‑right to move top‑level quests between journals

6. **Logout**
   - Click “Return to Surface” in the header


### API Endpoints

Base URL: `http://localhost:5001`

Authentication

- `POST /auth/register` — Register new user
- `POST /auth/login` — Login and receive access token
- `POST /auth/logout` — Client‑acknowledged logout (token removed client‑side)
- `GET  /auth/me` — Get current user (requires Bearer token)

Lists

- `GET    /lists` — Get all lists for current user
- `POST   /lists` — Create new list
- `PUT    /lists/:id` — Update list (title/position)
- `DELETE /lists/:id` — Delete list

Items

- `GET    /lists/:list_id/items` — Get all items for a list (nested)
- `POST   /lists/:list_id/items` — Create new item (optional `parent_id`)
- `PUT    /items/:item_id` — Update item (title, completed, position, parent, list)
- `DELETE /items/:item_id` — Delete item (cascades children)

All endpoints (except register/login) require JWT in the `Authorization: Bearer <token>` header.


### Database Schema

Users (`users`)

- `id` (PK)
- `name`
- `email` (unique)
- `password_hash`

Lists (`lists`)

- `id` (PK)
- `title`
- `user_id` (FK → users.id)
- `position` (for ordering)

Items (`items`)

- `id` (PK)
- `title`
- `completed` (boolean)
- `list_id` (FK → lists.id)
- `parent_id` (self‑referential FK → items.id, nullable)
- `position` (for ordering within siblings)
- `level` (1, 2, 3 for depth)


### Design Decisions

Authentication

- Stateless JWT stored client‑side
- Access tokens expire (configurable); no refresh flow is currently implemented

Hierarchical Structure

- Constrained to 3 levels for clear UI/UX
- Self‑referential `parent_id` for nesting
- Recursive rendering on the frontend
- `level` facilitates validation and styling

Theme

- Hollow Knight–inspired dark aesthetic
- Cinzel font for elegant, carved‑stone feel
- Purple (void/soul) accenting and in‑universe terminology (quests, paths, conquered)


### Known Issues / Limitations

- No drag‑and‑drop reordering yet
- No “forgot password” flow


### Demo Video

[Watch the Demo Video](https://www.loom.com/share/e669dba8e7844bbea29e6852708029f0)


### Attribution

- **Theme Inspiration:** Hollow Knight by Team Cherry

This project was created as part of CS162 at Minerva University.


### Author

- **Name:** Mohanad Abdelhakem
- **Date:** November 3rd, 2025
