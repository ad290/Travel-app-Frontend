import React, { useState } from 'react';
import DestinationManager from './components/DestinationManager';
import HotelManager from './components/HotelManager';
import HotelViewer from './components/HotelViewer';

function App() {
  const [activeTab, setActiveTab] = useState('destinations');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'destinations':
        return <DestinationManager />;
      case 'hotels':
        return <HotelManager />;
      case 'view-hotels':
        return <HotelViewer />;
      default:
        return <DestinationManager />;
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>Welcome</h1>
          <p>Travel Management System</p>
        </div>
      </header>

      <div className="container">
        <nav className="nav-menu">
          <button
            className={`nav-button ${activeTab === 'destinations' ? 'active' : ''}`}
            onClick={() => setActiveTab('destinations')}
          >
            Manage Destinations
          </button>
          <button
            className={`nav-button ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            Manage Hotels
          </button>
          <button
            className={`nav-button ${activeTab === 'view-hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('view-hotels')}
          >
            View Hotels by Destination
          </button>
        </nav>

        {renderActiveComponent()}
      </div>
    </div>
  );
}

export default App;
