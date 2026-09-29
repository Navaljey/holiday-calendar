module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(500).json({error:"VAPID_PUBLIC_KEY is not configured"});
  return res.status(200).json({publicKey:key});
};
