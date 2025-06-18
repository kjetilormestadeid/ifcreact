import React from 'react';
import BaseIfcElement, { BaseIfcElementProps } from './BaseIfcElement';

// Bygningselementer
export const IfcBuilding: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcBuilding" {...props} />;
};

export const IfcBuildingStorey: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcBuildingStorey" {...props} />;
};

export const IfcSite: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcSite" {...props} />;
};

export const IfcSpace: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcSpace" {...props} />;
};

// Konstruksjonselementer
export const IfcWall: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcWall" {...props} />;
};

export const IfcWallStandardCase: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcWallStandardCase" {...props} />;
};

export const IfcBeam: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcBeam" {...props} />;
};

export const IfcColumn: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcColumn" {...props} />;
};

export const IfcSlab: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcSlab" {...props} />;
};

export const IfcRoof: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcRoof" {...props} />;
};

export const IfcCurtainWall: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcCurtainWall" {...props} />;
};

export const IfcFooting: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcFooting" {...props} />;
};

export const IfcPile: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcPile" {...props} />;
};

export const IfcProject: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcProject" {...props} />;
};

// Åpningselementer
export const IfcWindow: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcWindow" {...props} />;
};

export const IfcDoor: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcDoor" {...props} />;
};

export const IfcOpeningElement: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcOpeningElement" {...props} />;
};

// Distribusjons- og tekniske elementer
export const IfcDistributionElement: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcDistributionElement" {...props} />;
};

export const IfcFlowTerminal: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcFlowTerminal" {...props} />;
};

// Møblering og utstyr
export const IfcFurnishingElement: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcFurnishingElement" {...props} />;
};

export const IfcSanitaryTerminal: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcSanitaryTerminal" {...props} />;
};

// Rommøblering
export const IfcFurniture: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcFurniture" {...props} />;
};

// Veggelementer
export const IfcCovering: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcCovering" {...props} />;
};

// Transport
export const IfcTransportElement: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcTransportElement" {...props} />;
};

export const IfcStair: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcStair" {...props} />;
};

export const IfcRamp: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcRamp" {...props} />;
};

// Gruppe og samling
export const IfcElementAssembly: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcElementAssembly" {...props} />;
};

export const IfcSystem: React.FC<BaseIfcElementProps> = (props) => {
  return <BaseIfcElement type="IfcSystem" {...props} />;
}; 