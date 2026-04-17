Simple WhatsApp bot with daily facts about Chilean birds based on [NinjasCL/chileanbirds-dataset](https://github.com/NinjasCL/chileanbirds-dataset).

# 🐦 Ave del Día

A daily WhatsApp bot that sends a Chilean bird fact every morning at 9:00 AM Santiago time.

Each day, one bird is picked from a dataset of 216 Chilean species and delivered as a photo, its name, scientific name, a fun fact, geographic range, and conservation status.

## How it works

- Picks a random bird from `birds.json` that hasn't been sent yet
- Fetches a live photo from [aves.ninjas.cl](https://aves.ninjas.cl)
- Sends two WhatsApp messages via Twilio: the photo, then the text card
- Tracks sent birds in `sent.json` to avoid repeats — resets automatically once all 180 eligible birds have been sent
- Supports multiple recipients via a comma-separated list in `.env`

## Stack

- **Node.js** — runtime
- **Twilio** — WhatsApp delivery
- **Railway** — hosting and cron scheduling (daily at 13:00 UTC / 9:00 AM Santiago)

## Project structure

```
bird-bot-cl/
├── index.js          # main script
├── birds.json        # dataset (see credits below)
├── sent.json         # auto-generated, tracks sent bird IDs
├── .env              # secrets, never committed
├── .env.bak          # env variable reference (no real values)
├── .gitignore
├── railway.toml      # cron config for Railway
└── package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.bak` to `.env` and fill in your real values:
```bash
cp .env.bak .env
```

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155558888
RECIPIENT_NUMBERS=+56912345678,+56987654321
```

### 3. Twilio WhatsApp sandbox opt-in
Each recipient must send the following to the Twilio sandbox number (one time only):
```
join <your-sandbox-word>
```

### 4. Run locally
```bash
node index.js
```

## Deployment on Railway

1. Push this repo to GitHub (keep it private)
2. Create a new project on [railway.app](https://railway.app) and connect the repo
3. Add all environment variables from `.env` in Railway's dashboard under **Variables**
4. Add a **Volume** mounted at `/app` so `sent.json` persists across deploys
5. Railway reads `railway.toml` and runs the cron automatically

> The cron runs at `0 13 * * *` (13:00 UTC), which equals 9:00 AM Santiago time in winter (UTC-4).

## Credits

Bird data from [NinjasCL/chileanbirds-dataset](https://github.com/NinjasCL/chileanbirds-dataset), originally extracted from [buscaves.cl](http://www.buscaves.cl). Licensed under MIT.

Live bird images served by [aves.ninjas.cl](https://aves.ninjas.cl).