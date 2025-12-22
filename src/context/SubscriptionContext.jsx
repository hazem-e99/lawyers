import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

/**
 * سياق الاشتراك
 * Subscription Context
 */
const SubscriptionContext = createContext(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  // جلب حالة الاشتراك عند تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionStatus();
    } else {
      setLoading(false);
      setSubscription(null);
      setIsActive(false);
    }
  }, [isAuthenticated]);

  // جلب حالة الاشتراك من السيرفر
  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      // استثناء: فقط Super Admin لديه وصول دائم
      if (user?.role === 'superadmin') {
        setSubscription({
          isActive: true,
          startedAt: new Date(),
          expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
          isTrial: false,
          isExpired: false,
          daysRemaining: 36500, // 100 سنة
        });
        setIsActive(true);
        setLoading(false);
        return;
      }

      const response = await api.get('/subscription/status');
      const subData = response.data.data;
      
      setSubscription(subData);
      
      // التحقق من أن الاشتراك نشط وغير منتهي
      const active = subData.isActive && !subData.isExpired;
      setIsActive(active);
    } catch (error) {
      console.error('خطأ في جلب حالة الاشتراك:', error);
      setSubscription(null);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  };

  // تفعيل الاشتراك
  const activateSubscription = async (isTrial = false) => {
    try {
      const response = await api.post('/subscription/start', { isTrial });
      await fetchSubscriptionStatus(); // تحديث الحالة
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('خطأ في تفعيل الاشتراك:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'حدث خطأ في تفعيل الاشتراك',
      };
    }
  };

  // تجديد الاشتراك
  const renewSubscription = async () => {
    try {
      const response = await api.post('/subscription/renew');
      await fetchSubscriptionStatus(); // تحديث الحالة
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('خطأ في تجديد الاشتراك:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'حدث خطأ في تجديد الاشتراك',
      };
    }
  };

  // إلغاء الاشتراك
  const cancelSubscription = async () => {
    try {
      const response = await api.post('/subscription/cancel');
      await fetchSubscriptionStatus(); // تحديث الحالة
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'حدث خطأ في إلغاء الاشتراك',
      };
    }
  };

  const value = {
    subscription,
    loading,
    isActive,
    fetchSubscriptionStatus,
    activateSubscription,
    renewSubscription,
    cancelSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
