import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import '../styles/layout.scss';

/**
 * التخطيط الرئيسي للتطبيق
 * Main Layout Component
 */
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className={`main-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* المحتوى الرئيسي */}
      <div className="main-content">
        {/* Navbar */}
        <Navbar 
          onMenuClick={toggleMobileSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* محتوى الصفحة */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Overlay للموبايل */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
