require("dotenv").config();
const fs = require("fs");
const twilio = require("twilio");

const DATA_FILE = "./birds.json";
const SENT_FILE = "./sent.json";
const LIVE_API = "https://aves.ninjas.cl/api/birds";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

function loadSent() {
  if (!fs.existsSync(SENT_FILE)) return [];
  return JSON.parse(fs.readFileSync(SENT_FILE, "utf8"));
}

function saveSent(sent) {
  fs.writeFileSync(SENT_FILE, JSON.stringify(sent, null, 2));
}

function pickBird(birds, sentIds) {
  const remaining = birds.filter((b) => !sentIds.includes(b.id));
  if (remaining.length === 0) {
    console.log("Ciclo completo. Reiniciando...");
    saveSent([]);
    return birds[Math.floor(Math.random() * birds.length)];
  }
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function formatMessage(bird) {
  const spanish = bird.names.spanish;
  const latin = bird.names.latin;
  const fact =
    bird.didyouknow.length > 1000
      ? bird.didyouknow.slice(0, 1000) + "..."
      : bird.didyouknow;
  const geo = bird.info?.geo?.value ?? "";
  const iucn = bird.info?.iucn?.value ?? "";
  let msg = `🐦 *Ave del Día*\n\n`;
  msg += `*${spanish}*\n`;
  msg += `_${latin}_\n\n`;
  msg += `💡 ¿Sabías que?\n${fact}\n`;
  if (geo) msg += `\n📍 ${geo}`;
  if (iucn) msg += `\n🌿 Conservación: ${iucn}`;
  return msg;
}

async function fetchLiveImageUrl(uid) {
  const res = await fetch(`${LIVE_API}/${uid}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.images?.full ?? data?.images?.main ?? null;
}

async function sendBird() {
  const birds = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")).filter(
    (b) => b.didyouknow && b.uid,
  );
  const sentIds = loadSent();
  const bird = pickBird(birds, sentIds);
  const body = formatMessage(bird);
  const imageUrl = await fetchLiveImageUrl(bird.uid);

  const recipients = process.env.RECIPIENT_NUMBERS.split(",");

  for (const number of recipients) {
    if (imageUrl) {
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${number.trim()}`,
        mediaUrl: [imageUrl],
      });
    }
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${number.trim()}`,
      body,
    });
  }

  sentIds.push(bird.id);
  saveSent(sentIds);

  const imgStatus = imageUrl ? "✓ con imagen" : "sin imagen (API no respondió)";
  console.log(
    `Enviado: ${bird.names.spanish} (${bird.id}) — ${imgStatus} — ${sentIds.length}/${birds.length} aves enviadas`,
  );
}

sendBird().catch((err) => {
  console.error("Error al enviar el ave del día:", err.message);
  process.exit(1);
});
