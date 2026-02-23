import type { RawLog } from "./parse";

export type NormalizedLog = {
  id: string;
  timestamp: number | null;
  level: string | null;
  message: string | null;
  service?: string | null;
  correlationId?: string|null;
  raw: RawLog;
  searchText: string;
};
const pick =(obj: RawLog,key:string[]): string|null=>{
    for(const k of key){
        if(k in obj){
            const v = obj[k];  
            if(v!==undefined && v!==null && v!="")
                return v;

        }


}
        return null;

}
 const toEpochMillis = (v: any):number|null =>{
    if(typeof v === "number")
        return v>1e12? v: v*1000;
    if(typeof v === "string"){
        const parsed = Date.parse(v);
        if(!isNaN(parsed))
            return parsed;
    }
    return null;
 }
const stableId=(raw:RawLog,idx:number):string=>{
    const id = pick(raw,["id","_id","eventId","event_id","spanId","span_id"]);
return typeof id==="string" && id?.trim()?id: `row-${idx}`;
}
export function normalizeLogs(logs: RawLog[]): NormalizedLog[]{
return logs.map(((log, idx)=>{
    const timestamp=toEpochMillis(pick(log,["timestamp","time","date","datetime","@timestamp"]));
    const levelVal = pick(log,["level","logLevel","severity","status"]);
    const messageVal = pick(log,["message","msg","log","description"]);
    const serviceVal = pick(log,["service","serviceName","app","application"]);
    const correlationVal = pick(log,["correlationId","correlation_id","traceId","trace_id"]);
    const id = stableId(log, idx);
     const level = levelVal == null ? null : String(levelVal);
    const service = serviceVal == null ? null : String(serviceVal);
    const message = messageVal == null ? null : String(messageVal);
    const correlationId = correlationVal == null ? null : String(correlationVal);
    const searchText = JSON.stringify({level, message, service, correlationId,log}).toLowerCase();
    return {id, timestamp, level, message, service, correlationId, raw: log, searchText};
}))
}