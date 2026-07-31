import React, { createContext, useState, useContext } from 'react';

interface DataContextType {
  dataImported: boolean;
  setDataImported: (value: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataImported, setDataImported] = useState(false);

  return (
    <DataContext.Provider value={{ dataImported, setDataImported }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
