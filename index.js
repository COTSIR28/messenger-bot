// index.js
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "EAFY1TDcrAUsBPur9mnqBTraL5FMP7f6bZAEAYpkaZAOZBugqbkuNWbj1vJhV0FVsbJcVmMcvb96D5gYNCJRLZANIab7vAZBbNWj4GeG8smhWLIUg0zUmrHJZAf41UccjKJJY7srddw2BZBqK4BOUXRq3yIBSIHvcZAAMJO32dKAX8InWu6lZBmmuS1rvUNsB8iX6NTgDE3hqTVRPQk13nMOEXo79aTuJK9OX1ZBjLoHjXHeIkz"; // ⚠️ replace with your actual Page Access Token

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Smartsheets Messenger Bot is running!");
});

// ✅ Facebook Webhook Verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "mybot"; // ⚠️ replace with your verify token

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Handle incoming messages & postbacks
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(function (entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      // Handle postbacks (buttons)
      if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback.payload);
      } else if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ✅ Handle user messages
function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    // Simple fallback message
    response = {
      text: "Thanks for messaging Smartsheets! 👋\nYou can type 'menu' anytime to see options again.",
    };
  }

  callSendAPI(senderPsid, response);
}

// ✅ Handle button postbacks
function handlePostback(senderPsid, payload) {
  if (payload === "GET_STARTED_PAYLOAD") {
    sendWelcomeMessage(senderPsid);
  } else if (payload === "PRODUCTS_PAYLOAD") {
    callSendAPI(senderPsid, { text: "🛍️ Here are our products: ..." });
  } else if (payload === "FAQS_PAYLOAD") {
    callSendAPI(senderPsid, { text: "❓ FAQs: ..." });
  } else if (payload === "CONTACT_PAYLOAD") {
    callSendAPI(senderPsid, { text: "📞 You can contact us at smartsheets@email.com" });
  }
}

// ✅ Send welcome message when Get Started is clicked
function sendWelcomeMessage(senderPsid) {
  const response = {
    text: "👋 Welcome to Smartsheets! How can I help you today?",
    quick_replies: [
      {
        content_type: "text",
        title: "🛍️ Products",
        payload: "PRODUCTS_PAYLOAD",
      },
      {
        content_type: "text",
        title: "❓ FAQs",
        payload: "FAQS_PAYLOAD",
      },
      {
        content_type: "text",
        title: "📞 Contact Us",
        payload: "CONTACT_PAYLOAD",
      },
    ],
  };

  callSendAPI(senderPsid, response);
}

// ✅ Helper function to send messages
function callSendAPI(senderPsid, response) {
  const requestBody = {
    recipient: { id: senderPsid },
    message: response,
  };

  request(
    {
      uri: "https://graph.facebook.com/v17.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, res, body) => {
      if (!err) {
        console.log("✅ Message sent!");
      } else {
        console.error("❌ Unable to send message:" + err);
      }
    }
  );
}

app.listen(3000, () => console.log("🚀 Webhook is running on port 3000"));
