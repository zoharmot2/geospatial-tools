/** Share-state encoding for reproducible calculator URLs. */

export const MAX_SHARE_STATE_CHARS = 6000;

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function fromBase64Url(encoded) {
  const normalized = encoded.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShareState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new TypeError("Share state must be an object.");
  }
  const encoded = toBase64Url(JSON.stringify(state));
  if (encoded.length > MAX_SHARE_STATE_CHARS) {
    throw new RangeError("This calculation is too large for a shareable URL. Use Export JSON instead.");
  }
  return encoded;
}

export function decodeShareState(encoded) {
  if (typeof encoded !== "string" || !encoded || encoded.length > MAX_SHARE_STATE_CHARS) {
    throw new RangeError("Invalid or oversized share state.");
  }
  const value = JSON.parse(fromBase64Url(encoded));
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Decoded share state is invalid.");
  }
  return value;
}

export function createShareURL(state, locationLike = window.location) {
  const url = new URL(locationLike.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("state", encodeShareState(state));
  return url.toString();
}

export function readShareStateFromURL(locationLike = window.location) {
  const encoded = new URL(locationLike.href).searchParams.get("state");
  if (!encoded) return null;
  return decodeShareState(encoded);
}
