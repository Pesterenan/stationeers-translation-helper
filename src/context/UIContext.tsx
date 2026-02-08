import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type DialogType = 'GOTO_PAGE' | 'METADATA' | null;

interface UIContextType {
  activeDialog: DialogType;
  openDialog: (type: DialogType) => void;
  closeDialog: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const openDialog = useCallback((type: DialogType) => setActiveDialog(type), []);
  const closeDialog = useCallback(() => setActiveDialog(null), []);

  return (
    <UIContext.Provider value={{ activeDialog, openDialog, closeDialog }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUIContext must be used within UIProvider');
  return context;
}
