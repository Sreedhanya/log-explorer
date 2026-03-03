import UploadPanel from "./features/ingest/UploadPanel";
import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { useIngest } from "./features/ingest/UseIngest";
import LogTable from "./features/explorer/LogTable";
import LogDetails from "./features/explorer/LogDetails";
type SavedView = {
  query: string;
  id: string;
  name: string;
  levels: string[];
  services: string[];
  createdAt: number;
  fromTs: number | null;
  toTs: number | null;
};
function App() {
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    try {
      const str = localStorage.getItem("SavedViews");
      if (!str) return [];
      return JSON.parse(str) as SavedView[];
    } catch (e) {
      return [];
    }
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { state, ingestText, reset } = useIngest();
  const [query, setQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [fromTs, setFromTs] = useState<number | null>(null);
  const [toTs, setToTs] = useState<number | null>(null);
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");

  const timeBounds = useMemo(() => {
    if (state.status !== "loaded" || state.logs.length === 0) return null;

    let min = Number.POSITIVE_INFINITY;
    let max = 0;

    for (const l of state.logs) {
      const t = l.timestamp ? new Date(l.timestamp).getTime() : null; // OR: l.ts ?? null

      if (t == null || Number.isNaN(t)) continue;
      if (t < min) min = t;
      if (t > max) max = t;
    }

    if (!Number.isFinite(min)) return null;
    return { min, max };
  }, [state.status, state.status === "loaded" ? state.logs : null]);
  useEffect(() => {
    try {
      localStorage.setItem("SavedViews", JSON.stringify(savedViews));
    } catch (e) {
      //
    }
  }, [savedViews]);
  const [viewName, setViewName] = useState("");
  function saveCurrentView() {
    if (state.status !== "loaded") return;
    const name = viewName.trim();
    if (!name) {
      alert("Please enter a name for the view");
      return;
    }
    const newView: SavedView = {
      id: crypto.randomUUID(),
      name,
      query,
      levels: [...selectedLevels],
      services: [...selectedServices],
      createdAt: Date.now(),
      fromTs,
      toTs,
    };
    setSavedViews((prev) => [...prev, newView]);
    setViewName("");
  }

  function toDateTimeLocal(ms: number) {
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const filteredLogs = useMemo(() => {
    if (state.status !== "loaded") return [];

    const q = query.trim().toLowerCase();
    let out = state.logs;

    if (q) {
      out = out.filter((l) => l.searchText.includes(q));
    }

    if (selectedLevels.length > 0) {
      out = out.filter(
        (l) => (l.level ?? "") && selectedLevels.includes(l.level ?? ""),
      );
    }
    if (selectedServices.length > 0) {
      out = out.filter(
        (l) => (l.service ?? "") && selectedServices.includes(l.service ?? ""),
      );
    }
    if (fromTs != null || toTs != null) {
      out = out.filter((l) => {
        const t = l.timestamp ? new Date(l.timestamp).getTime() : null; // OR l.ts
        if (t == null || Number.isNaN(t)) return false;

        if (fromTs != null && t < fromTs) return false;
        if (toTs != null && t > toTs) return false;

        return true;
      });
    }
    out = [...out].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });
    return out;
  }, [
    state.status,
    state.status === "loaded" ? state.logs : null,
    query,
    selectedLevels,
    selectedServices,
    fromTs,
    toTs,
  ]);

  const selectedLog =
    state.status === "loaded"
      ? (filteredLogs.find((l) => l.id === selectedId) ?? null)
      : null;
  const services = useMemo(() => {
    if (state.status !== "loaded") return [];
    const serviceSet = new Set<string>();
    state.logs.forEach((l) => {
      if (l.service) serviceSet.add(l.service);
    });
    return Array.from(serviceSet).sort();
  }, [state.status, state.status === "loaded" ? state.logs : null]);
  const levels = useMemo(() => {
    if (state.status !== "loaded") return [];
    const levelSet = new Set<string>();
    state.logs.forEach((l) => {
      if (l.level) levelSet.add(l.level);
    });
    return Array.from(levelSet).sort();
  }, [state.status, state.status === "loaded" ? state.logs : null]);
  const handleReset = () => {
    setSelectedId(null);
    reset();
  };
  function exportFilteredJson() {
    if (state.status !== "loaded") return;

    const payload = filteredLogs.map((l) => l.raw);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const base = state.fileName?.replace(/\.[^.]+$/, "") ?? "logs";
    a.download = `${base}.filtered.json`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }
  function loadSavedView(view: SavedView) {
    setQuery(view.query);
    setSelectedLevels(view.levels);
    setSelectedServices(view.services);
    setSelectedId(null);
    setFromTs(view.fromTs ?? null);
    setToTs(view.toTs ?? null);
     setFromInput(view.fromTs ? toDateTimeLocal(view.fromTs) : "");
  setToInput(view.toTs ? toDateTimeLocal(view.toTs) : "");
  }

  const clearAll = () => {
    setQuery("");
    setSelectedLevels([]);
    setSelectedServices([]);
    setFromInput("");
    setToInput("");
    setFromTs(null);
    setToTs(null);
  };
  return (
    <>
      <div className="app">
        <header className="app-header">
          Log Explorer — Ingest, Filter & Export Structured Logs
        </header>
        <main className="app-main">
          <UploadPanel onTextLoaded={ingestText} />
          <div className="card">
            <div className="card-title"> Ingestion Status</div>
            {state.status === "error" && (
              <div style={{ color: "crimson" }}>
                Error parsing file: {state.message}
              </div>
            )}
            {state.status === "idle" && <div>No file Uploaded yet</div>}
            {state.status === "parsing" && (
              <div>Parsing file: {state.fileName}</div>
            )}
            {state.status === "loaded" && state.logs.length === 0 && (
              <div style={{ color: "crimson" }}>
                Loaded, but found 0 log rows.
              </div>
            )}
            {state.status === "loaded" && (
              <>
                <div>Save view</div>
                <input
                  type="text"
                  placeholder="View Name"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                />
                <button
                  onClick={saveCurrentView}
                  disabled={state.status !== "loaded" || !viewName.trim()}
                >
                  Save View
                </button>
                {savedViews.length === 0 && <div>No saved views</div>}
                {savedViews.map((view) => (
                  <div
                    key={view.id}
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      borderRadius: 4,
                      marginTop: 8,
                      background: "#f9f9f9",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{view.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Created at: {new Date(view.createdAt).toLocaleString()}
                    </div>
                    <button
                      onClick={() =>
                        setSavedViews((prev) =>
                          prev.filter((v) => v.id !== view.id),
                        )
                      }
                    >
                      Delete
                    </button>
                    <button onClick={() => loadSavedView(view)}>Load</button>
                  </div>
                ))}
                <div className="card-title">Filters</div>
                <div className="filters-header">
                <button
                  onClick={exportFilteredJson}
                  disabled={filteredLogs.length === 0}
                >
                  Export Filtered JSON
                </button>
                <input
                  type="text"
                  placeholder="Search Logs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="filters-grid">
                  <div className="filter-section">
                    <div>Levels</div>
                    {levels.map((level) => (
                      <div key={level}>
                        <input
                          type="checkbox"
                          id={`level-${level}`}
                          checked={selectedLevels.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLevels((prev) => [...prev, level]);
                            } else {
                              setSelectedLevels((prev) =>
                                prev.filter((l) => l !== level),
                              );
                            }
                          }}
                        />
                        <label htmlFor={`level-${level}`}>{level}</label>
                      </div>
                    ))}
                    <button onClick={() => setSelectedLevels([])}  className="secondary">
                      Clear Levels
                    </button>
                  </div>
                  <div className="filter-section">
                    <div>Time Range</div>
                    <input
                      type="datetime-local"
                      value={fromInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFromInput(v);
                        setFromTs(v ? new Date(v).getTime() : null);
                      }}
                    />

                    <input
                      type="datetime-local"
                      value={toInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        setToInput(v);
                        setToTs(v ? new Date(v).getTime() : null);
                      }}
                    />
                    <button
                      onClick={() => {
                        setFromInput("");
                        setToInput("");
                        setFromTs(null);
                        setToTs(null);
                      }}
                      className="secondary"
                    >
                      Clear Time
                    </button>
                    <button
                      disabled={!timeBounds}
                      onClick={() => {
                        if (!timeBounds) return;
                        const v = toDateTimeLocal(timeBounds.min);
                        setFromInput(v);
                        setFromTs(timeBounds.min);
                      }}
                    className="secondary">
                      From Min
                    </button>

                    <button
                      disabled={!timeBounds}
                      onClick={() => {
                        if (!timeBounds) return;
                        const v = toDateTimeLocal(timeBounds.max);
                        setToInput(v);
                        setToTs(timeBounds.max);
                      }}
                      className="secondary"
                    >
                      To Max
                    </button>
                    <div>Services</div>

                    {services.map((service) => (
                      <div key={service}>
                        <input
                          type="checkbox"
                          id={`service-${service}`}
                          checked={selectedServices.includes(service)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServices((prev) => [...prev, service]);
                            } else {
                              setSelectedServices((prev) =>
                                prev.filter((s) => s !== service),
                              );
                            }
                          }}
                        />
                        <label htmlFor={`service-${service}`}>{service}</label>
                      </div>
                    ))}
                    <button onClick={() => setSelectedServices([])} className ="secondary">
                      Clear Services
                    </button>
                  </div>
                </div>
                <button onClick={clearAll} className="secondary">Clear All Filters</button>
                <div className="status-badge">
                  Showing {filteredLogs.length} of {state.logs.length} logs
                </div>
                </div>
                <div className="split">
                  <LogTable
                    logs={filteredLogs}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                  <LogDetails log={selectedLog} />
                </div>
              </>
            )}
            {state.status != "idle" && (
              <button onClick={handleReset} style={{ marginTop: 8 }}>
                Reset
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
