import { useContext } from "react";
import { AuthContext } from "../lib/context/AuthContext";

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
export const useRequiredAuth = () => {
  const context = useAuthContext();
  if (!context.user) {
    return useAuthContext()
  }
  return context
};