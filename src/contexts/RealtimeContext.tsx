import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export interface RealtimeState {
  isConnected: boolean;
  connectionCount: number;
  connectionStatus: string;
}

interface RealtimeContextType extends RealtimeState {
  setRealtimeState: (state: Partial<RealtimeState>) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    connectionCount: 0,
    connectionStatus: "INITIALIZING",
  });

  const setRealtimeState = useCallback((newState: Partial<RealtimeState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setRealtimeState,
    }),
    [state, setRealtimeState]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error(
      "useRealtimeContext must be used within a RealtimeProvider"
    );
  }
  return context;
}
