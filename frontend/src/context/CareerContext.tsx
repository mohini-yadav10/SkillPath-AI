import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CareerTarget {
  roleId: string | null;
  roleName: string | null;
  companyId: string | null;
  companyName: string | null;
  requiredSkills: string[];
}

interface CareerContextType {
  target: CareerTarget | null;
  loading: boolean;
  refetchTarget: () => Promise<void>;
  hasTarget: boolean;
}

const CareerContext = createContext<CareerContextType>({
  target: null,
  loading: true,
  refetchTarget: async () => {},
  hasTarget: false
});

export const CareerProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [target, setTarget] = useState<CareerTarget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTarget = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get('http://localhost:5000/api/career/target', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.data) {
        setTarget(res.data.data);
      } else {
        setTarget(null);
      }
    } catch (error) {
      console.error('Failed to fetch career target:', error);
      setTarget(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTarget();
    } else {
      setTarget(null);
      setLoading(false);
    }
  }, [user]);

  const hasTarget = !!(target && target.roleId);

  return (
    <CareerContext.Provider value={{ target, loading, refetchTarget: fetchTarget, hasTarget }}>
      {children}
    </CareerContext.Provider>
  );
};

export const useCareerTarget = () => useContext(CareerContext);
