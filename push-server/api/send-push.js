const webpush = require("web-push");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({error:"POST only"});

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT)
    return res.status(500).json({error:"VAPID environment variables are not configured"});

  try {
    const { subscription, title, body } = req.body || {};
    if (!subscription || !subscription.endpoint) return res.status(400).json({error:"subscription is required"});
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    await webpush.sendNotification(subscription, JSON.stringify({
      title: title || "한-베 달력",
      body: body || "Web Push 테스트",
      tag: "holiday-calendar-push-test"
    }));
    return res.status(200).json({ok:true});
  } catch (e) {
    return res.status(500).json({error:e.message});
  }
};
