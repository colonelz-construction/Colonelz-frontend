import { apiGetUserData } from '@/services/CrmService';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type ProfileFormModel = {
  username: string;
  email: string;
  title: string;
  avatar: string;
};

export const UserDetailsContext = createContext<ProfileFormModel | null>(null);

export const UserDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ProfileFormModel | null>(null);

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