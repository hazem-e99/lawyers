import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * سياق المصادقة
 * Authentication Context
 */
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // التحقق من حالة المصادقة عند تحميل التطبيق
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  // تسجيل الدخول
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ في تسجيل الدخول';
      toast.error(message);
      return { success: false, message };
    }
  };

  // التسجيل
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      setUser(newUser);
      
      toast.success('تم التسجيل بنجاح');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ في التسجيل';
      toast.error(message);
      return { success: false, message };
    }
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  };

  // تحديث الملف الشخصي
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/updateprofile', data);
      setUser(response.data.data);
      toast.success('تم تحديث البيانات بنجاح');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ في التحديث';
      toast.error(message);
      return { success: false, message };
    }
  };

  // تغيير كلمة المرور
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/updatepassword', { currentPassword, newPassword });
      toast.success('تم تغيير كلمة المرور بنجاح');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ في تغيير كلمة المرور';
      toast.error(message);
      return { success: false, message };
    }
  };

  // رفع صورة الملف الشخصي
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.put('/auth/uploadavatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // تحديث بيانات المستخدم مع الصورة الجديدة
      setUser(prev => ({ ...prev, avatar: response.data.data.avatar }));
      
      toast.success('تم تحديث الصورة الشخصية بنجاح');
      return { success: true, avatar: response.data.data.avatar };
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ في رفع الصورة';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'superadmin',
    isAdminOrSuperAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

