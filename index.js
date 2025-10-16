// index.js
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express().use(bodyParser.json());

// ===== CONFIG =====
const VERIFY_TOKEN = "mybot"; // palitan mo ito
const PAGE_ACCESS_TOKEN = "EAFY1TDcrAUsBPupllORIDjgZAvEFhZBdkBgVZB1oJg9o61ZAgNZBeiP4ktnH7YdqZCRQM7iMjnqUPctAzIGT2R0ZBL1oeDGd4Lh8mnQ6VZAqcYCy4Iedtsf5ZAhZAZBqZAL7gkZBWoZBVe1x2fMdhJWZAkhXeCm76K6DD7zmNFjzw2TyRk3aG6MggN1ZCDkYUMVCafa8SzWsXwMpNQZDZD"; // ilagay mo dito ang Page Access Token mo

// ===== VERIFY WEBHOOK =====
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ===== RECEIVE MESSAGES =====
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      console.log("📩 Event received:", webhookEvent);

      if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      } else if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ===== HANDLE MESSAGE =====
function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    const text = receivedMessage.text.toLowerCase();

    if (text.includes("products")) {
      response = { text: "🛍️ We offer various products! (You can list them here.)" };
    } else if (text.includes("faqs")) {
      response = { text: "❓ Here are some frequently asked questions..." };
    } else if (text.includes("contact")) {
      response = { text: "📞 You can reach us at: example@email.com or 0912-345-6789." };
    } else {
      response = { text: `You said: "${receivedMessage.text}" 😄` };
    }
  }

  callSendAPI(senderPsid, response);
}

// ===== HANDLE POSTBACK =====
function handlePostback(senderPsid, postback) {
  const payload = postback.payload;
  console.log("🎯 Triggered postback payload:", payload);

  if (payload === "GET_STARTED_PAYLOAD") {
    // Welcome message
    const welcome = { text: "👋 Hello! Welcome to our chatbot!" };
    callSendAPI(senderPsid, welcome);

    // Send buttons after welcome
    sendMainMenu(senderPsid);
  } else if (payload === "PRODUCTS_PAYLOAD") {
    callSendAPI(senderPsid, { text: "🛍️ Our products are listed here!" });
  } else if (payload === "FAQS_PAYLOAD") {
    callSendAPI(senderPsid, { text: "❓ Frequently Asked Questions:" });
  } else if (payload === "CONTACT_PAYLOAD") {
    callSendAPI(senderPsid, { text: "📞 Contact us at example@email.com" });
  }
}

// ===== SEND MAIN MENU BUTTONS =====
function sendMainMenu(senderPsid) {
  const response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "What would you like to do next?",
        buttons: [
          {
            type: "postback",
            title: "🛍️ Products",
            payload: "PRODUCTS_PAYLOAD"
          },
          {
            type: "postback",
            title: "❓ FAQs",
            payload: "FAQS_PAYLOAD"
          },
          {
            type: "postback",
            title: "📞 Contact",
            payload: "CONTACT_PAYLOAD"
          }
        ]
      }
    }
  };

  callSendAPI(senderPsid, response);
}

// ===== SEND MESSAGE =====
function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: { id: senderPsid },
    message: response
  };

  request({
    uri: "https://graph.facebook.com/v17.0/me/messages",
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: "POST",
    json: requestBody
  }, (err, res, body) => {
    if (!err) {
      console.log("✅ Message sent!");
    } else {
      console.error("❌ Unable to send message:", err);
    }
  });
}

// ===== SETUP GET STARTED BUTTON =====
function setupGetStarted() {
  request({
    uri: "https://graph.facebook.com/v17.0/me/messenger_profile",
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: "POST",
    json: {
      get_started: { payload: "GET_STARTED_PAYLOAD" },
      greeting: [
        {
          locale: "default",
          text: "Welcome to our chatbot! Click Get Started to begin. 🤖"
        }
      ]
    }
  }, (err, res, body) => {
    if (!err) {
      console.log("✅ 'Get Started' button set successfully!");
    } else {
      console.error("❌ Error setting 'Get Started':", err);
    }
  });
}

// ===== START SERVER =====
app.listen(process.env.PORT || 1337, () => {
  console.log("🚀 Webhook server is running on port 1337");
  setupGetStarted(); // activate Get Started button on startup
});
