import { apiGetUserData } from '@/services/CrmService';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export type ProfileFormModel = {
  data: Data
};

type Data = {
  username: string;
  email: string;
  title: string;
  avatar: string;
}

export const UserDetailsContext = createContext<Data | null>(null);

export const UserDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await apiGetUserData(localStorage.getItem('userId'));
        setData(userData.data);  
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserDetailsContext.Provider value={data}>
      {children}
    </UserDetailsContext.Provider>
  );
};