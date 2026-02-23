import type {NormalizedLog} from "../ingest/normalize";
type Props ={logs: NormalizedLog[],
    selectedId: string|null,
    onSelect: (id: string)=>void
};
export default function LogTable({logs, selectedId, onSelect}: Props)
{
if(logs.length ===0)
{
    return <div>No logs to display</div>
}
return (
    <table>
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Service</th>
                <th>Message</th>
                <th>Correlation ID</th>
            </tr>
            </thead>
            <tbody>
                {logs.map((log)=>{
                    const isSelected = log.id === selectedId;
               return(<tr key ={log.id} onClick ={()=>onSelect?.(log.id)} style ={{cursor:"pointer", background:isSelected?"rgba(0,0,0,0.06)":"transparent"}}><td>
                        {log.timestamp? new Date(log.timestamp).toISOString():"-"}
                       </td>
                       <td>{log.level??"-"}</td>
                          <td>{log.service??"-"}</td>
                            <td>{log.message??"-"}</td>
                                <td>{log.correlationId??"-"}</td>   
                        </tr>
                )})}
            </tbody>
    </table>);
     
}