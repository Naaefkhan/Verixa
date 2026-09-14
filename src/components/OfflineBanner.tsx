import React from "react";
import { WifiOff, RefreshCw, UploadCloud, CheckCircle2 } from "lucide-react";

interface OfflineBannerProps {
  isOffline: boolean;
  offlineQueueCount: number;
  onSyncOfflineQueue: () => void;
  isSyncing: boolean;
  onToggleOffline: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  offlineQueueCount,
  onSyncOfflineQueue,
  isSyncing,
  onToggleOffline,
}) => {
  if (!isOffline && offlineQueueCount === 0) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 font-medium text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-slate-950 flex-shrink-0" />
        {isOffline ? (
          <span>
            <strong>Simulated Offline Mode Active.</strong> Scanned documents are cached locally in secure browser storage ({offlineQueueCount} pending sync).
          </span>
        ) : (
          <span>
            <strong>Back Online!</strong> You have {offlineQueueCount} scanned document(s) cached offline ready to push to SQL.
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {offlineQueueCount > 0 && !isOffline && (
          <button
            onClick={onSyncOfflineQueue}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 transition-colors shadow-xs disabled:opacity-60"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing to SQL..." : `Sync ${offlineQueueCount} Document(s) Now`}
          </button>
        )}

        <button
          onClick={onToggleOffline}
          className="text-slate-950 underline hover:no-underline font-semibold text-xs"
        >
          {isOffline ? "Switch Back to Online" : "Simulate Offline"}
        </button>
      </div>
    </div>
  );
};
