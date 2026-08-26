"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { notifications as seedNotifications } from "@/lib/mock-data";
import type { NotificationItem, ThemeMode } from "@/lib/types";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatSigned,
  type CurrencyCode,
  type DateFormat
} from "@/lib/utils";

export type Density = "comfortable" | "compact";

export interface Preferences {
  currency: CurrencyCode;
  dateFormat: DateFormat;
  density: Density;
}

export interface ToastItem {
  id: number;
  title: string;
  body: string;
  tone: "success" | "info" | "warning" | "error";
}

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;

  notifications: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;

  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: number) => void;

  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;

  /** Bumped by `refresh()`. Data hooks key off it to replay their load state. */
  refreshKey: number;
  refresh: () => void;
  refreshing: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const THEME_KEY = "aurelium-theme";
const PREFS_KEY = "aurelium-preferences";

const defaultPreferences: Preferences = {
  currency: "USD",
  dateFormat: "MMM D, YYYY",
  density: "comfortable"
};

function readStoredPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    // Merge rather than trust: a stale or hand-edited value must not break render.
    return {
      currency: parsed.currency ?? defaultPreferences.currency,
      dateFormat: parsed.dateFormat ?? defaultPreferences.dateFormat,
      density: parsed.density ?? defaultPreferences.density
    };
  } catch {
    return defaultPreferences;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const toastId = useRef(0);
  const timers = useRef<number[]>([]);

  /* Hydrate from storage after mount so SSR output stays stable. */
  useEffect(() => {
    let stored: ThemeMode | null = null;
    try {
      stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    } catch {
      // Private browsing or blocked storage: fall back to the default theme.
    }
    const next: ThemeMode = stored === "light" ? "light" : "dark";
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    setPreferences(readStoredPreferences());
  }, []);

  /* Clear any pending toast timers when the provider unmounts. */
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
    try {
      window.localStorage.setItem(THEME_KEY, mode);
    } catch {
      // Ignore storage failures; the choice still applies for this session.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPreferences((current) => {
        const next = { ...current, [key]: value };
        try {
          window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage failures.
        }
        return next;
      });
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      toastId.current += 1;
      const id = toastId.current;
      // Cap the stack so a burst of actions cannot bury the page.
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      const timer = window.setTimeout(() => removeToast(id), 4000);
      timers.current.push(timer);
    },
    [removeToast]
  );

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((current) => current + 1);
    const timer = window.setTimeout(() => setRefreshing(false), 700);
    timers.current.push(timer);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      sidebarOpen,
      setSidebarOpen,
      notifications,
      unreadCount: notifications.filter((item) => item.unread).length,
      markAllRead,
      markRead,
      toasts,
      addToast,
      removeToast,
      preferences,
      setPreference,
      refreshKey,
      refresh,
      refreshing
    }),
    [
      theme,
      toggleTheme,
      setTheme,
      sidebarOpen,
      notifications,
      markAllRead,
      markRead,
      toasts,
      addToast,
      removeToast,
      preferences,
      setPreference,
      refreshKey,
      refresh,
      refreshing
    ]
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

/**
 * Formatters bound to the current display preferences, so the currency and
 * date-format settings actually change what every page renders.
 */
export function useFormat() {
  const { preferences } = useAppContext();
  const { currency, dateFormat } = preferences;

  return useMemo(
    () => ({
      currency,
      money: (value: number, fractionDigits = 0) => formatCurrency(value, fractionDigits, currency),
      signed: (value: number, fractionDigits = 0) => formatSigned(value, fractionDigits, currency),
      compact: (value: number) => formatCompactCurrency(value, currency),
      date: (value: string) => formatDate(value, dateFormat)
    }),
    [currency, dateFormat]
  );
}
