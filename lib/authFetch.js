// lib/authFetch.js
export async function authFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include", // ✅ Send cookies automatically
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ API error: ${res.status} - ${errorText}`);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  return res.json(); // ✅ return parsed JSON
}
