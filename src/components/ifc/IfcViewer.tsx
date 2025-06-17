import React, { useEffect, useRef } from 'react';
import { useIfc } from './IfcContext';

interface IfcViewerProps {
  width?: number;
  height?: number;
}

// En enkel komponent for å visualisere IFC-modellen
const IfcViewer: React.FC<IfcViewerProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { model } = useIfc();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Tøm canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sett opp transformasjon
    const scale = 10; // Skala for å gjøre modellen synlig
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;
    
    // Tegn en enkel bakgrunn
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Tegn et rutenett
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Horisontale linjer
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertikale linjer
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Tegn akser
    ctx.lineWidth = 2;
    
    // X-akse (rød)
    ctx.strokeStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX + 100, offsetY);
    ctx.stroke();
    
    // Y-akse (grønn)
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX, offsetY - 100);
    ctx.stroke();
    
    // Z-akse (blå)
    ctx.strokeStyle = '#0000ff';
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX + 70, offsetY - 70);
    ctx.stroke();
    
    // Tegn elementer
    ctx.lineWidth = 2;
    
    const elements = Object.values(model.elements);
    
    elements.forEach(element => {
      // Hent posisjon eller bruk standard
      const pos = element.position || { x: 0, y: 0, z: 0 };
      const dims = element.dimensions || { width: 1, height: 1, depth: 1 };
      
      // Konverter 3D til 2D-projeksjon (enkel isometrisk)
      const x = offsetX + (pos.x - pos.z) * scale;
      const y = offsetY - (pos.y + (pos.x + pos.z) / 2) * scale;
      
      // Ulike farger basert på elementtype
      switch (element.type) {
        case 'IfcWall':
          ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
          break;
        case 'IfcWindow':
          ctx.fillStyle = 'rgba(150, 200, 255, 0.6)';
          break;
        case 'IfcDoor':
          ctx.fillStyle = 'rgba(150, 100, 50, 0.8)';
          break;
        case 'IfcSlab':
          ctx.fillStyle = 'rgba(180, 180, 180, 0.8)';
          break;
        case 'IfcColumn':
          ctx.fillStyle = 'rgba(120, 120, 120, 0.9)';
          break;
        case 'IfcRoof':
          ctx.fillStyle = 'rgba(220, 100, 100, 0.8)';
          break;
        default:
          ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      }
      
      // Tegn element (enkel rektangel)
      ctx.strokeStyle = '#333';
      ctx.fillRect(
        x - (dims.width * scale) / 2, 
        y - (dims.height * scale) / 2,
        dims.width * scale,
        dims.height * scale
      );
      ctx.strokeRect(
        x - (dims.width * scale) / 2, 
        y - (dims.height * scale) / 2,
        dims.width * scale,
        dims.height * scale
      );
      
      // Legg til elementnavn
      if (element.properties.name) {
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.fillText(
          element.properties.name as string,
          x,
          y
        );
      }
    });
    
  }, [model, width, height]);
  
  return (
    <div className="ifc-viewer-container">
      <h3>IFC-modellvisning (forenklet 2D)</h3>
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc' }}
      />
      <p className="viewer-info">
        Dette er en forenklet 2D-visning av IFC-modellen. For en fullstendig 3D-visning,
        bruk et egnet bibliotek som Three.js sammen med IFC.js.
      </p>
    </div>
  );
};

export default IfcViewer; 