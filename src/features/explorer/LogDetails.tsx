import  type {NormalizedLog} from "../ingest/normalize";
export default function LogDetails({log}:{log: NormalizedLog| null}){
    if(!log){
        return <div className="card">Select a row to see details.</div>;
    }   
    return (<div className="card">
    <div className="card-title">Log Details</div>
    <div className="log-details-content">
      <p><strong>ID:</strong> {log.id}</p>
      <p><strong>Timestamp:</strong> {log.timestamp?new Date(log.timestamp).toLocaleString():"-"}</p>
      <p><strong>Level:</strong> {log.level??"-"}</p>
      <p><strong>Message:</strong> {log.message}</p>
</div>
<pre style={{ whiteSpace: "pre-wrap", overflow: "auto", maxHeight: 400 }}>
  {JSON.stringify(log.raw, null, 2)}
</pre>


    <button onClick={() => {
        try{
        navigator.clipboard.writeText(JSON.stringify(log.raw, null, 2))
        }
        catch(e)
        {
console.log("Clipboard API not supported", e);
        }}}>Copy Raw Log</button>
</div>
    );
}