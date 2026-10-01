"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";

export interface NotificationItem {
  id: number | string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  unread: boolean;
  linkTab?: string;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 1,
    user: "Lucas Bennett",
    action: "submitted pre-approval for",
    target: "Sunny Central Studio",
    timestamp: "10 minutes ago",
    unread: true,
    linkTab: "Messages",
  },
  {
    id: 2,
    user: "Mob'in Admin",
    action: "verified your listing",
    target: "Sunny Central Studio",
    timestamp: "45 minutes ago",
    unread: true,
    linkTab: "My Properties",
  },
  {
    id: 3,
    user: "Maria Santos",
    action: "requested viewing schedule for",
    target: "Unit 4B Studio",
    timestamp: "2 hours ago",
    unread: false,
    linkTab: "Messages",
  },
  {
    id: 4,
    user: "Sarah Chen",
    action: "replied to your message in",
    target: "Monthly Lease Agreement",
    timestamp: "12 hours ago",
    unread: false,
    linkTab: "Messages",
  },
  {
    id: 5,
    user: "System",
    action: "recorded payment for",
    target: "Premium Landlord Plan",
    timestamp: "2 days ago",
    unread: false,
    linkTab: "Payment History",
  },
  {
    id: 6,
    user: "Alex Morgan",
    action: "saved listing to favorites",
    target: "Modern Two-Bedroom Flat",
    timestamp: "2 weeks ago",
    unread: false,
  },
];

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

interface ComponentProps {
  items?: NotificationItem[];
  onNotificationSelect?: (item: NotificationItem) => void;
  trigger?: React.ReactNode;
}

function Component({ items, onNotificationSelect, trigger }: ComponentProps = {}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    items && items.length > 0 ? items : defaultNotifications
  );

  useEffect(() => {
    if (items && items.length > 0) {
      setNotifications(items);
    }
  }, [items]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  };

  const handleNotificationClick = (id: number | string) => {
    const targetItem = notifications.find((n) => n.id === id);
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification,
      ),
    );
    if (targetItem && onNotificationSelect) {
      onNotificationSelect(targetItem);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button size="icon" variant="outline" className="relative cursor-pointer" aria-label="Open notifications">
            <Bell size={16} strokeWidth={2} aria-hidden="true" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden flex flex-col" align="end">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2 shrink-0 bg-popover">
          <div className="text-sm font-semibold text-foreground">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="h-px bg-border shrink-0"
        ></div>
        <div className="max-h-[360px] overflow-y-auto overflow-x-hidden p-1 space-y-0.5">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer ${
                  notification.unread ? "bg-accent/40" : ""
                }`}
              >
                <div className="relative flex items-start pe-3">
                  <div className="flex-1 space-y-1">
                    <button
                      type="button"
                      className="text-left text-foreground/80 after:absolute after:inset-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <span className="font-medium text-foreground hover:underline">
                        {notification.user}
                      </span>{" "}
                      {notification.action}{" "}
                      <span className="font-medium text-foreground hover:underline">
                        {notification.target}
                      </span>
                      .
                    </button>
                    <div className="text-xs text-muted-foreground">{notification.timestamp}</div>
                  </div>
                  {notification.unread && (
                    <div className="absolute end-0 self-center text-primary">
                      <span className="sr-only">Unread</span>
                      <Dot />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { Component, Component as NotificationPopover };
export default Component;
