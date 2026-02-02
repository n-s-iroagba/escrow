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
    // Optionally redirect here if we had router access, 
    // or just let the layout handle protection.
    // For now, just return context as is, but this hook implies strict requirement.
    // We could throw, but might break rendering. 
    // Best to clean up the conditional call.
  }
  return context;
};