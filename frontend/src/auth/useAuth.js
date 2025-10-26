import React, { useContext } from "react";

// 1. Create and export the context object
export const AuthContext = React.createContext();

// 2. Create and export the hook
export function useAuth() {
  return useContext(AuthContext);
}