const webpush = require("web-push");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    return res.status(500).json({ error: "VAPID environment variables are not configured" });
  }

  try {
    const { subscription, title, body, delaySeconds = 5 } = req.body || {};
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "subscription is required" });
    }

    const delay = Math.min(Math.max(Number(delaySeconds) || 5, 1), 7);
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // This intentionally waits a few seconds so the user can close/lock the PWA
    // before the server sends the Web Push. No database is needed for this test.
    await new Promise(resolve => setTimeout(resolve, delay * 1000));

    await webpush.sendNotification(subscription, JSON.stringify({
      title: title || "💊 백그라운드 Push 테스트",
      body: body || "앱을 닫은 뒤 서버에서 Push를 보냈습니다.",
      tag: "holiday-calendar-delayed-push-test"
    }));

    return res.status(200).json({ ok: true, delaySeconds: delay });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports.config = { maxDuration: 10 };
