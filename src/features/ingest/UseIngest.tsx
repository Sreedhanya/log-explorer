import { useReducer } from "react";
import { parseLogText } from "./parse";
import { normalizeLogs } from "./normalize";
import type { NormalizedLog } from "./normalize";
export type IngestState =
  | { status: "idle" }
  | { status: "parsing"; fileName: string }
  | { status: "loaded"; fileName: string; textSize: number; logs: NormalizedLog[] }
  | { status: "error"; fileName: string; message: string };
type IngestAction =
  | { type: "START"; fileName: string }
  | { type: "SUCCESS"; fileName: string; textSize: number, logs: ReturnType<typeof normalizeLogs> }
  | { type: "ERROR"; fileName: string; message: string }
  | { type: "RESET" };
function ingestReducer(state: IngestState, action: IngestAction): IngestState {
  switch (action.type) {
    case "START":
      return { status: "parsing", fileName: action.fileName };
    case "SUCCESS":
      return {
        status: "loaded",
        fileName: action.fileName,
        textSize: action.textSize,
        logs: action.logs,
      };
    case "ERROR":
      return {
        status: "error",
        fileName: action.fileName,
        message: action.message,
      };
    case "RESET":
      return { status: "idle" };
    default:
      return state;
  }
}
export function useIngest() {
  const [state, dispatch] = useReducer(ingestReducer, {
    status: "idle",
  } as IngestState);
  const start = (filename: string) =>
    dispatch({ type: "START", fileName: filename });
  const reset = () => dispatch({ type: "RESET" });
  const ingestText = (text: string, fileName: string) => {
    start(fileName);
    try {
      const parsed = parseLogText(text);
      if (!parsed.ok) {
        dispatch({ type: "ERROR", fileName, message: parsed.message });
        return;
      }
      const normalizedLogs = normalizeLogs(parsed.logs);
      dispatch({ type: "SUCCESS", fileName, textSize: text.length, logs: normalizedLogs });
      console.log("Normalized logs", normalizedLogs);
    } catch (e) {
      dispatch({ type: "ERROR", fileName, message: (e as Error).message });
    }
  };
  return { state, ingestText, reset };
}
