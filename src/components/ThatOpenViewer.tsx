import { useEffect, useRef, useState, type FC, useCallback, useMemo } from 'react';
import { useIfc } from './ifc/IfcContext';
import { 
  initializeThatOpen, 
  convertIfcToThatOpen, 
  convertReactModelToIfcExport, 
  exportToIfc 
} from '../converters/IfcToThatOpen';

interface ThatOpenViewerProps {
  width?: string | number;
  height?: string | number;
}

// Vi bruker unknown for verdenen siden den eksakte strukturen er kompleks
type ThatOpenWorld = unknown;

const ThatOpenViewer: FC<ThatOpenViewerProps> = ({ 
  width = '100%', 
  height = 600 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<ThatOpenWorld | null>(null);
  const { model } = useIfc();
  const [ifcExport, setIfcExport] = useState<string>('');
  const [isExportReady, setIsExportReady] = useState<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  const [modelState, setModelState] = useState<string>("Ingen modelldata");
  
  // Spor modellendringer for å unngå unødvendige oppdateringer
  const lastModelChecksumRef = useRef<string>("");
  const isModelProcessingRef = useRef<boolean>(false);

  // Genererer en enkel checksum for å detektere endringer
  const calculateModelChecksum = useCallback(() => {
    const elementIds = Object.keys(model.elements).sort().join(',');
    return elementIds;
  }, [model.elements]);

  // Memorisert checksum og element-status
  const modelData = useMemo(() => {
    const checksum = calculateModelChecksum();
    const elementCount = Object.keys(model.elements).length;
    const hasElementsValue = elementCount > 0;
    
    return {
      checksum,
      elementCount,
      hasElements: hasElementsValue
    };
  }, [calculateModelChecksum, model.elements]);

  // Logg modelldata for debugging - men bare når den faktisk endres
  useEffect(() => {
    // Hvis checksummen er uendret, gjør ingenting
    if (modelData.checksum === lastModelChecksumRef.current) return;
    
    // Unngå å logge tomme modeller gjentatte ganger
    if (!modelData.hasElements && lastModelChecksumRef.current === "") return;
    
    console.log("IFC-modelldata oppdatert:", model);
    setModelState(`Modell lastet: ${modelData.elementCount} elementer`);
    
    // Oppdater checksum etter prosessering
    lastModelChecksumRef.current = modelData.checksum;
  }, [modelData, model]);

  // Initialiser ThatOpen bare en gang
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    
    try {
      console.log("Initialiserer ThatOpen Viewer...");
      const { world } = initializeThatOpen(containerRef.current);
      worldRef.current = world;
      isInitializedRef.current = true;
      console.log("ThatOpen initialisert", world);
    } catch (error) {
      console.error('Feil ved initialisering av ThatOpen:', error);
      setModelState("Feil ved initialisering av viewer");
    }
    
    return () => {
      // Opprydding ved unmounting
      isInitializedRef.current = false;
      worldRef.current = null;
    };
  }, []);

  // Oppdater scene kun når modellen faktisk er endret
  useEffect(() => {
    // Tidlig retur hvis ingen elementer å konvertere
    if (!modelData.hasElements) {
      if (lastModelChecksumRef.current !== "") {
        // Bare oppdater status hvis dette er en endring fra tidligere
        console.log("Ingen elementer å konvertere");
        setModelState("Ingen bygningselementer funnet");
        lastModelChecksumRef.current = "";
      }
      return;
    }
    
    if (!isInitializedRef.current || !worldRef.current || 
        isModelProcessingRef.current || 
        modelData.checksum === lastModelChecksumRef.current) {
      return;
    }
    
    try {
      // Marker at prosessering pågår for å unngå doble kall
      isModelProcessingRef.current = true;
      
      console.log(`Konverterer ${modelData.elementCount} IFC-elementer...`);
      
      // Konverter IFC-modellen til ThatOpen-format
      convertIfcToThatOpen(worldRef.current, model.elements);
      setModelState(`Modell konvertert: ${modelData.elementCount} elementer`);
      
      // Generer IFC eksport
      const exportData = convertReactModelToIfcExport(model.elements);
      const ifcContent = exportToIfc(exportData);
      setIfcExport(ifcContent);
      setIsExportReady(true);
      
      // Oppdater checksum etter vellykket prosessering
      lastModelChecksumRef.current = modelData.checksum;
    } catch (error) {
      console.error('Feil ved konvertering av IFC-modell:', error);
      setIsExportReady(false);
      setModelState("Feil ved konvertering av modell");
    } finally {
      // Avslutt prosesseringsmarkering
      isModelProcessingRef.current = false;
    }
  }, [modelData, model.elements]);
  
  const downloadIfc = () => {
    if (!isExportReady) return;
    
    const blob = new Blob([ifcExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ifcreact_export.ifc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ padding: '10px', backgroundColor: '#e9f5ff', borderRadius: '4px', marginBottom: '10px' }}>
        <p>{modelState}</p>
      </div>
      <div 
        ref={containerRef} 
        style={{ 
          width, 
          height, 
          backgroundColor: '#f0f0f0', 
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <button
          onClick={downloadIfc}
          disabled={!isExportReady}
          type="button"
          style={{
            padding: '8px 16px',
            backgroundColor: isExportReady ? '#4285f4' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isExportReady ? 'pointer' : 'not-allowed'
          }}
        >
          Last ned IFC-fil
        </button>
        <span style={{ color: '#666', fontSize: '14px' }}>
          Bygget med ThatOpen Engine Components
        </span>
      </div>
    </div>
  );
};

export default ThatOpenViewer; 