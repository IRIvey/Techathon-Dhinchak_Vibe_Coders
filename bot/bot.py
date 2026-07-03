"""
Discord bot -- reads from the same FastAPI backend the dashboard uses, so both
interfaces always reflect the same state.

Run with: python bot.py
"""

import os
import httpx
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # optional: used to humanize responses
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

ROOM_ALIASES = {
    "drawing": "drawing", "drawingroom": "drawing", "drawing-room": "drawing",
    "work1": "work1", "workroom1": "work1", "work-room-1": "work1",
    "work2": "work2", "workroom2": "work2", "work-room-2": "work2",
}

ROOM_LABELS = {
    "drawing": "Drawing Room",
    "work1": "Work Room 1",
    "work2": "Work Room 2",
}

intents = discord.Intents.default()
intents.message_content = True  # must also be enabled in the Discord Developer Portal
bot = commands.Bot(command_prefix="!", intents=intents)


async def humanize(raw_summary: str) -> str:
    """
    Optionally rewrites a raw data summary into a friendlier sentence using
    Groq. Falls back to the raw summary if no API key is set or the call fails.
    """
    if not GROQ_API_KEY:
        return raw_summary
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": (
                            "Rewrite the given office-device status as one short, "
                            "friendly sentence or two. Keep every number and fact "
                            "exactly as given. No preamble."
                        )},
                        {"role": "user", "content": raw_summary},
                    ],
                    "max_tokens": 150,
                },
            )
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return raw_summary


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")


@bot.command(name="status")
async def status(ctx):
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{BACKEND_URL}/devices")
        devices = resp.json()

    lines = []
    for room, label in ROOM_LABELS.items():
        room_devices = [d for d in devices if d["room"] == room]
        fans_on = sum(1 for d in room_devices if d["type"] == "fan" and d["status"])
        lights_on = sum(1 for d in room_devices if d["type"] == "light" and d["status"])
        if fans_on == 0 and lights_on == 0:
            lines.append(f"{label}: all off.")
        else:
            lines.append(f"{label}: {fans_on} fan(s) ON, {lights_on} light(s) ON.")

    raw = " ".join(lines)
    await ctx.send(await humanize(raw))


@bot.command(name="room")
async def room(ctx, room_name: str = None):
    if room_name is None:
        await ctx.send("Usage: `!room <drawing|work1|work2>`")
        return

    key = ROOM_ALIASES.get(room_name.lower().replace(" ", ""))
    if key is None:
        await ctx.send(f"Unknown room '{room_name}'. Try: drawing, work1, work2.")
        return

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{BACKEND_URL}/devices/{key}")
        room_devices = resp.json()

    on_devices = [d["name"] for d in room_devices if d["status"]]
    off_devices = [d["name"] for d in room_devices if not d["status"]]
    raw = (f"{ROOM_LABELS[key]}: ON -> {', '.join(on_devices) or 'none'}. "
           f"OFF -> {', '.join(off_devices) or 'none'}.")
    await ctx.send(await humanize(raw))


@bot.command(name="usage")
async def usage(ctx):
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{BACKEND_URL}/usage")
        data = resp.json()

    raw = (f"Total power right now: {data['total_power_watts']}W. "
           f"Today's estimated usage: {data['estimated_kwh_today']} kWh.")
    await ctx.send(await humanize(raw))


if __name__ == "__main__":
    if not DISCORD_BOT_TOKEN:
        raise SystemExit("DISCORD_BOT_TOKEN is not set. Check your .env file.")
    bot.run(DISCORD_BOT_TOKEN)
