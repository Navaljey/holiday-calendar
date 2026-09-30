const pushBtn = document.getElementById("pwaPushTest");
const pushStatus = document.getElementById("pwaNotifyStatus");

const addCopyButton = () => {
  if (document.getElementById("pwaPushCopy")) return;
  const host = pushBtn?.parentElement;
  if (!host) return;
  const copyBtn = document.createElement("button");
  copyBtn.id = "pwaPushCopy";
  copyBtn.type = "button";
  copyBtn.textContent = "📋 Push 구독정보 복사";
  copyBtn.style.cssText = "width:100%;margin-top:6px;background:#475569;color:white;padding:8px;border-radius:10px;font-size:12px;font-weight:700;";
  host.appendChild(copyBtn);

  copyBtn.addEventListener("click", async () => {
    try {
      const { subscription } = await getPushSubscription();
      const text = JSON.stringify(subscription.toJSON());
      localStorage.setItem("pwa_push_subscription", text);
      await navigator.clipboard.writeText(text);
      pushStatus.textContent = "✓ Push 구독 정보를 복사했습니다. PC의 push-test.html에 붙여넣으세요.";
    } catch (e) {
      pushStatus.textContent = "❌ 구독 정보 복사 실패: " + e.message;
    }
  });
};

const getPushSubscription = async () => {
  const base = localStorage.getItem("pwa_push_api_base") || window.prompt("Push 서버 주소를 입력하세요.");
  if (!base) throw Error("Push 서버 주소가 필요합니다.");
  localStorage.setItem("pwa_push_api_base", base.replace(/\/$/, ""));
  const apiBase = base.replace(/\/$/, "");
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    throw Error("이 기능은 Safari의 일반 웹페이지가 아니라 홈 화면에 추가한 PWA에서 실행해야 합니다.");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw Error("알림 권한이 허용되지 않았습니다.");
  const reg = await navigator.serviceWorker.ready;
  const cfg = await (await fetch(apiBase + "/api/config", {cache:"no-store"})).json();
  if (!cfg.publicKey) throw Error(cfg.error || "VAPID 공개키를 받지 못했습니다.");
  const pad = "=".repeat((4 - cfg.publicKey.length % 4) % 4);
  const raw = atob((cfg.publicKey + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const key = Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  }
  return { apiBase, subscription };
};

pushBtn?.addEventListener("click", async () => {
  try {
    const { apiBase, subscription } = await getPushSubscription();
    const response = await fetch(apiBase + "/api/send-push", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ subscription, title: "💊 약먹기 Push 테스트", body: "iPhone Web Push가 정상적으로 도착했습니다." })
    });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || "Push 전송 실패");
    localStorage.setItem("pwa_push_subscription", JSON.stringify(subscription.toJSON()));
    pushStatus.textContent = "✓ 실제 Push 전송 완료 — iPhone 알림을 확인하세요.";
  } catch (e) {
    pushStatus.textContent = "❌ 실제 Push 테스트 실패: " + e.message;
  }
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addCopyButton);
else addCopyButton();
