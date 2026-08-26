"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { notifications as seedNotifications } from "@/lib/mock-data";
import type { NotificationItem, ThemeMode } from "@/lib/types";

interface ToastItem {
  id: number;
  title: string;
  body: string;
  tone: "success" | "info" | "warning";
}

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);
const STORAGE_KEY = "aurelium-theme";

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let stored: ThemeMode | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    } catch {
      // Private browsing or blocked storage: fall back to the default theme.
    }
    const next = stored ?? "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage failures; the toggle still applies for this session.
      }
      return next;
    });
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => removeToast(id), 3600);
    },
    [removeToast]
  );

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      sidebarOpen,
      setSidebarOpen,
      notifications,
      unreadCount: notifications.filter((item) => item.unread).length,
      markAllRead,
      toasts,
      addToast,
      removeToast
    }),
    [theme, toggleTheme, sidebarOpen, notifications, markAllRead, toasts, addToast, removeToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
