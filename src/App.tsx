import UploadPanel from './features/ingest/UploadPanel';
import {useState, useMemo, useEffect} from 'react';
import './App.css'
import { useIngest } from './features/ingest/UseIngest';
import LogTable from './features/explorer/LogTable';
import LogDetails from './features/explorer/LogDetails';
type SavedView={
  query: string;
  id:string;
  name: string;
  levels:string[];
  services:string[];
  createdAt: number;
}
function App() {
const [savedViews, setSavedViews] = useState<SavedView[]>(()=>{
  try{
    const str = localStorage.getItem("SavedViews");
    if(!str) return [];
    return JSON.parse(str) as SavedView[];
  }
  catch(e){
    return [];
  }
});
const [selectedId, setSelectedId]= useState<string|null>(null);
const{state, ingestText, reset}= useIngest();
const [query, setQuery]= useState("");
const [selectedServices, setSelectedServices] = useState<string[]>([]);
const [selectedLevels, setSelectedLevels]= useState<string[]>([]);
useEffect(()=>{
  try{
  localStorage.setItem("SavedViews", JSON.stringify(savedViews));
}
catch(e){
//
}
},[savedViews]);
const [viewName, setViewName] = useState("");
function saveCurrentView(){
  if(state.status!=="loaded") return;
  const name = viewName.trim();
  if(!name){
    alert("Please enter a name for the view");
    return;
  }
  const newView: SavedView={
    id:crypto.randomUUID(),
    name,
    query,
    levels: [...selectedLevels],
    services: [...selectedServices],
    createdAt: Date.now(),
  }
  setSavedViews(prev=> [...prev, newView]);
  setViewName("");
}

const filteredLogs = useMemo(() => {
  if (state.status !== "loaded") return [];

  const q = query.trim().toLowerCase();
  let out = state.logs;

  if (q) {
    out = out.filter(l => l.searchText.includes(q));
  }

  if (selectedLevels.length > 0) {
    out = out.filter(l => (l.level ?? "") && selectedLevels.includes(l.level ?? ""));
  }
  if(selectedServices.length>0){
    out = out.filter(l => (l.service ?? "") && selectedServices.includes(l.service ?? ""));
  }

  return out;
}, [state.status, state.status === "loaded" ? state.logs : null, query, selectedLevels,selectedServices]);

const selectedLog = state.status === "loaded"
  ? filteredLogs.find(l=> l.id === selectedId) ?? null
  : null;
  const services = useMemo(()=>{
    if(state.status!=="loaded") return [];
    const serviceSet = new Set<string>();
    state.logs.forEach(l=>{
      if(l.service)
      serviceSet.add(l.service)
    })
    return Array.from(serviceSet).sort();
  },[state.status, state.status==="loaded"?state.logs:null]);
const levels = useMemo(()=>{
  if(state.status!=="loaded") return [];
  const levelSet = new Set<string>();
  state.logs.forEach(l=>{
    if(l.level)
    levelSet.add(l.level)
  })
  return Array.from(levelSet).sort();
},[state.status, state.status==="loaded"?state.logs:null]);
  const handleReset =()=>{
    setSelectedId(null);
    reset();
  }
function exportFilteredJson() {
  if (state.status !== "loaded") return;

  const payload = filteredLogs.map(l => l.raw);
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
  }

  const clearAll =()=>{
    setQuery("");
    setSelectedLevels([]);
    setSelectedServices([]);
  }
  return (
    <>
      <div className='app'>
      <header className="app-header">
        Log Explorer
      </header>
      <main className="app-main">
        <UploadPanel onTextLoaded={ingestText} /> 
        <div className="card">

          <div className="card-title"> Ingestion Status</div>
          {state.status ==="idle" && <div>No file Uploaded yet</div>}
          {state.status ==="parsing" && <div>Parsing file: {state.fileName}</div>}
       {state.status==="loaded" && (
        <>
        <div>Save view</div>
        <input type="text" placeholder="View Name" value={viewName} onChange={e=>setViewName(e.target.value)}/>
        <button onClick={saveCurrentView} disabled={state.status !== "loaded" || !viewName.trim()}>Save View</button>
        {savedViews.length === 0 && <div>No saved views</div>}
        {savedViews.map(view=>(
      <div key={view.id} style={{border:"1px solid #ddd", padding:8, borderRadius:4, marginTop:8, background:"#f9f9f9"}}>
        <div style={{fontWeight:600}}>{view.name}</div>
        <div style={{fontSize:12, opacity:0.8}}>Created at: {new Date(view.createdAt).toLocaleString()}</div>
        <button onClick={()=>setSavedViews(prev=>prev.filter(v=>v.id!==view.id))}>Delete</button>
        <button onClick={()=>loadSavedView(view)}>Load</button>
      </div>
        ))}
        <div className="card-title">Filters</div>
        <button onClick={exportFilteredJson} disabled={filteredLogs.length === 0}>
  Export Filtered JSON
</button>
        <input type="text" placeholder="Search Logs..." value={query} onChange={e=>setQuery(e.target.value)}/>
         <div className="filters-grid">
          <div className="filter-section">
        <div>Levels</div>
        {levels.map(level => (
          <div key={level}>
            <input
              type="checkbox"
              id={`level-${level}`}
              checked={selectedLevels.includes(level)}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedLevels(prev => [...prev, level]);
                } else {
                  setSelectedLevels(prev => prev.filter(l => l !== level));
                }
              }}
            />
            <label htmlFor={`level-${level}`}>{level}</label>
          
          </div>
        ))}
        <button onClick={()=>setSelectedLevels([])}>Clear Levels</button>
      
      </div>
       <div className="filter-section">
      <div>Services</div>
     
      {services.map(service => (
        <div key={service}>
          <input
            type="checkbox"
            id={`service-${service}`}
            checked={selectedServices.includes(service)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedServices(prev => [...prev, service]);
              } else {
                setSelectedServices(prev => prev.filter(s => s !== service));
              }
            }}
          />
          <label htmlFor={`service-${service}`}>{service}</label>
        </div>
      ))}
      <button onClick={()=>setSelectedServices([])}>Clear Services</button>
       
      </div>
         
        </div>
        <button onClick={clearAll}>Clear All Filters</button>
       <div className="split">
        <LogTable logs ={filteredLogs} selectedId={selectedId} onSelect={setSelectedId}/>
       <LogDetails log={selectedLog}/></div></>)}
       {state.status!="idle"&& <button onClick={handleReset} style={{marginTop:8}}>Reset</button>}
        </div>
        </main>
      </div>
    </>
  )
}

export default App
