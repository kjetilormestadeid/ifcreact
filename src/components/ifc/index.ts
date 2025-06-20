// Eksporter kontekst
export { IfcProvider, useIfc } from './IfcContext';
export type { IfcElement } from './IfcContext';

// Eksporter basiskomponent
export { default as BaseIfcElement } from './BaseIfcElement';
export type { BaseIfcElementProps, IfcElementComponentProps } from './BaseIfcElement';

// Eksporter viewere
export { default as IfcViewer } from './IfcViewer';
export { default as IfcViewer3D } from './IfcViewer3D';

// Eksporter alle IFC-komponenter
export {
  // Bygningselementer
  IfcBuilding,
  IfcBuildingStorey,
  IfcSite,
  IfcSpace,
  
  // Konstruksjonselementer
  IfcWall,
  IfcWallStandardCase,
  IfcBeam,
  IfcColumn,
  IfcSlab,
  IfcRoof,
  IfcCurtainWall,
  IfcFooting,
  IfcPile,
  IfcProject,
  
  // Åpningselementer
  IfcWindow,
  IfcDoor,
  IfcOpeningElement,
  
  // Distribusjons- og tekniske elementer
  IfcDistributionElement,
  IfcFlowTerminal,
  
  // Møblering og utstyr
  IfcFurnishingElement,
  IfcSanitaryTerminal,
  IfcFurniture,
  
  // Veggelementer
  IfcCovering,
  
  // Transport
  IfcTransportElement,
  IfcStair,
  IfcRamp,
  
  // Gruppe og samling
  IfcElementAssembly,
  IfcSystem
} from './IfcComponents';
