import type { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  IfcProvider,
  IfcSite,
  IfcBuilding,
  IfcBuildingStorey,
  IfcSpace,
  IfcWall,
  IfcWindow,
  IfcDoor,
  IfcSlab,
  IfcColumn,
  IfcRoof
} from './components/ifc';

interface DemoIfcBuildingProps {
  showProvider?: boolean;
}

// En komponent som genererer et virtuelt bygg med IFC-komponenter
const DemoIfcBuilding: FC<DemoIfcBuildingProps> = ({ showProvider = true }) => {
  // Generer ID-er for de viktigste komponentene
  const siteId = uuidv4();
  const buildingId = uuidv4();
  const storey1Id = uuidv4();
  const storey2Id = uuidv4();
  
  // Bygningselementer som skal brukes i modellen
  const buildingContent = (
    <IfcSite
      id={siteId}
      properties={{
        name: 'Byggeplass',
        address: 'Eksempelveien 123',
        description: 'Dette er et eksempel på en virtuell byggeplass'
      }}
      position={{ x: 0, y: 0, z: 0 }}
    >
      <IfcBuilding
        id={buildingId}
        properties={{
          name: 'Hovedbygg',
          buildingType: 'Bolig',
          numberOfStoreys: 2
        }}
        position={{ x: 10, y: 0, z: 10 }}
        dimensions={{ width: 20, height: 8, depth: 15 }}
      >
        {/* Første etasje */}
        <IfcBuildingStorey
          id={storey1Id}
          properties={{
            name: '1. etasje',
            elevation: 0
          }}
          position={{ x: 0, y: 0, z: 0 }}
        >
          {/* Gulv */}
          <IfcSlab
            id={uuidv4()}
            properties={{ name: 'Førsteetasjegulv', type: 'FLOOR' }}
            position={{ x: 0, y: 0, z: 0 }}
            dimensions={{ width: 20, height: 0.3, depth: 15 }}
          />
          
          {/* Rom */}
          <IfcSpace
            id={uuidv4()}
            properties={{ name: 'Stue', usage: 'LIVING' }}
            position={{ x: 5, y: 0, z: 5 }}
            dimensions={{ width: 10, height: 3, depth: 8 }}
          >
            {/* Vegger rundt stuen */}
            <IfcWall
              id={uuidv4()}
              properties={{ name: 'Nordvegg', isExternal: true }}
              position={{ x: 0, y: 0, z: 0 }}
              dimensions={{ width: 10, height: 3, depth: 0.2 }}
            />
            <IfcWall
              id={uuidv4()}
              properties={{ name: 'Østvegg', isExternal: true }}
              position={{ x: 10, y: 0, z: 4 }}
              dimensions={{ width: 0.2, height: 3, depth: 8 }}
            >
              <IfcWindow
                id={uuidv4()}
                properties={{ name: 'Østvindu', glazingType: 'DOUBLE' }}
                position={{ x: 0, y: 1, z: 3 }}
                dimensions={{ width: 0.2, height: 1.2, depth: 1.5 }}
              />
            </IfcWall>
            <IfcWall
              id={uuidv4()}
              properties={{ name: 'Sørvegg', isExternal: true }}
              position={{ x: 5, y: 0, z: 8 }}
              dimensions={{ width: 10, height: 3, depth: 0.2 }}
            >
              <IfcDoor
                id={uuidv4()}
                properties={{ name: 'Hoveddør', doorType: 'SINGLE_SWING' }}
                position={{ x: 5, y: 0, z: 0 }}
                dimensions={{ width: 1, height: 2.1, depth: 0.2 }}
              />
            </IfcWall>
            <IfcWall
              id={uuidv4()}
              properties={{ name: 'Vestvegg', isExternal: true }}
              position={{ x: 0, y: 0, z: 4 }}
              dimensions={{ width: 0.2, height: 3, depth: 8 }}
            >
              <IfcWindow
                id={uuidv4()}
                properties={{ name: 'Vestvindu', glazingType: 'DOUBLE' }}
                position={{ x: 0, y: 1, z: 3 }}
                dimensions={{ width: 0.2, height: 1.2, depth: 1.5 }}
              />
            </IfcWall>
          </IfcSpace>
          
          {/* Søyler */}
          <IfcColumn
            id={uuidv4()}
            properties={{ name: 'Søyle1', type: 'RECTANGULAR' }}
            position={{ x: 0, y: 0, z: 0 }}
            dimensions={{ width: 0.3, height: 3, depth: 0.3 }}
          />
          <IfcColumn
            id={uuidv4()}
            properties={{ name: 'Søyle2', type: 'RECTANGULAR' }}
            position={{ x: 20, y: 0, z: 0 }}
            dimensions={{ width: 0.3, height: 3, depth: 0.3 }}
          />
          <IfcColumn
            id={uuidv4()}
            properties={{ name: 'Søyle3', type: 'RECTANGULAR' }}
            position={{ x: 0, y: 0, z: 15 }}
            dimensions={{ width: 0.3, height: 3, depth: 0.3 }}
          />
          <IfcColumn
            id={uuidv4()}
            properties={{ name: 'Søyle4', type: 'RECTANGULAR' }}
            position={{ x: 20, y: 0, z: 15 }}
            dimensions={{ width: 0.3, height: 3, depth: 0.3 }}
          />
        </IfcBuildingStorey>
        
        {/* Andre etasje */}
        <IfcBuildingStorey
          id={storey2Id}
          properties={{
            name: '2. etasje',
            elevation: 3.3
          }}
          position={{ x: 0, y: 3.3, z: 0 }}
        >
          {/* Gulv/tak for andre etasje */}
          <IfcSlab
            id={uuidv4()}
            properties={{ name: 'Andreetasjegulv', type: 'FLOOR' }}
            position={{ x: 0, y: 0, z: 0 }}
            dimensions={{ width: 20, height: 0.3, depth: 15 }}
          />
          
          {/* Rom */}
          <IfcSpace
            id={uuidv4()}
            properties={{ name: 'Soverom', usage: 'SLEEPING' }}
            position={{ x: 5, y: 0, z: 5 }}
            dimensions={{ width: 8, height: 3, depth: 6 }}
          >
            <IfcWall
              id={uuidv4()}
              properties={{ name: 'Nordvegg2', isExternal: true }}
              position={{ x: 0, y: 0, z: 0 }}
              dimensions={{ width: 8, height: 3, depth: 0.2 }}
            >
              <IfcWindow
                id={uuidv4()}
                properties={{ name: 'Nordvindu', glazingType: 'DOUBLE' }}
                position={{ x: 4, y: 1, z: 0 }}
                dimensions={{ width: 1.5, height: 1.2, depth: 0.2 }}
              />
            </IfcWall>
          </IfcSpace>
          
          {/* Tak */}
          <IfcRoof
            id={uuidv4()}
            properties={{ name: 'Hovedtak', type: 'GABLE' }}
            position={{ x: 0, y: 3, z: 0 }}
            dimensions={{ width: 20, height: 1.5, depth: 15 }}
          />
        </IfcBuildingStorey>
      </IfcBuilding>
    </IfcSite>
  );
  
  // Returner med eller uten IfcProvider, avhengig av prop
  return showProvider ? (
    <IfcProvider>
      {buildingContent}
    </IfcProvider>
  ) : buildingContent;
};

export default DemoIfcBuilding;
