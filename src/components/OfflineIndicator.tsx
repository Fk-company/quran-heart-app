import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

/**
 * Small floating badge + toast notifications when the network status changes.
 * The app is fully functional offline (cached shell + API/audio caches via the
 * service worker), so we only surface a discreet indicator.
 */
const OfflineIndicator = () => {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [everWasOffline, setEverWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      if (everWasOffline) {
        toast.success("عاد الاتصال بالإنترنت", {
          description: "تمت استعادة الاتصال بالشبكة.",
          duration: 2500,
        });
      }
    };
    const handleOffline = () => {
      setOnline(false);
      setEverWasOffline(true);
      toast("أنت الآن دون اتصال", {
        description: "يعمل التطبيق بالمحتوى المحفوظ مسبقاً.",
        icon: <WifiOff className="h-4 w-4" />,
        duration: 3500,
      });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [everWasOffline]);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-full bg-amber-500/95 text-amber-950 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur">
            <WifiOff className="h-3.5 w-3.5" />
            <span>وضع بدون اتصال</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Wifi };
export default OfflineIndicator;
