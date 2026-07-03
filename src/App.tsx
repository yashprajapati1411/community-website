import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Committee } from './pages/Committee';
import { Booking } from './pages/Booking';
import { Events } from './pages/Events';
import { Gallery } from './pages/Gallery';
import { History } from './pages/History';
import { MemberPortal } from './pages/MemberPortal';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'about':
        return <About />;
      case 'committee':
        return <Committee />;
      case 'booking':
        return <Booking />;
      case 'events':
        return <Events />;
      case 'gallery':
        return <Gallery />;
      case 'history':
        return <History />;
      case 'portal':
        return <MemberPortal isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
      />
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </main>
      <Footer setActiveTab={setActiveTab} />
    </>
  );
}

export default App;
