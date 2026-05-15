"use client";

import { useEffect, useState } from "react";

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 설치됐는지 확인
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // iOS 감지
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    if (ios) {
      const dismissed = localStorage.getItem("ios-install-dismissed");
      if (!dismissed) setShowBanner(true);
      return;
    }

    // Android/Chrome PWA 설치 이벤트
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(
      isIOS ? "ios-install-dismissed" : "pwa-install-dismissed",
      "1"
    );
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 flex items-center gap-3 shadow-lg">
      <span className="text-2xl">📱</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">앱으로 설치하기</p>
        {isIOS ? (
          <p className="text-xs text-blue-100">
            Safari 하단 <strong>공유버튼(□↑)</strong> → <strong>홈 화면에 추가</strong>
          </p>
        ) : (
          <p className="text-xs text-blue-100">홈 화면에 추가하면 앱처럼 사용할 수 있습니다</p>
        )}
      </div>
      {!isIOS && (
        <button onClick={handleInstall}
          className="bg-white text-blue-600 text-sm font-bold px-3 py-1.5 rounded-lg shrink-0">
          설치
        </button>
      )}
      <button onClick={handleDismiss} className="text-blue-200 text-xl leading-none shrink-0">×</button>
    </div>
  );
}
