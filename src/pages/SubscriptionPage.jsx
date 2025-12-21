import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * صفحة الاشتراك مع خيارات الدفع
 * Subscription Page with Payment Options
 */
const SubscriptionPage = () => {
  const { subscription, loading, fetchSubscriptionStatus } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [processing, setProcessing] = useState(false);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    console.log('🔍 SubscriptionPage mounted');
    console.log('🔍 User:', user);
    console.log('🔍 Subscription:', subscription);
    console.log('🔍 Loading:', loading);
    fetchSubscriptionStatus();
    fetchPlanData();
  }, []);

  useEffect(() => {
    console.log('🔍 Subscription updated:', subscription);
    console.log('🔍 Loading updated:', loading);
  }, [subscription, loading]);

  const fetchPlanData = async () => {
    try {
      const response = await api.get('/plan');
      setPlanData(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب بيانات الخطة:', error);
    }
  };

  const plans = planData ? {
    monthly: {
      price: planData.pricing.monthly.price,
      duration: 'شهري',
      durationDays: 30,
    },
    yearly: {
      price: planData.pricing.yearly.price,
      duration: 'سنوي',
      durationDays: 365,
      savings: planData.pricing.yearly.savings,
    },
  } : {
    monthly: { price: 199, duration: 'شهري', durationDays: 30 },
    yearly: { price: 1999, duration: 'سنوي', durationDays: 365, savings: '43%' },
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      const response = await api.post('/payment/paymob/init', {
        planDuration: selectedPlan,
      });

      if (response.data.success) {
        const { paymentUrl } = response.data.data;
        window.location.href = paymentUrl;
      } else {
        toast.error(response.data.message || 'حدث خطأ في عملية الدفع');
        setProcessing(false);
      }
    } catch (error) {
      console.error('خطأ في الدفع:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في عملية الدفع');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const isActive = subscription?.isActive && !subscription?.isExpired;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            خطة الاشتراك Professional
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            احصل على وصول كامل لجميع ميزات نظام إدارة المحاماة
          </p>
        </div>

        {/* الحالة الحالية */}
        {subscription && (
          <div className="card mb-6 bg-white dark:bg-slate-800">
            <h2 className="text-xl font-bold mb-4">حالة الاشتراك الحالي</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500">الحالة</p>
                <p className="font-bold">{isActive ? '✅ نشط' : '❌ غير نشط'}</p>
              </div>
              {subscription.expiresAt && (
                <div>
                  <p className="text-sm text-slate-500">تاريخ الانتهاء</p>
                  <p className="font-bold">
                    {new Date(subscription.expiresAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">الأيام المتبقية</p>
                <p className="font-bold">
                  {isActive ? `${subscription.daysRemaining || 0} يوم` : '0 يوم'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* اختيار الخطة */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-6">اختر مدة الاشتراك</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* شهري */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <h3 className="text-xl font-bold mb-2">اشتراك شهري</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {plans.monthly.price} ج.م
              </p>
              <p className="text-sm text-slate-500">كل 30 يوم</p>
            </div>

            {/* سنوي */}
            <div
              onClick={() => setSelectedPlan('yearly')}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                وفر {plans.yearly.savings}
              </div>
              <h3 className="text-xl font-bold mb-2">اشتراك سنوي</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {plans.yearly.price} ج.م
              </p>
              <p className="text-sm text-slate-500">كل 365 يوم</p>
              <p className="text-xs text-green-600 mt-2">
                بدلاً من {plans.monthly.price * 12} ج.م
              </p>
            </div>
          </div>

          {/* زر الدفع */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="loading-spinner-sm"></div>
                جاري التحويل للدفع...
              </span>
            ) : (
              `اشترك الآن - ${plans[selectedPlan].price} ج.م`
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            🔒 الدفع آمن ومشفر عبر Paymob
          </p>
        </div>

        {/* المميزات */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">✨ المميزات المتضمنة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {planData?.features?.filter(f => f.enabled).map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">{feature.title}</span>
              </div>
            )) || [
              'إدارة غير محدودة للقضايا والعملاء',
              'جدولة وتتبع الجلسات القضائية',
              'مكتبة المستندات والملفات',
              'قوالب قانونية جاهزة',
              'تقارير وإحصائيات شاملة',
              'تذكيرات WhatsApp تلقائية',
              'نسخ احتياطي يومي',
              'دعم فني متواصل',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
