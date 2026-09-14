/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ScannerView } from "./components/ScannerView";
import { PowerBIDashboard } from "./components/PowerBIDashboard";
import { ReviewQueueView } from "./components/ReviewQueueView";
import { DatabaseExplorerView } from "./components/DatabaseExplorerView";
import { ComplianceAuditView } from "./components/ComplianceAuditView";
import { OfflineBanner } from "./components/OfflineBanner";
import { BottomNavigation } from "./components/BottomNavigation";
import { GetStartedModal } from "./components/GetStartedModal";
import { LoginScreen, UserProfile } from "./components/LoginScreen";
import { PlanGateOverlay } from "./components/PlanGateOverlay";
import { PricingModal } from "./components/PricingModal";
import { AdminUsageModal } from "./components/AdminUsageModal";
import { DashboardMetrics, UserRole, SubscriptionTier, PLAN_CONFIGS } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"scan" | "dashboard" | "review" | "database" | "audit">("scan");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [userRole, setUserRole] = useState<UserRole>("ADMIN");
  const [isAdminUsageOpen, setIsAdminUsageOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("docuscan_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      name: "Noor Khan",
      email: "noorkhan19194@gmail.com",
      role: "ADMIN",
      department: "dept-asset",
    };
  });

  const [userTier, setUserTier] = useState<SubscriptionTier>(() => {
    const saved = localStorage.getItem("verixa_subscription_tier");
    if (saved && (saved === "FREE" || saved === "PLUS" || saved === "PRO" || saved === "ULTRA")) {
      return saved as SubscriptionTier;
    }
    return "FREE";
  });

  const [scansUsed, setScansUsed] = useState<number>(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem("verixa_quota_date");
      if (savedDate !== today) {
        localStorage.setItem("verixa_quota_date", today);
        localStorage.setItem("verixa_scans_used", "0");
        return 0;
      }
      const saved = localStorage.getItem("verixa_scans_used");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [pricingSuggestedTier, setPricingSuggestedTier] = useState<SubscriptionTier | undefined>(undefined);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("docuscan_dark_mode");
    if (saved !== null) {
      return saved === "true";
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState<boolean>(false);
  const [scanInitialMode, setScanInitialMode] = useState<"camera" | "upload" | "presets">("presets");

  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("docuscan_offline_queue");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Sync dark mode class and color-scheme with root html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    try {
      localStorage.setItem("docuscan_dark_mode", String(isDarkMode));
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Sync user role with currentUser
  useEffect(() => {
    if (currentUser?.role) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // Persist offline queue
  useEffect(() => {
    try {
      localStorage.setItem("docuscan_offline_queue", JSON.stringify(offlineQueue));
    } catch (e) {
      console.error("Failed to save offline queue to localStorage", e);
    }
  }, [offlineQueue]);

  // Persist tier and scansUsed in localStorage
  useEffect(() => {
    try {
      localStorage.setItem("verixa_subscription_tier", userTier);
    } catch {
      // ignore
    }
  }, [userTier]);

  useEffect(() => {
    try {
      localStorage.setItem("verixa_scans_used", String(scansUsed));
    } catch {
      // ignore
    }
  }, [scansUsed]);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setUserTier(tier);
  };

  const handleOpenPricing = (suggestedTier?: SubscriptionTier) => {
    setPricingSuggestedTier(suggestedTier);
    setIsPricingOpen(true);
  };

  // Fetch Dashboard Metrics
  const fetchMetrics = async () => {
    if (isOffline) return;
    try {
      const deptParam = selectedDepartment === "ALL" ? "ALL" : selectedDepartment;
      const res = await fetch(`/api/metrics?department=${deptParam}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Poll metrics every 10s
    return () => clearInterval(interval);
  }, [selectedDepartment, isOffline]);

  // Handle queueing offline scan
  const handleQueueOffline = (doc: any) => {
    setOfflineQueue((prev) => [...prev, { ...doc, queuedAt: new Date().toISOString() }]);
  };

  // Sync offline queue when coming back online
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || isOffline) return;
    setIsSyncing(true);
    let successfulSyncs = 0;

    for (const doc of offlineQueue) {
      try {
        const res = await fetch("/api/documents/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document: doc,
            userEmail: "offline.operator@corp.internal",
            role: userRole,
          }),
        });
        if (res.ok) {
          successfulSyncs++;
        }
      } catch (err) {
        console.error("Error syncing item:", err);
      }
    }

    if (successfulSyncs > 0) {
      setOfflineQueue((prev) => prev.slice(successfulSyncs));
      await fetchMetrics();
    }
    setIsSyncing(false);
  };

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      handleSyncOfflineQueue();
    };
    const handleOfflineEvent = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOfflineEvent);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOfflineEvent);
    };
  }, [offlineQueue]);

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={(profile) => {
          setCurrentUser(profile);
          setUserRole(profile.role);
          try {
            localStorage.setItem("docuscan_user", JSON.stringify(profile));
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans antialiased">
      {/* Offline Alert Banner */}
      <OfflineBanner
        isOffline={isOffline}
        offlineQueueCount={offlineQueue.length}
        onSyncOfflineQueue={handleSyncOfflineQueue}
        isSyncing={isSyncing}
        onToggleOffline={() => setIsOffline(!isOffline)}
      />

      {/* Portfolio / Public Demo Notice (Section 9) */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 max-w-4xl">
            <span className="font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded text-[11px] shrink-0">
              Portfolio / Public Demo
            </span>
            <span className="text-slate-300 text-[11px] sm:text-xs">
              Please do not upload confidential, personal, medical, financial, government, or otherwise sensitive documents. Use sample or non-sensitive files for testing.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
            <span>
              Pages processed: <strong className="text-white">{scansUsed} / 50</strong> •{" "}
              <span className="text-emerald-400 font-semibold">{Math.max(0, 50 - scansUsed)} remaining</span>
            </span>
            <button
              onClick={() => setIsAdminUsageOpen(true)}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              System Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* Global Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        userRole={userRole}
        setUserRole={setUserRole}
        userProfile={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          try {
            localStorage.removeItem("docuscan_user");
          } catch {
            // ignore
          }
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        pendingReviewCount={metrics?.needs_review || 0}
        activeAlertsCount={metrics?.active_alerts?.length || 0}
        offlineQueueCount={offlineQueue.length}
        onOpenGetStarted={() => setIsGetStartedOpen(true)}
        currentTier={userTier}
        scansUsed={scansUsed}
        onOpenPricing={handleOpenPricing}
      />

      {/* Main Content Area - Full End-to-End Pipeline Unlocked for All Users (Section 13) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {currentTab === "scan" && (
          <ScannerView
            onScanSuccess={() => {
              fetchMetrics();
            }}
            onQueueOffline={handleQueueOffline}
            isOffline={isOffline}
            selectedDepartment={selectedDepartment}
            userRole={userRole}
            initialMode={scanInitialMode}
            onOpenGetStarted={() => setIsGetStartedOpen(true)}
            currentTier={userTier}
            scansUsed={scansUsed}
            onIncrementScanCount={() => setScansUsed((c) => c + 1)}
            onOpenPricing={handleOpenPricing}
          />
        )}

        {/* Business Intelligence & Interactive Analytics */}
        {currentTab === "dashboard" && (
          <PowerBIDashboard
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            metrics={metrics}
            onRefresh={fetchMetrics}
            onBack={() => setCurrentTab("scan")}
          />
        )}

        {/* Python Cleaning & Review Pipeline */}
        {currentTab === "review" && (
          <ReviewQueueView
            userRole={userRole}
            selectedDepartment={selectedDepartment}
            onRefreshMetrics={fetchMetrics}
            onBack={() => setCurrentTab("scan")}
          />
        )}

        {/* ACID SQL Database Explorer */}
        {currentTab === "database" && (
          <DatabaseExplorerView
            userRole={userRole}
            onBack={() => setCurrentTab("scan")}
          />
        )}

        {/* Cryptographic SHA-256 Audit Trail */}
        {currentTab === "audit" && (
          <ComplianceAuditView
            userRole={userRole}
            onBack={() => setCurrentTab("scan")}
          />
        )}
      </main>

      {/* Persistent Enterprise Bottom Navigation Bar */}
      <BottomNavigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingReviewCount={metrics?.needs_review || 0}
        activeAlertsCount={metrics?.active_alerts?.length || 0}
        currentTier={userTier}
        onTriggerScanMode={(mode) => {
          setScanInitialMode(mode);
          setCurrentTab("scan");
        }}
      />

      {/* Get Started Guide Modal */}
      <GetStartedModal
        isOpen={isGetStartedOpen}
        onClose={() => setIsGetStartedOpen(false)}
        onStartScanning={() => {
          setIsGetStartedOpen(false);
          setScanInitialMode("presets");
          setCurrentTab("scan");
        }}
      />

      {/* Subscription Pricing Roadmap Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentTier={userTier}
        onSelectTier={handleSelectPlan}
        onSelectPlan={handleSelectPlan}
        scansUsed={scansUsed}
        suggestedTier={pricingSuggestedTier}
        initialSelectedTier={pricingSuggestedTier}
        onResetUsage={() => setScansUsed(0)}
      />

      {/* Admin Usage & Operational Cost Telemetry */}
      <AdminUsageModal
        isOpen={isAdminUsageOpen}
        onClose={() => setIsAdminUsageOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-4 pb-20 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Verixa Intelligent Data Processing Platform
            </span>
            <span>•</span>
            <span>Python 3.x Cleaning Engine</span>
            <span>•</span>
            <span>SQLite Relational Storage</span>
            <span>•</span>
            <span>Interactive Business Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <span>SHA-256 Audit Trail</span>
            <span>•</span>
            <button
              onClick={() => setIsAdminUsageOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Owner Telemetry
            </button>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All Services Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
