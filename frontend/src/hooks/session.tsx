import React, { useState } from "react";

interface SessionState {
  currentCourse?: number;
  currentTrackedList?: number;
}

interface SessionContext {
  session: SessionState;
  setSession: (newSessionValues: Partial<SessionState>) => void;
}

const SessionContext = React.createContext<SessionContext>({
  session: {
    currentCourse: undefined,
    currentTrackedList: undefined,
  },
} as SessionContext);

const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionState>({
    currentCourse: undefined,
    currentTrackedList: undefined,
  });
  // NOTE 19/03/20 psacawa: immutable only for shallow state
  // some wrapper that is simpler to use
  const modifySession = (newStateValues: Partial<SessionState>) => {
    // console.log (`newStateValues: ${newStateValues}`)
    setSession((session: SessionState) => ({ ...session, ...newStateValues }));
  };
  return (
    <SessionContext.Provider value={{ session, setSession: modifySession }}>
      {children}
    </SessionContext.Provider>
  );
};

const useSession = () => {
  const context = React.useContext(SessionContext);
  if (context === undefined) {
    throw new Error("Must use SessionContext within SessionProvider");
  }
  return context;
};

export { SessionProvider, useSession };
