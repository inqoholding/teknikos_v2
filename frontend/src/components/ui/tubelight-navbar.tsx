import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type TubelightNavItem = {
  name: string;
  url: string;
  icon: LucideIcon;
};

type NavBarProps = {
  items: TubelightNavItem[];
  className?: string;
};

function resolveInitialTab(items: TubelightNavItem[]) {
  if (typeof window === "undefined") {
    return items[0]?.name ?? "";
  }

  const currentHash = window.location.hash;
  const matchedItem = items.find((item) => item.url === currentHash);
  return matchedItem?.name ?? items[0]?.name ?? "";
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(() => resolveInitialTab(items));
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const syncActiveTab = () => {
      const currentHash = window.location.hash;
      const matchedItem = items.find((item) => item.url === currentHash);
      if (matchedItem) {
        setActiveTab(matchedItem.name);
      }
    };

    syncActiveTab();
    window.addEventListener("hashchange", syncActiveTab);
    return () => window.removeEventListener("hashchange", syncActiveTab);
  }, [items]);

  const activeItem = useMemo(
    () => items.find((item) => item.name === activeTab) ?? items[0],
    [activeTab, items],
  );

  return (
    <MotionConfig
      reducedMotion="user"
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 260, damping: 30, mass: 0.9 }
      }
    >
      <LayoutGroup>
        <div
          className={cn(
            "flex items-center rounded-full border border-[#d7eadc] bg-white/78 p-1 shadow-[0_14px_32px_rgba(18,66,49,0.08)] backdrop-blur-md",
            className,
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem?.name === item.name;

            return (
              <a
                key={item.name}
                href={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                  "text-[#5d6d65] transition-[color,transform] duration-200 ease-out hover:text-[#10231b] active:scale-[0.98]",
                  isActive && "text-[#135b43]",
                )}
              >
                <motion.span
                  className="flex items-center gap-2"
                  animate={shouldReduceMotion ? undefined : { y: isActive ? -0.5 : 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { type: "tween", duration: 0.18, ease: "easeOut" }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  <span>{item.name}</span>
                </motion.span>
                {isActive ? (
                  <motion.div
                    layoutId="tubelight-navbar-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(135deg,rgba(213,247,230,0.98),rgba(179,235,208,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                    initial={false}
                  >
                    <motion.div
                      className="absolute left-1/2 top-0 h-1.5 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2bb673]"
                      animate={shouldReduceMotion ? undefined : { opacity: [0.72, 1, 0.84], width: [34, 40, 36] }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.26, ease: "easeOut" }}
                    >
                      <div className="absolute -left-1 -top-1 h-4 w-12 rounded-full bg-[#2bb673]/26 blur-md" />
                      <div className="absolute left-2 top-0 h-3 w-6 rounded-full bg-[#dff7ee]/72 blur-sm" />
                    </motion.div>
                  </motion.div>
                ) : null}
              </a>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
