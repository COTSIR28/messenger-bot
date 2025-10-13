// index.js

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express().use(bodyParser.json());

// ✅ VERIFY WEBHOOK
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "your_verify_token_here";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ HANDLE INCOMING MESSAGES
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(function (entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ✅ Handle normal messages
function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    response = { text: `You said: "${receivedMessage.text}" 😊` };
  }

  callSendAPI(senderPsid, response);
}

// ✅ Handle postbacks (buttons/menu)
function handlePostback(senderPsid, receivedPostback) {
  const payload = receivedPostback.payload;
  let response;

  if (payload === "GET_STARTED_PAYLOAD") {
    response = {
      text: "👋 Hi there! I’m your SmartSheets virtual assistant. Choose an option below to get started.",
    };
  } else if (payload === "PRODUCTS_PAYLOAD") {
    response = {
      text: "🛍️ Our Products:\n• Product 1\n• Product 2\n• Product 3",
    };
  } else if (payload === "FAQS_PAYLOAD") {
    response = {
      text: "❓ FAQs:\n1. How to order?\n2. How to pay?\n3. Delivery time?",
    };
  } else if (payload === "CONTACT_PAYLOAD") {
    response = {
      text: "📞 Contact Us:\nEmail: support@smartsheets.com\nPhone: 0917-123-4567",
    };
  }

  callSendAPI(senderPsid, response);
}

// ✅ Send message through Facebook API
function callSendAPI(senderPsid, response) {
  const PAGE_ACCESS_TOKEN = "EAFY1TDcrAUsBPupllORIDjgZAvEFhZBdkBgVZB1oJg9o61ZAgNZBeiP4ktnH7YdqZCRQM7iMjnqUPctAzIGT2R0ZBL1oeDGd4Lh8mnQ6VZAqcYCy4Iedtsf5ZAhZAZBqZAL7gkZBWoZBVe1x2fMdhJWZAkhXeCm76K6DD7zmNFjzw2TyRk3aG6MggN1ZCDkYUMVCafa8SzWsXwMpNQZDZD";

  const requestBody = {
    recipient: { id: senderPsid },
    message: response,
  };

  fetch(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .then((json) => console.log("Message sent:", json))
    .catch((err) => console.error("Unable to send message:", err));
}

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
