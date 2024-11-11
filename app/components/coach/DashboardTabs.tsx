// components/Tabs.tsx
import { useState } from 'react';

const DashboardTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('requested');

  const tabs = [
    { id: 'requested', label: 'Requested', content: 'Content for Tab 1' },
    { id: 'accepted', label: 'Accepted', content: 'Content for Tab 2' },
    { id: 'completed', label: 'Completed', content: 'Content for Tab 3' },
    { id: 'declined', label: 'Declined', content: 'Content for Tab 4' },
  ];

  return (
    <div className="flex flex-col mt-4">
      <div className="flex justify-center items-center space-x-4 border-b pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`p-2 font-semibold ${activeTab === tab.id ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs.map(tab => (
          <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
            <h3 className="text-lg font-semibold">{tab.content}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardTabs;
