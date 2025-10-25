type Props = Record<string, unknown>;

const enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
const endpoint: string | undefined = import.meta.env.VITE_ANALYTICS_URL;

export function track(event: string, props: Props = {}) {
  if (!enabled) return;
  const payload = {
    event,
    ts: Date.now(),
    props,
    url: typeof window !== 'undefined' ? window.location.href : '',
  };
  if (endpoint) {
    try {
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => { void 0; });
    } catch { void 0; }
  } else {
    // fallback: console only
    console.log('[analytics]', payload);
  }
}
