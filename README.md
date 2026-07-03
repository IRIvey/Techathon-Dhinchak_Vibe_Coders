# Office Monitor -- Lights, Fans, Discord

Real-time office device monitoring: a shared FastAPI backend, a React dashboard, and a
Discord bot, all reading from one source of truth.

**Note on device count:** the problem statement is internally inconsistent (it says
"5 devices per room, 15 total" in one place and "18 devices" elsewhere, while its own
summary graphic lists 6 fans + 9 lights = 15). This implementation uses the literal
per-room breakdown: **2 fans + 3 lights x 3 rooms = 15 devices**.

## Project structure
```
office-monitor/
├── backend/     # FastAPI: device model, simulator, REST + WebSocket API
├── dashboard/   # React + Vite + Tailwind: live web dashboard
├── bot/         # discord.py bot: !status, !room, !usage
└── diagrams/    # system diagram + circuit schematic (add before submission)
```

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- A Discord Application + Bot Token (see below)
- (Optional) A Groq API key, for friendlier bot responses

## 1. Discord bot setup (do this before running the bot)

1. Go to https://discord.com/developers/applications -> **New Application**.
2. Left sidebar -> **Bot** -> copy the bot token.
3. On the same Bot page, under **Privileged Gateway Intents**, enable **Message Content Intent**.
   Without this, the bot cannot read `!status` etc.
4. Left sidebar -> **OAuth2 -> URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: Send Messages, Read Message History, View Channels
   - Copy the generated URL, open it, and add the bot to your test server.
5. The bot will show offline in your server until you actually run `bot.py` (step 4 below).

## 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # edit if you want to change the alert threshold
uvicorn main:app --reload --port 8000
```

Backend is now live at `http://localhost:8000`. Check it with:
```bash
curl http://localhost:8000/devices
```

## 3. Dashboard setup

In a **new terminal**:
```bash
cd dashboard
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`). The dashboard connects to the
backend at `ws://localhost:8000/ws` -- make sure the backend (step 2) is already running.

## 4. Bot setup

In a **new terminal**:
```bash
cd bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `bot/.env` and fill in:
- `DISCORD_BOT_TOKEN` -- from step 1
- `GROQ_API_KEY` -- optional, leave blank to get raw (non-LLM-polished) responses
- `BACKEND_URL` -- leave as `http://localhost:8000` if running locally

Then run:
```bash
python bot.py
```
The bot should show online in your Discord server. Test with `!status`, `!room work1`, `!usage`.

## Run order (every time)

1. Backend (`uvicorn main:app --reload --port 8000`) -- must be running first
2. Dashboard (`npm run dev`) -- connects to backend
3. Bot (`python bot.py`) -- connects to backend

## Alert thresholds

- After-hours alert: triggers automatically outside 9 AM - 5 PM (UTC-based `datetime.now`,
  adjust in `backend/alerts.py` if you need a specific timezone).
- Continuous-on alert: default 120 minutes (2 hours) per spec. For a live demo, set
  `CONTINUOUS_ON_THRESHOLD_MINUTES=1` in `backend/.env` and restart the backend so it
  triggers quickly on stage.

## Still to do before submission

- [ ] Add `diagrams/system-diagram.png` (draw.io/Excalidraw, no Mermaid)
- [ ] Build the Wokwi circuit for one room, screenshot into `diagrams/circuit-schematic.png`,
      and add the Wokwi project link here
- [ ] (Bonus) Proactive Discord alert push when `check_alerts()` returns something new
- [ ] (Bonus) Top-view office layout visualization on the dashboard with glowing lights / animated fans
- [ ] Record the <=3 minute demo video
- [ ] Push everything to a public GitHub repo
