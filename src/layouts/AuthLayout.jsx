import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGavel, FaBalanceScale } from 'react-icons/fa';
import '../styles/auth.scss';

/**
 * تخطيط صفحات المصادقة
 * Auth Layout Component
 */
const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-layout">
      {/* الجانب الأيمن - الصورة */}
      <div className="auth-sidebar">
        <img 
          src="/law.png" 
          alt="نظام إدارة مكاتب المحاماة" 
          className="auth-sidebar-image"
        />
      </div>

      {/* الجانب الأيمن - نموذج الدخول */}
      <div className="auth-main">
        <div className="auth-form-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
