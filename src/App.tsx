import type { FC } from 'react';
import { Tabs } from 'antd';
import './App.css';
import DemoIfcBuilding from './DemoIfcBuilding';
import ThatOpenViewer from './components/ThatOpenViewer';
import { IfcProvider } from './components/ifc';

const App: FC = () => {
  const items = [
    {
      key: '1',
      label: 'React IFC Components',
      children: <DemoIfcBuilding showProvider={false} />,
    },
    {
      key: '2',
      label: 'ThatOpen Viewer',
      children: <ThatOpenViewer />,
    },
  ];

  return (
    <div className="App">
      <h1>React IFC Demo</h1>
      <IfcProvider>
        <Tabs defaultActiveKey="1" items={items} />
      </IfcProvider>
    </div>
  );
};

export default App;
