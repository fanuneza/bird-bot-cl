# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project does

A Node.js script that sends a daily "Bird of the Day" WhatsApp message about Chilean birds. It picks a random bird from `birds.json`, fetches a live image from the NinjasCL API, and sends both image and formatted text via Twilio to one or more recipients. It tracks sent birds in `sent.json` to avoid repeats, cycling through all birds before repeating.

## Running the bot

```bash
node index.js
```

No build step. Requires a `.env` file — copy `.env.example` and fill in credentials.

## Environment variables

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | Sender WhatsApp number (Twilio sandbox or approved number) |
| `RECIPIENT_NUMBERS` | Comma-separated list of recipient phone numbers |

## Key files

- `index.js` — entire bot logic (single file)
- `birds.json` — full dataset of Chilean birds (from [NinjasCL/chileanbirds-dataset](https://github.com/NinjasCL/chileanbirds-dataset)); only birds with `didyouknow` and `uid` fields are used
- `sent.json` — auto-generated at runtime; tracks IDs of already-sent birds; delete or clear to reset the cycle. Path is controlled by `RAILWAY_VOLUME_PATH` env var (set automatically when a Railway Volume is mounted), falling back to the project root
- `LIVE_API` (`https://aves.ninjas.cl/api/birds`) — queried at send time to get the full-resolution image URL for each bird

## Architecture

Single-file, top-to-bottom script. No server, no scheduler — meant to be invoked externally (e.g., cron job, GitHub Actions workflow) on whatever schedule is desired. The send flow is:

1. Load `birds.json`, filter to usable birds
2. Load `sent.json` to get already-sent IDs
3. Pick a random unsent bird; if all sent, reset `sent.json` and pick randomly
4. Fetch live image URL from the NinjasCL API using `bird.uid`
5. Send image message + text message to each recipient via Twilio WhatsApp API
6. Append bird ID to `sent.json`
