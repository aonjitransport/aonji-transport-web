// src/hooks/usePodImage.ts
import { useEffect, useState } from "react";

export function usePodImage(s3Key: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!s3Key) return;
    setLoading(true);
    fetch(`/api/pod/image?key=${encodeURIComponent(s3Key)}`)
      .then(r => r.json())
      .then(data => setUrl(data.url))
      .finally(() => setLoading(false));
  }, [s3Key]);

  return { url, loading };
}