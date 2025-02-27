'use client'
 
import { createContext, useContext } from 'react';
 
const UserContext = createContext(null)
 
export function UserProvider({ children, userPromise}) {
  
    return (
    <UserContext.Provider value={userPromise}> {children} </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}