import { useRealtimeContext } from "../contexts/RealtimeContext";

export function useRealtimeStatus() {
  return useRealtimeContext();
}
