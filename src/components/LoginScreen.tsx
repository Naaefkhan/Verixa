import React, { useState } from "react";
import {
  Scan,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Globe,
  KeyRound,
  Eye,
  CheckCircle2
} from "lucide-react";
import { UserRole, SubscriptionTier } from "../types";

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  tier?: SubscriptionTier;
}

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("noorkhan19194@gmail.com");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [name, setName] = useState("Noor Khan");

  const demoAccounts = [
    {
      name: "Noor Khan",
      email: "noorkhan19194@gmail.com",
      role: "ADMIN" as UserRole,
      dept: "Executive / IT Operations",
      desc: "Full Administrative & SQL Commit Privileges",
      color: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300",
    },
    {
      name: "Rohan Joshi (Viewer)",
      email: "rohan.viewer@corp.internal",
      role: "VIEWER" as UserRole,
      dept: "Corporate Stakeholder",
      desc: "Read-Only Access • Changes Strictly Restricted",
      color: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300",
    },
    {
      name: "Rajesh Sharma",
      email: "rajesh.operator@corp.internal",
      role: "REVIEWER" as UserRole,
      dept: "Data Quality & Anomaly Triage",
      desc: "Review Queue & Suggestion Approval",
      color: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300",
    },
    {
      name: "Priya Patil",
      email: "priya.auditor@corp.internal",
      role: "AUDITOR" as UserRole,
      dept: "Compliance & Security Office",
      desc: "GDPR / SOC2 Immutable Audit Verification",
      color: "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      name: name || "Enterprise User",
      email: email || "user@corp.internal",
      role: selectedRole,
      department: "All Departments",
    });
  };

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setName(acc.name);
    setEmail(acc.email);
    setSelectedRole(acc.role);
    onLogin({
      name: acc.name,
      email: acc.email,
      role: acc.role,
      department: acc.dept,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mx-auto mb-4">
            <Scan className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Verixa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multilingual Indian OCR • Python Data Cleaning • Power BI Visuals
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              India Edition (Hindi • Marathi • English)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
              SOC2 &amp; GDPR Compliant
            </span>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                id="login-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs rounded-xl px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Noor Khan"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="noorkhan19194@gmail.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authentication Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your corporate password"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Enterprise Role
              </label>
              <select
                id="login-role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ADMIN">Admin (Full Control, SQL Ingestion &amp; Overrides)</option>
                <option value="VIEWER">Viewer (Strict Read-Only Access • No Changes Allowed)</option>
                <option value="REVIEWER">Reviewer / Operator (Data Quality &amp; Missing Field Approval)</option>
                <option value="AUDITOR">Auditor (GDPR / SOC2 Cryptographic Ledger Inspector)</option>
              </select>
              {selectedRole === "VIEWER" && (
                <p className="text-[11px] text-emerald-400 mt-1">
                  ✓ Viewer Role: You can inspect scans, Power BI visuals, and database records without making changes.
                </p>
              )}
            </div>

            {/* Submit Sign In Button */}
            <button
              id="login-submit-button"
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>Sign In to DocuScan Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Profiles */}
          <div className="pt-4 border-t border-slate-700/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Or Instant 1-Click Persona Sign In:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-700/60 transition-all text-left group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {acc.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {acc.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {acc.email} • {acc.desc}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Security Footer Notice */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted with TLS 1.3 • SOC2 Type II Certified</span>
        </div>

      </div>
    </div>
  );
};
