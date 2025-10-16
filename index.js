const request = require("request");

const PAGE_ACCESS_TOKEN = "EAFY1TDcrAUsBPupllORIDjgZAvEFhZBdkBgVZB1oJg9o61ZAgNZBeiP4ktnH7YdqZCRQM7iMjnqUPctAzIGT2R0ZBL1oeDGd4Lh8mnQ6VZAqcYCy4Iedtsf5ZAhZAZBqZAL7gkZBWoZBVe1x2fMdhJWZAkhXeCm76K6DD7zmNFjzw2TyRk3aG6MggN1ZCDkYUMVCafa8SzWsXwMpNQZDZD";

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
