import { v4 as uuidv4 } from 'uuid';
import * as OBC from '@thatopen/components';
import type { IfcElement } from '../components/ifc/IfcContext';
import * as THREE from 'three';

// Definerer typer for IFC eksport
export interface IfcExportData {
  header: {
    file_name: string;
    file_description: string;
    schema_identifiers: string[];
    time_stamp: string;
    author: string;
    organization: string;
    preprocessor_version: string;
    originating_system: string;
    authorization: string;
  };
  elements: IfcEntity[];
}

interface IfcEntity {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  position?: { x: number; y: number; z: number };
  dimensions?: { width: number; height: number; depth: number };
  children?: string[];
  parent?: string;
  geometry?: unknown; // Geometri-informasjon
}

// Definerer typer for ThatOpen-spesifikke strukturer

// Konverterer React IFC-modell til IFC eksportformat
export function convertReactModelToIfcExport(
  elements: Record<string, IfcElement>
): IfcExportData {
  const now = new Date();
  const timeStamp = now.toISOString();

  // Opprett header
  const header = {
    file_name: 'export.ifc',
    file_description: 'IFC-modell generert fra React komponenter',
    schema_identifiers: ['IFC4'],
    time_stamp: timeStamp,
    author: 'IfcReact',
    organization: 'IfcReact',
    preprocessor_version: '1.0',
    originating_system: 'IfcReact',
    authorization: 'None',
  };

  // Konverter elementer
  const exportElements: IfcEntity[] = Object.values(elements).map((element) => ({
    id: element.id,
    type: element.type,
    properties: element.properties,
    position: element.position,
    dimensions: element.dimensions,
    children: element.children,
    parent: element.parent,
  }));

  console.log(`Konvertert ${exportElements.length} elementer til IFC-format`);
  return {
    header,
    elements: exportElements,
  };
}

// Initialiserer ThatOpen Components
export function initializeThatOpen(container: HTMLElement) {
  // Forsøk å rydde opp hvis det finnes et canvas-element fra tidligere
  const existingCanvas = container.querySelector('canvas');
  if (existingCanvas) {
    container.removeChild(existingCanvas);
  }

  // Initialiserer ny instans av ThatOpen Components
  console.log("Initialiserer ThatOpen Components...");
  const components = new OBC.Components();

  try {
    const worlds = components.get(OBC.Worlds);
    
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.SimpleCamera(components);

    components.init();

    // Sett opp scene
    world.scene.setup();
    world.camera.controls.setLookAt(30, 30, 30, 0, 0, 0);

    // Legg til lys for bedre visualisering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    world.scene.three.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 30);
    world.scene.three.add(directionalLight);

    // Legg til et rutenett for å se skalaen
    const grid = new THREE.GridHelper(100, 100);
    world.scene.three.add(grid);

    console.log("ThatOpen initialisert vellykket");
    return { components, world };
  } catch (error) {
    console.error("Feil ved initialisering av ThatOpen:", error);
    throw error;
  }
}

// Konverterer IFC-elementene til ThatOpen geometri
export function convertIfcToThatOpen(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  world: any, // Bruker 'any' for å unngå typeproblemer med ThatOpen Components
  elements: Record<string, IfcElement>
) {
  if (!world || !world.scene || !world.scene.three) {
    console.error('Ugyldig ThatOpen-verden');
    return;
  }

  // Fjern eksisterende elementer først
  const existingObjects: THREE.Object3D[] = [];
  world.scene.three.traverse((object: THREE.Object3D) => {
    if (object.userData && object.userData.ifcId) {
      existingObjects.push(object);
    }
  });

  for (const object of existingObjects) {
    world.scene.three.remove(object);
    if (object instanceof THREE.Mesh) {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  }

  // Legg til nye elementer
  console.log(`Konverterer ${Object.keys(elements).length} IFC-elementer til 3D-geometri...`);
  const elementValues = Object.values(elements);
  const rootElements = elementValues.filter(
    (element) => !element.parent || !elements[element.parent]
  );

  console.log(`Fant ${rootElements.length} rot-elementer`);

  // Behandle elementer rekursivt, start med rot-elementene
  for (const rootElement of rootElements) {
    processElement(world, elements, rootElement);
  }

  console.log("Konvertering fullført");
}

// Definer posisjon og dimensjon typer
interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface Dimensions3D {
  width: number;
  height: number;
  depth: number;
}

// Prosesserer et element og dets barn rekursivt
function processElement(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  world: any, // Bruker 'any' for å unngå typeproblemer
  allElements: Record<string, IfcElement>,
  element: IfcElement,
  parentTransform = { x: 0, y: 0, z: 0 }
) {
  const position = element.position || { x: 0, y: 0, z: 0 };
  const dimensions = element.dimensions || { width: 1, height: 1, depth: 1 };
  
  // Beregn absolutt posisjon basert på forelderens transformasjon
  const absPosition = {
    x: parentTransform.x + position.x,
    y: parentTransform.y + position.y,
    z: parentTransform.z + position.z,
  };

  // Opprett geometri basert på elementtype
  createGeometry(world, element, absPosition, dimensions);

  // Behandle barnelementer rekursivt
  if (element.children && element.children.length > 0) {
    console.log(`Element ${element.type} (${element.id}) har ${element.children.length} barn`);
    for (const childId of element.children) {
      const childElement = allElements[childId];
      if (childElement) {
        processElement(world, allElements, childElement, absPosition);
      } else {
        console.warn(`Barn-element med ID ${childId} ble ikke funnet`);
      }
    }
  }
}

// Oppretter geometri for et element basert på type
function createGeometry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  world: any, // Bruker 'any' for å unngå typeproblemer
  element: IfcElement,
  position: Position3D,
  dimensions: Dimensions3D
) {
  let mesh: THREE.Mesh | null = null;

  console.log(`Oppretter geometri for ${element.type} på posisjon [${position.x}, ${position.y}, ${position.z}]`);

  switch (element.type) {
    case 'IfcWall':
    case 'IfcWallStandardCase':
      mesh = createWall(position, dimensions);
      break;
    case 'IfcSlab':
      mesh = createSlab(position, dimensions);
      break;
    case 'IfcWindow':
      mesh = createWindow(position, dimensions);
      break;
    case 'IfcDoor':
      mesh = createDoor(position, dimensions);
      break;
    case 'IfcColumn':
      mesh = createColumn(position, dimensions);
      break;
    case 'IfcRoof':
      mesh = createRoof(position, dimensions);
      break;
    case 'IfcSite':
      mesh = createSite(position, dimensions);
      break;
    case 'IfcBuilding':
      mesh = createBuilding(position, dimensions);
      break;
    case 'IfcBuildingStorey':
      mesh = createBuildingStorey(position, dimensions);
      break;
    case 'IfcSpace':
      mesh = createSpace(position, dimensions);
      break;
    default:
      // For andre elementer, opprett en enkel boks
      mesh = createDefaultElement(position, dimensions);
  }

  if (mesh && world.scene && world.scene.three) {
    mesh.userData = {
      ifcType: element.type,
      ifcId: element.id,
      properties: element.properties,
    };
    
    world.scene.three.add(mesh);
  }
}

// Hjelpefunksjoner for å opprette spesifikke geometrier
function createWall(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc,
    roughness: 0.7
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

function createSlab(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa,
    roughness: 0.5
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

function createWindow(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

function createDoor(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x8b4513,
    roughness: 0.8
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

function createColumn(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    roughness: 0.5
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

function createRoof(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  // For tak, opprett en enkel boks først
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x664422,
    roughness: 0.7
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

function createSite(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  // For tomt, vi oppretter et stort flatt område
  const siteDimensions = dimensions.width > 10 && dimensions.depth > 10 
    ? { width: dimensions.width, height: 0.1, depth: dimensions.depth }
    : { width: 100, height: 0.1, depth: 100 };
    
  const geometry = new THREE.BoxGeometry(
    siteDimensions.width,
    siteDimensions.height,
    siteDimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x7cad6d, // Grønn farge for tomt
    roughness: 0.9
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y - 0.05, position.z);
  return mesh;
}

function createBuilding(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  // Building er ofte bare en logisk container, så vi lager en nesten usynlig representasjon
  const geometry = new THREE.BoxGeometry(
    dimensions.width || 1,
    dimensions.height || 1,
    dimensions.depth || 1
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + (dimensions.height || 1) / 2, position.z);
  return mesh;
}

function createBuildingStorey(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  // Etasjer er også ofte logiske containere
  const geometry = new THREE.BoxGeometry(
    dimensions.width || 1,
    dimensions.height || 0.1,
    dimensions.depth || 1
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xaaffaa,
    wireframe: true,
    transparent: true,
    opacity: 0.05
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + (dimensions.height || 0.1) / 2, position.z);
  return mesh;
}

function createSpace(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  // Rom er containere for veggene
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xffffaa,
    transparent: true,
    opacity: 0.1,
    wireframe: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

function createDefaultElement(position: Position3D, dimensions: Dimensions3D): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd,
    roughness: 0.7
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y + dimensions.height / 2, position.z);
  return mesh;
}

// Funksjon for å eksportere IFC-data til fil
export function exportToIfc(data: IfcExportData): string {
  // Forenklet IFC eksport
  let output = '';
  
  // IFC header
  output += 'ISO-10303-21;\n';
  output += 'HEADER;\n';
  output += `FILE_DESCRIPTION(('${data.header.file_description}'), '${data.header.schema_identifiers[0]}');\n`;
  output += `FILE_NAME('${data.header.file_name}', '${data.header.time_stamp}', ('${data.header.author}'), ('${data.header.organization}'), '${data.header.preprocessor_version}', '${data.header.originating_system}', '${data.header.authorization}');\n`;
  output += `FILE_SCHEMA(('${data.header.schema_identifiers[0]}'));\n`;
  output += 'ENDSEC;\n\n';
  
  // IFC data section
  output += 'DATA;\n';
  
  // Prosjektinformasjon
  const projectId = uuidv4();
  output += `#1=IFCPROJECT('${projectId}', $, 'IFCREACT DEMO', $, $, $, $, $, $);\n`;
  
  // Legg til alle elementer
  let idCounter = 2;
  for (const element of data.elements) {
    output += `#${idCounter}=`;
    
    // Konverter element til IFC-format
    let ifcLine = '';
    switch (element.type) {
      case 'IfcSite':
        ifcLine = `IFCSITE('${element.id}', $, '${element.properties.name || 'Site'}', $, $, $, $, $, $, $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, $)`;
        break;
      case 'IfcBuilding':
        ifcLine = `IFCBUILDING('${element.id}', $, '${element.properties.name || 'Building'}', $, $, $, $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, $, $)`;
        break;
      case 'IfcBuildingStorey':
        ifcLine = `IFCBUILDINGSTOREY('${element.id}', $, '${element.properties.name || 'Storey'}', $, $, $, $, $, ${element.position?.y || 0}, $)`;
        break;
      case 'IfcWall':
        ifcLine = `IFCWALL('${element.id}', $, '${element.properties.name || 'Wall'}', $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, ${element.dimensions?.height || 3}, ${element.dimensions?.width || 1}, ${element.dimensions?.depth || 0.2}, $)`;
        break;
      case 'IfcSlab':
        ifcLine = `IFCSLAB('${element.id}', $, '${element.properties.name || 'Slab'}', $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, $, ${element.dimensions?.width || 5}, ${element.dimensions?.depth || 5}, ${element.dimensions?.height || 0.3}, '${element.properties.type || 'FLOOR'}')`;
        break;
      case 'IfcWindow':
        ifcLine = `IFCWINDOW('${element.id}', $, '${element.properties.name || 'Window'}', $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, ${element.dimensions?.height || 1.2}, ${element.dimensions?.width || 1}, $, $)`;
        break;
      case 'IfcDoor':
        ifcLine = `IFCDOOR('${element.id}', $, '${element.properties.name || 'Door'}', $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, ${element.dimensions?.height || 2.1}, ${element.dimensions?.width || 1}, $, $)`;
        break;
      case 'IfcColumn':
        ifcLine = `IFCCOLUMN('${element.id}', $, '${element.properties.name || 'Column'}', $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, $, $)`;
        break;
      default:
        ifcLine = `IFCBUILDINGELEMENTPROXY('${element.id}', $, '${element.type}', $, $, ${element.position?.x || 0}, ${element.position?.y || 0}, ${element.position?.z || 0}, $, $, $)`;
    }
    
    output += `${ifcLine};\n`;
    idCounter++;
  }
  
  output += 'ENDSEC;\n';
  output += 'END-ISO-10303-21;\n';
  
  return output;
} 