import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSubscription } from './context/SubscriptionContext';
import SubscriptionLockScreen from './components/SubscriptionLockScreen';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/cases/Cases';
import CaseDetails from './pages/cases/CaseDetails';
import CaseForm from './pages/cases/CaseForm';
import Clients from './pages/clients/Clients';
import ClientDetails from './pages/clients/ClientDetails';
import ClientForm from './pages/clients/ClientForm';
import Sessions from './pages/sessions/Sessions';
import SessionForm from './pages/sessions/SessionForm';
import Calendar from './pages/calendar/Calendar';
import Documents from './pages/documents/Documents';
import Library from './pages/library/Library';
import Editor from './pages/library/Editor';
import { Templates } from './pages/templates';
import Users from './pages/users/Users';
import UserForm from './pages/users/UserForm';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import PlanSettings from './pages/admin/PlanSettings';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailure from './pages/payment/PaymentFailure';
import NotFound from './pages/NotFound';

/**
 * مكون حماية المسارات
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const { isActive, loading: subscriptionLoading, subscription } = useSubscription();
  const navigate = useNavigate();

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // استثناء: الأدمنز لديهم وصول دائم بدون فحص الاشتراك
  const isAdmin = user?.role === 'admin';

  // التحقق من حالة الاشتراك (للمستخدمين العاديين فقط)
  if (!isAdmin && !isActive) {
    const handleRenew = () => {
      navigate('/subscription');
    };

    return (
      <SubscriptionLockScreen 
        subscription={subscription} 
        onRenew={handleRenew}
      />
    );
  }

  return children;
};

/**
 * مكون حماية بالتوثيق فقط (بدون فحص الاشتراك)
 * Auth-Only Protected Route
 */
const ProtectedRouteAuthOnly = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


/**
 * مكون التطبيق الرئيسي
 * Main App Component
 */
function App() {
  return (
    <Routes>
      {/* مسارات المصادقة */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* صفحات الدفع (بدون layout) */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />

      {/* صفحة الاشتراك (محمية بـ auth فقط، بدون فحص الاشتراك) */}
      <Route
        path="/subscription"
        element={
          <ProtectedRouteAuthOnly>
            <MainLayout />
          </ProtectedRouteAuthOnly>
        }
      >
        <Route index element={<SubscriptionPage />} />
      </Route>

      {/* المسارات المحمية */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* لوحة التحكم */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* القضايا */}
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/new" element={<CaseForm />} />
        <Route path="/cases/:id" element={<CaseDetails />} />
        <Route path="/cases/:id/edit" element={<CaseForm />} />

        {/* العملاء */}
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientDetails />} />
        <Route path="/clients/:id/edit" element={<ClientForm />} />

        {/* الجلسات */}
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/sessions/new" element={<SessionForm />} />
        <Route path="/sessions/:id/edit" element={<SessionForm />} />

        {/* تقويم الجلسات */}
        <Route path="/calendar" element={<Calendar />} />

        {/* المستندات */}
        <Route path="/documents" element={<Documents />} />

        {/* المكتبة */}
        <Route path="/library" element={<Library />} />
        <Route path="/library/editor/:id" element={<Editor />} />

        {/* القوالب القانونية */}
        <Route path="/templates" element={<Templates />} />

        {/* المستخدمين */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/new" element={<UserForm />} />
        <Route path="/users/:id/edit" element={<UserForm />} />

        {/* الملف الشخصي */}
        <Route path="/profile" element={<Profile />} />

        {/* الإعدادات */}
        <Route path="/settings" element={<Settings />} />

        {/* إدارة الاشتراكات (للأدمن) */}
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        
        {/* إدارة خطة الاشتراك (للأدمن) */}
        <Route path="/admin/plan" element={<PlanSettings />} />
        
        {/* صفحة غير موجودة داخل المسارات المحمية */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* صفحة غير موجودة خارج المسارات المحمية */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
