import { useState } from "react";
import api from "./lib/api.js";

export default function App() {
  const [longUrl, setLongUrl] = useState("");
  const [expiryEnabled, setExpiryEnabled] = useState(true);
  const [expiryDays, setExpiryDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!longUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (expiryEnabled && (!expiryDays || Number(expiryDays) <= 0)) {
      setError("Please enter expiry days (positive number)");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/shorten", {
        longUrl: longUrl.trim(),
        expiresInDays: expiryEnabled ? Number(expiryDays) : null,
      });
      setResult(data);
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <main className="card">
        <header>
          <h1>Link Shortner</h1>
          <p>Shorten URLs with optional expiry or permanent links.</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Long URL</span>
            <input
              type="url"
              placeholder="https://example.com/very/long/url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />
          </label>

          <div className="expiry-row">
            <label className="toggle">
              <input
                type="checkbox"
                checked={expiryEnabled}
                onChange={(e) => setExpiryEnabled(e.target.checked)}
              />
              <span className="toggle-ui" aria-hidden="true" />
              <span>Expiry in</span>
            </label>

            <label className="field inline-field">
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  disabled={!expiryEnabled}
                />
                <span className="input-suffix">Days</span>
              </div>
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <label className={`field result ${result ? "is-ready" : "is-empty"}`}>
          <span>Short URL</span>
          {result ? (
            <a
              className="input-like"
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
            >
              {result.shortUrl}
            </a>
          ) : (
            <div className="input-like placeholder" aria-hidden="true" />
          )}
        </label>
      </main>
    </div>
  );
}
