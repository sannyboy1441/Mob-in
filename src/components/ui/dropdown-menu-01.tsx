"use client";

import type { ReactElement } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LucideIcon,
  CircleUserRound,
  CreditCard,
  ReceiptText,
  Settings,
  LogOut,
} from "lucide-react";

type Props = {
  trigger: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
  wrapperClassName?: string;
  showSubscription?: boolean;
};

type MenuItem = {
  label: string;
  icon: LucideIcon;
  tabKey?: string;
  destructive?: boolean;
};

const PROFILE_ITEMS: MenuItem[] = [
  { label: "My Profile", icon: CircleUserRound, tabKey: "Profile" },
  { label: "My Subscription", icon: CreditCard, tabKey: "Subscription" },
  { label: "My Invoice", icon: ReceiptText, tabKey: "Payment History" },
];

const SETTINGS_ITEMS: MenuItem[] = [
  { label: "Account Settings", icon: Settings, tabKey: "Settings" },
];

const LOGOUT_ITEM: MenuItem = {
  label: "Signout",
  icon: LogOut,
  destructive: true,
};

const itemClass =
  "p-2 text-sm font-medium text-popover-foreground cursor-pointer gap-2";

const Dropdown = ({
  trigger,
  defaultOpen,
  align = "end",
  user,
  onNavigate,
  onLogout,
  wrapperClassName = "flex items-start justify-center",
  showSubscription = true,
}: Props) => {
  const displayName = user?.name || "Landlord";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "L";
  const localCustomAvatar = (() => {
    try {
      if (typeof window !== "undefined") {
        if (user?.email === "landlord@mobin.ph") {
          return localStorage.getItem("mobin_landlord_custom_avatar");
        }
        if (user?.email) {
          return localStorage.getItem(`mobin_user_profile_avatar_${user.email.toLowerCase().trim()}`);
        }
      }
    } catch (_) {}
    return null;
  })();

  const displayAvatar =
    user?.avatar ||
    localCustomAvatar ||
    (user?.email === "landlord@mobin.ph"
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=5f5900&color=fff&bold=true`);

  const profileItems = showSubscription
    ? PROFILE_ITEMS
    : PROFILE_ITEMS.filter(
        (item) => item.label !== "My Subscription" && item.label !== "My Invoice"
      );

  return (
    <div className={wrapperClassName}>
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger className="cursor-pointer outline-none focus:outline-none" asChild>
          {trigger}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          className="w-64 min-w-[16rem] rounded-2xl p-1.5 shadow-xl border border-border bg-popover text-popover-foreground duration-300"
        >
          <DropdownMenuGroup>
            {/* User Info */}
            <DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <Avatar className="size-10 border border-border">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>{initials || "DM"}</AvatarFallback>
                </Avatar>
                <span className="ring-card absolute right-0 bottom-0 size-2 rounded-full bg-green-600 ring-2" />
              </div>

              <div className="flex flex-col truncate">
                <span className="text-popover-foreground text-sm font-medium truncate">
                  {displayName}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {displayEmail}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Main Links */}
            {profileItems.map(({ label, icon: Icon, tabKey }) => (
              <DropdownMenuItem
                key={label}
                className={itemClass}
                onClick={() => {
                  if (tabKey && onNavigate) onNavigate(tabKey);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Settings */}
            <DropdownMenuGroup>
              {SETTINGS_ITEMS.map(({ label, icon: Icon, tabKey }) => (
                <DropdownMenuItem
                  key={label}
                  className={itemClass}
                  onClick={() => {
                    if (tabKey && onNavigate) onNavigate(tabKey);
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              variant="destructive"
              className={`${itemClass} text-destructive focus:text-destructive focus:bg-destructive/10`}
              onClick={() => {
                if (onLogout) onLogout();
              }}
            >
              <LOGOUT_ITEM.icon size={18} />
              <span>{LOGOUT_ITEM.label}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface DropdownMenu01Props {
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
  wrapperClassName?: string;
  showSubscription?: boolean;
}

const DropdownMenu01 = ({
  defaultOpen,
  align = "end",
  user,
  onNavigate,
  onLogout,
  wrapperClassName,
  showSubscription = true,
}: DropdownMenu01Props = {}) => {
  const displayName = user?.name || "Landlord";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "L";
  const avatarSrc =
    user?.avatar ||
    (user?.email === "landlord@mobin.ph"
      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=5f5900&color=fff&bold=true`);
  const avatarAlt = user?.name || "User Profile";

  return (
    <Dropdown
      align={align}
      defaultOpen={defaultOpen}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      wrapperClassName={wrapperClassName}
      showSubscription={showSubscription}
      trigger={
        <div className="rounded-full cursor-pointer hover:opacity-90 transition-opacity">
          <Avatar className="size-10 cursor-pointer border-2 border-[#5f5900]">
            <AvatarImage src={avatarSrc} alt={avatarAlt} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      }
    />
  );
};

export { Dropdown, DropdownMenu01 };
export default DropdownMenu01;
