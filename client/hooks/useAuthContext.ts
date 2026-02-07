import { useContext, useEffect } from "react";
import { AuthContext } from "../lib/context/AuthContext";

export const useAuthContext = (shouldFetch: boolean) => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  // Trigger auth check when hook is consumed/mounted
  useEffect(() => {
    context.checkAuth(shouldFetch);
  }, [context]);

  return context;
};

export const useRequiredAuth = () => {
  const context = useAuthContext(true);
  if (!context.user) {
    return useAuthContext(true)
  }
  return context;
};