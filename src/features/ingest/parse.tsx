export type RawLog= Record<string, any>;
export type parseResult = {ok: true,format: "json-array"|"ndjson",logs:RawLog[]}|{ok: false, message:string, errors?:{line:number, errors:string}[]};
function isObject(v: unknown): v is Record<string, any>{
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
export function parseLogText(text:string): parseResult{
    const trimmed = text.trim();
    if(!trimmed){
        return {ok: false, message: "Input text is empty"};
    }
    if(trimmed.startsWith("["))
    {
try{
    const parsed = JSON.parse(trimmed);
    if(!Array.isArray(parsed))
    {
        return {ok: false, message: "Expected a JSON array at the top level"};
    }
      const logs: RawLog[] = [];
      for(let i=0;i<parsed.length;i++){
        const item=parsed[i];
        if(!isObject(item)){
            return {ok: false, message: `Expected each item in the array to be an object`, errors:[{line:i+1, errors: "Not an object"}]};
        }
        logs.push(item);
      }  
      return {ok: true, format:"json-array", logs};
    }
    catch(e){
return {ok: false, message: "Failed to parse JSON array", errors:[{line:0, errors: (e as Error).message}]}; 
    }
    
}
const lines = text.split('/\r?\n/');
const rows: RawLog[] =[];
const errors: {line:number,errors:string}[]=[];
for(let i=0;i<lines.length;i++){
    const line= lines[i].trim();
    if(!line)
        continue;
    try{
        const parsedLine =JSON.parse(line);
        if(!isObject(parsedLine)){
            errors.push({line:i+1, errors:"Expected a JSON object"});
        continue;
        }
        rows.push(parsedLine)
    }
    catch(e){
        errors.push({line:i+1,errors:(e as Error).message});
    }
}
if(errors.length>0){
return {ok:false, message: "Failed to parse some lines as JSON", errors};
}
return{ok:true, format:"ndjson", logs: rows};
}