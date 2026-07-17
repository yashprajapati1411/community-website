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
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { user } = useAuth();

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
        return <MemberPortal />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={user?.role === 'admin'}
      />
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </main>
      <Footer setActiveTab={setActiveTab} />
    </>
  );
}

export default App;
