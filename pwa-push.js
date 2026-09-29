const pushBtn = document.getElementById("pwaPushTest");
const pushStatus = document.getElementById("pwaNotifyStatus");

pushBtn?.addEventListener("click", async () => {
  try {
    const base = localStorage.getItem("pwa_push_api_base");
    const apiBase = base || window.prompt("Push 서버 주소를 입력하세요.");
    if (!apiBase) return;
    localStorage.setItem("pwa_push_api_base", apiBase.replace(/\/$/, ""));

    if (!("serviceWorker" in navigator) || !("PushManager" in window))
      throw Error("이 브라우저는 Web Push를 지원하지 않습니다.");

    const permission = Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
    if (permission !== "granted") throw Error("알림 권한이 허용되지 않았습니다.");

    const reg = await navigator.serviceWorker.ready;
    const cfg = await (await fetch(apiBase.replace(/\/$/, "") + "/api/config")).json();
    if (!cfg.publicKey) throw Error(cfg.error || "VAPID 공개키를 받지 못했습니다.");

    const pad = "=".repeat((4 - cfg.publicKey.length % 4) % 4);
    const raw = atob((cfg.publicKey + pad).replace(/-/g, "+").replace(/_/g, "/"));
    const key = Uint8Array.from([...raw].map(c => c.charCodeAt(0)));

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key
    });

    const response = await fetch(apiBase.replace(/\/$/, "") + "/api/send-push", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        subscription,
        title: "💊 약먹기 Push 테스트",
        body: "iPhone Web Push가 정상적으로 도착했습니다."
      })
    });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || "Push 전송 실패");

    pushStatus.textContent = "✓ 실제 Push 전송 완료 — iPhone 알림을 확인하세요.";
  } catch (e) {
    pushStatus.textContent = "❌ 실제 Push 테스트 실패: " + e.message;
  }
});
