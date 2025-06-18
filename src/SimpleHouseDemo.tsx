import type { FC } from 'react';
import {
  IfcProvider,
  IfcProject,
  IfcSite,
  IfcBuilding,
  IfcBuildingStorey,
  IfcWall,
  IfcDoor,
  IfcWindow,
  IfcFooting,
  IfcViewer3D
} from './components/ifc';

const SimpleHouseModel: FC = () => (
  <IfcProject id="project">
    <IfcSite id="site">
      <IfcBuilding id="building">
        <IfcBuildingStorey id="storey">
        <IfcWall
          id="northWall"
          position={{ x: 0, y: 0, z: 0 }}
          dimensions={{ width: 4, height: 3, depth: 0.2 }}
        />
        <IfcWall
          id="southWall"
          position={{ x: 0, y: 0, z: 4 }}
          dimensions={{ width: 4, height: 3, depth: 0.2 }}
        >
          <IfcDoor
            id="mainDoor"
            position={{ x: 1, y: 0, z: 0 }}
            dimensions={{ width: 0.8, height: 2, depth: 0.2 }}
          />
        </IfcWall>
        <IfcWall
          id="eastWall"
          position={{ x: 2, y: 0, z: 2 }}
          dimensions={{ width: 0.2, height: 3, depth: 4 }}
        >
          <IfcWindow
            id="eastWindow"
            position={{ x: 0, y: 1, z: 1 }}
            dimensions={{ width: 0.2, height: 1, depth: 1 }}
          />
        </IfcWall>
        <IfcWall
          id="westWall"
          position={{ x: -2, y: 0, z: 2 }}
          dimensions={{ width: 0.2, height: 3, depth: 4 }}
        />
        <IfcFooting
          id="foundation"
          position={{ x: 0, y: -0.25, z: 2 }}
          dimensions={{ width: 4, height: 0.5, depth: 4 }}
        />
      </IfcBuildingStorey>
    </IfcBuilding>
    </IfcSite>
  </IfcProject>
);

const SimpleHouseDemo: FC = () => (
  <IfcProvider>
    <div style={{ width: '100%' }}>
      <SimpleHouseModel />
      <IfcViewer3D height={400} />
    </div>
  </IfcProvider>
);

export default SimpleHouseDemo;
