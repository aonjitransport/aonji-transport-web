// src/hooks/usePodImage.ts
import { useEffect, useState } from "react";

export function usePodImage(s3Key: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!s3Key) return;
    setLoading(true);
    setError(null);
    fetch(`/api/pod/image?key=${encodeURIComponent(s3Key)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = data?.error || `Failed to load image (${r.status})`;
          throw new Error(msg);
        }
        if (!data?.url) throw new Error("No signed url returned");
        setUrl(data.url);
      })
      .catch((e: any) => {
        setUrl(null);
        setError(e?.message || "Failed to load image");
      })
      .finally(() => setLoading(false));
  }, [s3Key]);

  return { url, loading, error };
}
