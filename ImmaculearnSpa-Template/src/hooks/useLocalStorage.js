import { useState, useEffect } from "react";
// const secret_key = process.env.VITE_SECRET
const secret_key = import.meta.env.VITE_SECRET

// Helper: convert text <-> buffer
const enc = new TextEncoder();
const dec = new TextDecoder();

// Derive AES key from secret (PBKDF2)
async function deriveKey(secret=secret_key) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("localStorage_salt"), // static salt is fine for local use
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt JSON value
export async function encryptData(value, secret=secret_key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret);
  const encoded = enc.encode(JSON.stringify(value));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const buffer = new Uint8Array(ciphertext);
  const combined = new Uint8Array(iv.length + buffer.length);
  combined.set(iv);
  combined.set(buffer, iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt value
export async function decryptData(cipherText, secret=secret_key) {
  try {
    const raw = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);

    const key = await deriveKey(secret);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    console.warn("Decryption failed:", err);
    return null;
  }
}

// React Hook
export function useLocalStorage(key, initialValue, secret=secret_key) {
  const [storedValue, setStoredValue] = useState(initialValue);

  // Read value
  useEffect(() => {
    const load = async () => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const decrypted = await decryptData(item, secret);
          if (decrypted !== null) setStoredValue(decrypted);
        }
      } catch (error) {
        console.error("Error reading storage:", error);
      }
    };
    load();
  }, [key, secret]);

  // Write value
  const setValue = async (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      const encrypted = await encryptData(valueToStore, secret);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error("Error setting storage:", error);
    }
  };

  return [storedValue, setValue];
}


// app = useLocalStorage("sample", {"name": "wilson"}, "secrets")


// app.setValue("hello world")