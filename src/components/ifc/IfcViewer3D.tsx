import { useEffect, useRef } from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useIfc } from './IfcContext';
import type { IfcElement } from './IfcContext';

interface IfcViewer3DProps {
  width?: number | string;
  height?: number | string;
}

const IfcViewer3D = ({ width = '100%', height = 600 }: IfcViewer3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);
  
  const { model } = useIfc();

  // Initialiser Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    // Opprett scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Oppsett av kamera
    const camera = new THREE.PerspectiveCamera(
      75,
      (containerRef.current.clientWidth || 1) / (containerRef.current.clientHeight || 1),
      0.1,
      1000
    );
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Oppsett av renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth || 1,
      containerRef.current.clientHeight || 1
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Legg til kontroller
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controlsRef.current = controls;

    // Legg til lys
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Legg til koordinatsystem
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Legg til rutenett
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);

    // Render-funksjon
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start render-loop
    animate();

    // Håndter vindusendringer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Opprydding
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        // Rydd opp i scenen
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose();
            }
            
            if (object.material) {
              if (Array.isArray(object.material)) {
                for (const material of object.material) {
                  material.dispose();
                }
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
    };
  }, []);

  // Oppdater scenen når modellen endres
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Fjern eksisterende IFC-elementer
    const elementsToRemove: THREE.Object3D[] = [];
    sceneRef.current.traverse((object) => {
      if (object.userData?.isIfcElement) {
        elementsToRemove.push(object);
      }
    });
    
    for (const element of elementsToRemove) {
      sceneRef.current.remove(element);
      
      if (element instanceof THREE.Mesh) {
        if (element.geometry) {
          element.geometry.dispose();
        }
        
        if (element.material) {
          if (Array.isArray(element.material)) {
            for (const material of element.material) {
              material.dispose();
            }
          } else {
            element.material.dispose();
          }
        }
      }
    }
    
    // Legg til nye elementer fra modellen
    const elementsArray = Object.values(model.elements);
    
    for (const element of elementsArray) {
      const mesh = createMeshFromElement(element);
      if (mesh) {
        sceneRef.current.add(mesh);
      }
    }
    
  }, [model]);

  // Funksjon for å opprette 3D-mesh fra IFC-elementer
  const createMeshFromElement = (element: IfcElement): THREE.Mesh | null => {
    if (!sceneRef.current) return null;
    
    const position = element.position || { x: 0, y: 0, z: 0 };
    const dimensions = element.dimensions || { width: 1, height: 1, depth: 1 };
    
    // Opprett geometri basert på elementtype
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    switch (element.type) {
      case 'IfcWall':
      case 'IfcWallStandardCase':
        geometry = new THREE.BoxGeometry(
          dimensions.width || 1,
          dimensions.height || 3,
          dimensions.depth || 0.3
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0xcccccc,
          roughness: 0.7
        });
        break;
        
      case 'IfcWindow':
        geometry = new THREE.BoxGeometry(
          dimensions.width || 1.2,
          dimensions.height || 1.2,
          dimensions.depth || 0.1
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0x88ccff,
          transparent: true,
          opacity: 0.6,
          roughness: 0.1,
          metalness: 0.2
        });
        break;
        
      case 'IfcDoor':
        geometry = new THREE.BoxGeometry(
          dimensions.width || 1,
          dimensions.height || 2.1,
          dimensions.depth || 0.1
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0x8b4513,
          roughness: 0.8 
        });
        break;
        
      case 'IfcSlab':
        geometry = new THREE.BoxGeometry(
          dimensions.width || 5,
          dimensions.height || 0.3,
          dimensions.depth || 5
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0xaaaaaa,
          roughness: 0.5 
        });
        break;
        
      case 'IfcColumn':
        geometry = new THREE.CylinderGeometry(
          dimensions.width / 2 || 0.15,
          dimensions.width / 2 || 0.15,
          dimensions.height || 3,
          16
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0x888888,
          roughness: 0.6 
        });
        break;
        
      case 'IfcRoof':
        // Forenklet tak-geometri - bare et skråstilt rektangel
        geometry = new THREE.BoxGeometry(
          dimensions.width || 5,
          dimensions.height || 0.2,
          dimensions.depth || 5
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0xdd4444,
          roughness: 0.7 
        });
        break;
        
      default:
        // Standard boks for andre elementer
        geometry = new THREE.BoxGeometry(
          dimensions.width || 1,
          dimensions.height || 1,
          dimensions.depth || 1
        );
        material = new THREE.MeshStandardMaterial({ 
          color: 0x999999,
          roughness: 0.6 
        });
    }
    
    // Opprett mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Sett posisjon
    mesh.position.set(position.x, position.y, position.z);
    
    // Legg til metadata for senere referanse
    mesh.userData = {
      isIfcElement: true,
      ifcId: element.id,
      ifcType: element.type,
      properties: element.properties
    };
    
    return mesh;
  };

  return (
    <div className="ifc-viewer3d-container">
      <h3>IFC 3D-modellvisning</h3>
      <div 
        ref={containerRef}
        style={{ 
          width, 
          height, 
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />
      <p className="viewer-info">
        3D-visning basert på Three.js. 
        Bruk mushjulet for å zoome, høyreklikk for å panorere, og venstreklikk+dra for å rotere.
      </p>
    </div>
  );
};

export default IfcViewer3D; 