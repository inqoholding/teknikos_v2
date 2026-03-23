export function createClientId(prefix = "id") {
  if (typeof globalThis !== "undefined") {
    const cryptoObject = globalThis.crypto;
    if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
      return cryptoObject.randomUUID();
    }
  }

  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
}
