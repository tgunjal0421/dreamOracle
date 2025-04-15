// Function to get auth headers for API requests
import { useAuth } from '@clerk/clerk-react';

export const getAuthHeaders = async () => {
  const token = await window.Clerk?.session?.getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useAuthHeaders = () => {
  const { getToken } = useAuth();
  
  const getHeaders = async () => {
    const token = await getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  return getHeaders;
};
