import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

// Definisjon av IFC-modellens tilstand
interface IfcModelState {
  elements: Record<string, IfcElement>;
}

// Definisjon av et IFC-element
export interface IfcElement {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  position?: { x: number; y: number; z: number };
  dimensions?: { width: number; height: number; depth: number };
  children?: string[]; // Referanser til barn-elementers IDer
  parent?: string; // Referanse til forelder-elementets ID
}

interface IfcContextProps {
  model: IfcModelState;
  addElement: (element: IfcElement) => void;
  updateElement: (id: string, updates: Partial<IfcElement>) => void;
  removeElement: (id: string) => void;
  getElement: (id: string) => IfcElement | undefined;
  addChildToElement: (parentId: string, childId: string) => void;
}

const IfcContext = createContext<IfcContextProps | undefined>(undefined);

interface IfcProviderProps {
  children: ReactNode;
}

export const IfcProvider = ({ children }: IfcProviderProps) => {
  const [model, setModel] = useState<IfcModelState>({ elements: {} });

  const addElement = useCallback((element: IfcElement) => {
    setModel(prevModel => {
      if (prevModel.elements[element.id]) return prevModel;

      return {
        ...prevModel,
        elements: {
          ...prevModel.elements,
          [element.id]: element
        }
      };
    });
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<IfcElement>) => {
    setModel(prevModel => {
      if (!prevModel.elements[id]) return prevModel;
      
      return {
        ...prevModel,
        elements: {
          ...prevModel.elements,
          [id]: {
            ...prevModel.elements[id],
            ...updates
          }
        }
      };
    });
  }, []);

  const removeElement = useCallback((id: string) => {
    setModel(prevModel => {
      if (!prevModel.elements[id]) return prevModel;

      // Destrukturer for å skille elementet som skal fjernes fra resten
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: removed, ...rest } = prevModel.elements;

      return {
        ...prevModel,
        elements: rest
      };
    });
  }, []);

  const getElement = useCallback((id: string) => {
    return model.elements[id];
  }, [model.elements]);

  const addChildToElement = useCallback((parentId: string, childId: string) => {
    setModel(prevModel => {
      if (!prevModel.elements[parentId] || !prevModel.elements[childId]) {
        return prevModel;
      }

      const parent = prevModel.elements[parentId];
      if (parent.children?.includes(childId)) return prevModel;

      return {
        ...prevModel,
        elements: {
          ...prevModel.elements,
          [parentId]: {
            ...prevModel.elements[parentId],
            children: [...(prevModel.elements[parentId].children || []), childId]
          },
          [childId]: {
            ...prevModel.elements[childId],
            parent: parentId
          }
        }
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      model,
      addElement,
      updateElement,
      removeElement,
      getElement,
      addChildToElement
    }),
    [model, addElement, updateElement, removeElement, getElement, addChildToElement]
  );

  return (
    <IfcContext.Provider value={value}>
      {children}
    </IfcContext.Provider>
  );
};

export const useIfc = (): IfcContextProps => {
  const context = useContext(IfcContext);
  if (!context) {
    throw new Error('useIfc må brukes innenfor en IfcProvider');
  }
  return context;
}; 