import React, { useState, useRef, useEffect } from "react";
import {
  Scan,
  BarChart3,
  ClipboardCheck,
  Database,
  ShieldCheck,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  AlertTriangle,
  Layers,
  ChevronDown,
  User,
  LogOut,
  Check,
  ShieldAlert,
  Lock,
  Sparkles,
  HelpCircle,
  Terminal,
  Zap
} from "lucide-react";
import { UserRole, DocumentRecord, SubscriptionTier, PLAN_CONFIGS } from "../types";
import { UserProfile } from "./LoginScreen";
import { DocumentSearchBar } from "./DocumentSearchBar";

interface NavbarProps {
  currentTab: "scan" | "dashboard" | "review" | "database" | "audit";
  setCurrentTab: (tab: "scan" | "dashboard" | "review" | "database" | "audit") => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  pendingReviewCount: number;
  activeAlertsCount: number;
  offlineQueueCount: number;
  onOpenGetStarted?: () => void;
  currentTier: SubscriptionTier;
  scansUsed: number;
  onOpenPricing: (suggestedTier?: SubscriptionTier) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedDepartment,
  setSelectedDepartment,
  userRole,
  setUserRole,
  userProfile,
  onLogout,
  isDarkMode,
  setIsDarkMode,
  isOffline,
  setIsOffline,
  pendingReviewCount,
  activeAlertsCount,
  offlineQueueCount,
  onOpenGetStarted,
  currentTier,
  scansUsed,
  onOpenPricing,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const departments = [
    { id: "ALL", name: "All Departments" },
    { id: "dept-asset", name: "Asset Management" },
    { id: "dept-logistics", name: "Logistics & Supply" },
    { id: "dept-finance", name: "Finance & Invoicing" },
    { id: "dept-procurement", name: "Procurement & POs" },
    { id: "dept-healthcare", name: "Healthcare & Medical" },
    { id: "dept-hr", name: "Human Resources" },
  ];

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & System Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Verixa
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Hindi • Marathi • Multilingual
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                Intelligent Data Processing &amp; Business Intelligence Platform
              </p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <DocumentSearchBar
              selectedDepartment={selectedDepartment}
              onSelectDocument={() => {
                // If user clicks a document in search, they can view details or switch to database
                setCurrentTab("database");
              }}
            />
          </div>

          {/* Department Slicer */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
              <Layers className="w-3.5 h-3.5 mr-1" />
              Dept:
            </div>
            <div className="relative">
              <select
                id="department-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Right Utilities (Get Started, Offline, Theme, Profile Icon) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Get Started Button */}
            {onOpenGetStarted && (
              <button
                id="nav-get-started-button"
                onClick={onOpenGetStarted}
                title="View Multilingual OCR & Python Pipeline Guide"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Get Started</span>
              </button>
            )}
            
            {/* Offline Simulation Toggle */}
            <button
              id="offline-toggle-button"
              onClick={() => setIsOffline(!isOffline)}
              title={isOffline ? "Currently Simulated Offline. Click to reconnect." : "Currently Online. Click to simulate offline mode."}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isOffline
                  ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Offline {offlineQueueCount > 0 ? `(${offlineQueueCount})` : ""}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Subscription Tier & Roadmap Button */}
            <button
              id="nav-subscription-badge-button"
              onClick={() => onOpenPricing()}
              title="Verixa Free Public Tier (50 pages/month). Click to view product roadmap & planned plans."
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Free Plan</span>
              <span className="hidden md:inline text-slate-500 dark:text-slate-400 font-normal">
                ({scansUsed}/50 mo)
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 ml-0.5">
                Roadmap
              </span>
            </button>

            {/* PROFILE ICON & DROPDOWN (Houses Audit & Compliance) */}
            <div className="relative" ref={profileRef}>
              <button
                id="profile-dropdown-button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Avatar Icon / Initials */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {userProfile?.name ? getInitials(userProfile.name) : "NK"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {userProfile?.name || "Noor Khan"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none">
                    {userRole === "VIEWER" ? "Viewer (Read-Only)" : userRole}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div
                  id="profile-menu-popover"
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* User Profile Card */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl mb-2 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {userProfile?.name ? getInitials(userProfile.name) : "NK"}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {userProfile?.name || "Noor Khan"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                          {userProfile?.email || "noorkhan19194@gmail.com"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400">Current Role:</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          userRole === "VIEWER"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {userRole === "VIEWER" ? "VIEWER (Read-Only)" : userRole}
                      </span>
                    </div>
                  </div>

                  {/* Subscription Plan Card */}
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl mb-2 border border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Plan: {PLAN_CONFIGS[currentTier].name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {PLAN_CONFIGS[currentTier].scanLimit === -1
                          ? "Unlimited entries"
                          : `${scansUsed}/${PLAN_CONFIGS[currentTier].scanLimit} scans`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${
                            PLAN_CONFIGS[currentTier].scanLimit === -1
                              ? 100
                              : Math.min(100, (scansUsed / PLAN_CONFIGS[currentTier].scanLimit) * 100)
                          }%`,
                        }}
                      />
                    </div>
                    <button
                      id="profile-manage-subscription-btn"
                      onClick={() => {
                        onOpenPricing();
                        setProfileOpen(false);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{currentTier === "ULTRA" ? "Manage Subscription" : "Upgrade / Change Plan"}</span>
                    </button>
                  </div>

                  {/* Move Audit & Compliance Here (User Request) */}
                  <div className="space-y-1 mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Enterprise Governance
                    </div>
                    <button
                      id="profile-menu-audit"
                      onClick={() => {
                        setCurrentTab("audit");
                        setProfileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        currentTab === "audit"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <div>Audit &amp; Compliance</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            GDPR, SOC2 &amp; SHA-256 Ledger
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
                    </button>
                  </div>

                  {/* Switch Active Role */}
                  <div className="space-y-1 mb-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Switch Role Privileges
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-1">
                      {(["ADMIN", "VIEWER", "REVIEWER", "AUDITOR"] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          id={`profile-role-${r.toLowerCase()}`}
                          onClick={() => {
                            setUserRole(r);
                          }}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            userRole === r
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <span>{r === "VIEWER" ? "Viewer (Read-Only)" : r}</span>
                          {userRole === r && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      id="profile-menu-logout"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out / Switch Account</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search Row (sm:hidden) */}
        <div className="block sm:hidden pb-3">
          <DocumentSearchBar
            selectedDepartment={selectedDepartment}
            onSelectDocument={() => {
              setCurrentTab("database");
            }}
          />
        </div>
      </div>
    </header>
  );
};

