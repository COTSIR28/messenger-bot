const request = require("request");

const PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN";

request({
  uri: "https://graph.facebook.com/v17.0/me/messenger_profile",
  qs: { access_token: PAGE_ACCESS_TOKEN },
  method: "POST",
  json: {
    get_started: {
      payload: "GET_STARTED_PAYLOAD"
    }
  }
}, (err, res, body) => {
  if (!err) {
    console.log("✅ 'Get Started' button set successfully!");
  } else {
    console.error("❌ Unable to set 'Get Started' button:", err);
  }
});
