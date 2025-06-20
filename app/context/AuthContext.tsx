import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  telephne: any | null;
  isConnected: boolean;
  setTelephone: (telephne: any) => void;
  setIsConnected: (isConnected: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  telephne: null,
  isConnected: true,
  setTelephone: () => {},
  setIsConnected: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [telephne, setTelephone] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const gettelephneData = async () => {
      try {
        const storedTelephne = await AsyncStorage.getItem("telephne");
        setTelephone(storedTelephne ? JSON.parse(storedTelephne) : null);
        setIsConnected(storedTelephne ? true : false);
      } catch (error) {
        console.error("Error lors de la récuperation des données:", error);
      }
    };

    gettelephneData();
  }, []);

  const values = {
    telephne,
    isConnected,
    setTelephone,
    setIsConnected,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}
