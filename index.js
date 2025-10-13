const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();

const PAGE_ACCESS_TOKEN = "EAFY1TDcrAUsBPupllORIDjgZAvEFhZBdkBgVZB1oJg9o61ZAgNZBeiP4ktnH7YdqZCRQM7iMjnqUPctAzIGT2R0ZBL1oeDGd4Lh8mnQ6VZAqcYCy4Iedtsf5ZAhZAZBqZAL7gkZBWoZBVe1x2fMdhJWZAkhXeCm76K6DD7zmNFjzw2TyRk3aG6MggN1ZCDkYUMVCafa8SzWsXwMpNQZDZD";
const VERIFY_TOKEN = "MYBOT";

app.use(bodyParser.json());

// Verify webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Handle incoming messages
app.post("/webhook", (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message) handleMessage(senderPsid, webhookEvent.message);
    });
    res.status(200).send("EVENT_RECEIVED");
  } else res.sendStatus(404);
});

// Send reply
function handleMessage(senderPsid, receivedMessage) {
  let response;
  if (receivedMessage.text) {
    response = { text: `Hello! You said: "${receivedMessage.text}" 😊` };
  }
  callSendAPI(senderPsid, response);
}

// Send to Facebook API
function callSendAPI(senderPsid, response) {
  const requestBody = { recipient: { id: senderPsid }, message: response };
  request(
    {
      uri: "https://graph.facebook.com/v17.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err) => {
      if (err) console.error("❌ Error sending message:", err);
      else console.log("✅ Message sent!");
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook running on port ${PORT}`));
