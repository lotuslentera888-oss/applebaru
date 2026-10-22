import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const PREFIX = "ios26-simulator/preferences";
const EVENT_NAME = "ios26-preference-change";
const memoryStore = new Map();

function readAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "null");
  } catch {
    return null;
  }
}

/** Stable account namespace; preferences never cross users. */
export function preferenceNamespace(authUser) {
  const user = authUser || readAuthUser() || {};
  const stable = user.id ?? user.user_id ?? user.username ?? user.email ?? "anonymous";
  return `${PREFIX}/${String(stable)}`;
}

function storageKey(namespace, key) {
  return `${namespace}/${key}`;
}

function readValue(namespace, key, fallback) {
  const fullKey = storageKey(namespace, key);
  try {
    const raw = localStorage.getItem(fullKey);
    if (raw === null) return memoryStore.has(fullKey) ? memoryStore.get(fullKey) : fallback;
    return JSON.parse(raw);
  } catch {
    return memoryStore.has(fullKey) ? memoryStore.get(fullKey) : fallback;
  }
}

function writeValue(namespace, key, value) {
  const fullKey = storageKey(namespace, key);
  memoryStore.set(fullKey, value);
  try {
    localStorage.setItem(fullKey, JSON.stringify(value));
    memoryStore.delete(fullKey);
  } catch {
    // Private browsing, quota exhaustion, and disabled storage are supported.
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { namespace, key, value } }));
  } catch {
    // Tests and non-browser renderers may not expose CustomEvent/window.
  }
}

/**
 * Persistent, account-scoped preference hook.
 * Returns [value, setValue]. A custom event keeps mounted components in sync.
 */
export function usePreference(key, defaultValue, options = {}) {
  const { auth } = useAuth();
  const namespace = useMemo(() => preferenceNamespace(auth), [auth]);
  const [value, setValueState] = useState(() => readValue(namespace, key, defaultValue));
  const valueRef = useRef(value);
  const fallbackRef = useRef(defaultValue);
  fallbackRef.current = defaultValue;

  useEffect(() => {
    const next = readValue(namespace, key, fallbackRef.current);
    valueRef.current = next;
    setValueState(next);
  }, [namespace, key]);

  useEffect(() => {
    const onChange = (event) => {
      if (event.detail?.namespace === namespace && event.detail?.key === key) {
        valueRef.current = event.detail.value;
        setValueState(event.detail.value);
      }
    };
    const onStorage = (event) => {
      if (event.key === null || event.key === storageKey(namespace, key)) {
        let next = fallbackRef.current;
        try {
          if (event.newValue !== null) next = JSON.parse(event.newValue);
        } catch {
          // Keep the default when another tab wrote malformed data.
        }
        valueRef.current = next;
        setValueState(next);
      }
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [namespace, key]);

  const setValue = useCallback((next) => {
    const resolved = typeof next === "function" ? next(valueRef.current) : next;
    valueRef.current = resolved;
    setValueState(resolved);
    writeValue(namespace, key, resolved);
  }, [namespace, key]);

  const reset = useCallback(() => setValue(options.resetValue ?? defaultValue), [setValue, options.resetValue, defaultValue]);
  return [value, setValue, reset];
}

export function preferenceStorageKey(key, authUser) {
  return storageKey(preferenceNamespace(authUser), key);
}
