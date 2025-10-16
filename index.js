// index.js
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();
app.use(bodyParser.json());

// ⚠️ Replace with your actual Page Access Token
const PAGE_ACCESS_TOKEN = "EAFY1TDcrAUsBPur9mnqBTraL5FMP7f6bZAEAYpkaZAOZBugqbkuNWbj1vJhV0FVsbJcVmMcvb96D5gYNCJRLZANIab7vAZBbNWj4GeG8smhWLIUg0zUmrHJZAf41UccjKJJY7srddw2BZBqK4BOUXRq3yIBSIHvcZAAMJO32dKAX8InWu6lZBmmuS1rvUNsB8iX6NTgDE3hqTVRPQk13nMOEXo79aTuJK9OX1ZBjLoHjXHeIkz";

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Smartsheets Messenger Bot is running!");
});

// ✅ Facebook Webhook Verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "mybot"; // ⚠️ Replace with your own verify token
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

// ✅ Handle incoming webhook events
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(function (entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

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

// ✅ Handle text messages
function handleMessage(senderPsid, receivedMessage) {
  if (receivedMessage.text) {
    const response = {
      text: "Thanks for messaging Smartsheets! 👋\nYou can type 'menu' anytime to see options again.",
    };
    callSendAPI(senderPsid, response);
  }
}

// ✅ Handle postback buttons
function handlePostback(senderPsid, payload) {
  console.log("📩 Received postback payload:", payload);

  if (payload === "GET_STARTED_PAYLOAD") {
    console.log("🎯 Triggered GET_STARTED_PAYLOAD");
    sendWelcomeCarousel(senderPsid);
  } else if (payload === "PRODUCTS_PAYLOAD") {
    callSendAPI(senderPsid, { text: "🛍️ Here are our products: ..." });
  } else if (payload === "FAQS_PAYLOAD") {
    callSendAPI(senderPsid, { text: "❓ FAQs: ..." });
  } else if (payload === "CONTACT_PAYLOAD") {
    callSendAPI(senderPsid, { text: "📞 You can contact us at smartsheets@email.com" });
  }
}

// ✅ Send carousel (generic template) when Get Started is clicked
function sendWelcomeCarousel(senderPsid) {
  const messageData = {
    recipient: { id: senderPsid },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "🛍️ Our Products",
              subtitle: "Browse our latest products and offers!",
              image_url: "https://github.com/COTSIR28/messenger-bot/blob/main/assets/images/product1.jpg",
              buttons: [
                {
                  type: "postback",
                  title: "View Products",
                  payload: "PRODUCTS_PAYLOAD",
                },
              ],
            },
            {
              title: "❓ FAQs",
              subtitle: "Get answers to our most common questions.",
              image_url: "https://github.com/COTSIR28/messenger-bot/blob/main/assets/images/faqs.png",
              buttons: [
                {
                  type: "postback",
                  title: "View FAQs",
                  payload: "FAQS_PAYLOAD",
                },
              ],
            },
            {
              title: "📞 Contact Us",
              subtitle: "We’d love to hear from you!",
              image_url: "https://github.com/COTSIR28/messenger-bot/blob/main/assets/images/contact.png",
              buttons: [
                {
                  type: "postback",
                  title: "Contact Support",
                  payload: "CONTACT_PAYLOAD",
                },
              ],
            },
          ],
        },
      },
    },
  };

  request(
    {
      uri: "https://graph.facebook.com/v17.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData,
    },
    (err, res, body) => {
      if (!err) {
        console.log("✅ Carousel message sent!");
      } else {
        console.error("❌ Unable to send carousel:", err);
      }
    }
  );
}

// ✅ Helper function to send normal messages
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
        console.error("❌ Unable to send message:", err);
      }
    }
  );
}

// ✅ Serve privacy policy
app.get("/privacy", (req, res) => {
  res.sendFile(__dirname + "/privacy.html");
});

// ✅ Start Express server
app.listen(3000, () => console.log("🚀 Webhook is running on port 3000"));
