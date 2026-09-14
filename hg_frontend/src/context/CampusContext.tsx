import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Campus {
  id: string;
  name: string;
  code: string;
}

export const DEFAULT_CAMPUSES: Campus[] = [
  { id: 'futa-main', name: 'FUTA — Akure Main Campus', code: 'futa' },
  { id: 'unilag-main', name: 'UNILAG — Akoka Campus', code: 'unilag' },
  { id: 'oau-main', name: 'OAU — Ile-Ife Campus', code: 'oau' },
];

interface CampusContextType {
  selectedCampus: Campus;
  setSelectedCampus: (campus: Campus) => void;
  campuses: Campus[];
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
}

const CampusContext = createContext<CampusContextType>({
  selectedCampus: DEFAULT_CAMPUSES[0],
  setSelectedCampus: () => {},
  campuses: DEFAULT_CAMPUSES,
  isSelectorOpen: false,
  setIsSelectorOpen: () => {},
});

export const CampusProvider = ({ children }: { children: React.ReactNode }) => {
  const [campuses] = useState<Campus[]>(DEFAULT_CAMPUSES);
  const [selectedCampus, setSelectedCampusState] = useState<Campus>(DEFAULT_CAMPUSES[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hg_selected_campus_id');
      if (saved) {
        const found = campuses.find((c) => c.id === saved);
        if (found) setSelectedCampusState(found);
      }
    }
  }, [campuses]);

  const setSelectedCampus = (campus: Campus) => {
    setSelectedCampusState(campus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hg_selected_campus_id', campus.id);
    }
  };

  return (
    <CampusContext.Provider value={{ selectedCampus, setSelectedCampus, campuses, isSelectorOpen, setIsSelectorOpen }}>
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => useContext(CampusContext);
