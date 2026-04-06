"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, UtensilsCrossed, TrendingUp, FlaskConical, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/treino", icon: Dumbbell, label: "Treino" },
  { href: "/nutricao", icon: UtensilsCrossed, label: "Dieta" },
  { href: "/progresso", icon: TrendingUp, label: "Progresso" },
  { href: "/ciencia", icon: FlaskConical, label: "Ciência" },
  { href: "/perfil", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center max-w-lg mx-auto px-2 pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-colors",
                isActive ? "text-ember" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "drop-shadow-[0_0_6px_rgba(240,78,35,0.6)]"
                )}
              />
              <span className={cn("text-[10px] font-semibold tracking-wide", isActive ? "text-ember" : "text-muted-foreground")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
