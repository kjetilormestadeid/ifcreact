import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useIfc, type IfcElement } from './IfcContext';

export interface BaseIfcElementProps {
  id?: string;
  children?: ReactNode;
  position?: { x: number; y: number; z: number };
  dimensions?: { width: number; height: number; depth: number };
  properties?: Record<string, unknown>;
}

export interface IfcElementComponentProps extends BaseIfcElementProps {
  type: string;
}

// Interface for props som overføres til barn via cloneElement
interface ChildElementProps {
  parent?: string;
  onMount?: (childId: string) => void;
  key?: React.Key;
}

export const BaseIfcElement = ({
  id: propId,
  type,
  children,
  position,
  dimensions,
  properties = {},
}: IfcElementComponentProps) => {
  const { addElement, removeElement, addChildToElement, updateElement } = useIfc();
  const isRegisteredRef = useRef(false);
  
  // Generer et unikt ID hvis ingen er oppgitt
  const id = useMemo(() => propId || `ifc-${type}-${uuidv4()}`, [propId, type]);
  
  useEffect(() => {
    // Opprett elementet i konteksten når komponenten rendres, men bare en gang
    if (isRegisteredRef.current) return;
    
    const element: IfcElement = {
      id,
      type,
      properties,
      position,
      dimensions,
      children: [],
    };
    
    addElement(element);
    isRegisteredRef.current = true;
    
    // Fjern elementet fra konteksten når komponenten avmonteres
    return () => {
      removeElement(id);
      isRegisteredRef.current = false;
    };
  }, [id, type, properties, position, dimensions, addElement, removeElement]);
  
  // Når props oppdateres, oppdater elementet i konteksten
  useEffect(() => {
    if (!isRegisteredRef.current) return;
    
    // Oppdater elementet hvis noen av props har endret seg
    updateElement(id, {
      properties,
      position,
      dimensions
    });
    
  }, [id, properties, position, dimensions, updateElement]);
  
  // Funksjon for å sikkert klone barneelements med riktige props
  const renderChildren = () => {
    if (!children) return null;
    
    if (Array.isArray(children)) {
      return children.map((child, index) => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          // Kopier child med parent-ID, bruk childId som key hvis tilgjengelig
          // eller bruk en unik-generert key for å unngå array-index som key
          const reactChild = child as React.ReactElement<any, any>;
          const childProps: ChildElementProps = {
            onMount: (childId: string) => {
              if (childId) {
                addChildToElement(id, childId);
              }
            },
            key: (reactChild.props.id as string) || `${id}-child-${index}-${uuidv4().slice(0, 8)}`
          };
          
          // Legg til parent-prop som en del av props som sendes til barnet
          if (id) {
            childProps.parent = id;
          }
          
          return React.cloneElement(child, childProps);
        }
        return child;
      });
    } else if (React.isValidElement(children) && typeof children.type !== 'string') {
      // Håndter enkelt barn
      const reactChild = children as React.ReactElement<any, any>;
      const childProps: ChildElementProps = {
        onMount: (childId: string) => {
          if (childId) {
            addChildToElement(id, childId);
          }
        },
        key: (reactChild.props.id as string) || `${id}-child-${uuidv4().slice(0, 8)}`
      };
      
      if (id) {
        childProps.parent = id;
      }
      
      return React.cloneElement(children, childProps);
    }
    
    // Returner barnet direkte hvis det ikke er React-element
    return children;
  };
  
  return <>{renderChildren()}</>;
};

export default BaseIfcElement; 