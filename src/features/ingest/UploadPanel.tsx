type props ={
    onTextLoaded:(text: string, fileName: string)=> void;
};
export default function UploadPanel({onTextLoaded}: props){
    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
if(!file) return;
const text = await file.text();
onTextLoaded(text, file.name);
e.target.value="";
    }
    return(
<div style ={{
    padding:"12px", border:"1 px solid #ddd", borderRadius:8
}}>
    <div style={{fontWeight:600, marginBottom:8}}>Upload Log File</div>
<input type="file" accept=".json,.ndjson,text/plain,application/json"
onChange={handleFileChange}>
    </input>
    <div style={{marginTop: 8, fontSize:12 , opacity:0.8}}>
        </div>
    </div>
    )
}