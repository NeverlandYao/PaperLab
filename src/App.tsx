import { useState } from 'react';
import Layout from './components/Layout';
import WorkflowCanvas from './components/WorkflowCanvas';
import Editor from './components/Editor';
import ResourceCenter from './components/ResourceCenter';

type Tab = 'workflow' | 'editor' | 'resources';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('workflow');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'workflow' && <WorkflowCanvas />}
      {activeTab === 'editor' && <Editor />}
      {activeTab === 'resources' && <ResourceCenter />}
    </Layout>
  );
}
