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
      {/* الجانب الأيسر - الصورة والمعلومات */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <div className="auth-logo">
            <FaBalanceScale className="logo-icon" />
            <h1>نظام إدارة مكاتب المحاماة</h1>
          </div>
          
          <div className="auth-features">
            <div className="feature-item">
              <FaGavel className="feature-icon" />
              <div>
                <h3>إدارة القضايا</h3>
                <p>تتبع جميع قضاياك ومواعيد الجلسات</p>
              </div>
            </div>
            <div className="feature-item">
              <FaGavel className="feature-icon" />
              <div>
                <h3>إدارة العملاء</h3>
                <p>احتفظ ببيانات عملائك بشكل منظم</p>
              </div>
            </div>
            <div className="feature-item">
              <FaGavel className="feature-icon" />
              <div>
                <h3>المستندات</h3>
                <p>رفع وتنظيم جميع الملفات والوثائق</p>
              </div>
            </div>
          </div>

          <div className="auth-footer">
            <p>© 2024 نظام إدارة مكاتب المحاماة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
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
