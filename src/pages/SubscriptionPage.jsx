import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Upload, CheckCircle, XCircle, Clock, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * صفحة الاشتراك مع نظام الدفع اليدوي عبر InstaPay
 * Subscription Page with Manual InstaPay Payment System
 */
const SubscriptionPage = () => {
  const { subscription, loading, fetchSubscriptionStatus } = useSubscription();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [processing, setProcessing] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchPlanData();
    fetchPaymentSettings();
    fetchMyRequests();
  }, []);

  const fetchPlanData = async () => {
    try {
      const response = await api.get('/plan');
      setPlanData(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب بيانات الخطة:', error);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const response = await api.get('/payments/settings');
      setPaymentSettings(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب إعدادات الدفع:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/payments/my-requests');
      setMyRequests(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب طلبات الدفع:', error);
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

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) {
      toast.error('يرجى رفع صورة إثبات الدفع');
      return;
    }

    try {
      setProcessing(true);
      
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('planDuration', selectedPlan);

      const response = await api.post('/payments/instapay/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('تم إرسال طلب الدفع بنجاح! سيتم مراجعته قريباً.');
        setScreenshot(null);
        setScreenshotPreview(null);
        fetchMyRequests();
      }
    } catch (error) {
      console.error('خطأ في إرسال طلب الدفع:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في إرسال طلب الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ!');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { text: 'تم القبول', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { text: 'مرفوض', className: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        <Icon size={16} />
        {badge.text}
      </span>
    );
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
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-[#0f172a]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              ⚖️
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">نظام المحاماة</h1>
              <p className="text-xs text-slate-500">Law Office Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isActive && (
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 transition-colors"
              >
                <Home size={18} />
                <span>رجوع للرئيسية</span>
              </button>
            )}
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut size={18} />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>

        {/* العنوان الرئيسي */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            خطة الاشتراك Professional
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            احصل على وصول كامل لجميع ميزات نظام إدارة المحاماة عبر الدفع بواسطة InstaPay
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

        {/* نظام الدفع - للمسؤول فقط */}
        {user?.role === 'superadmin' || user?.role === 'admin' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* قسم اختيار الخطة والدفع */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">اختر مدة الاشتراك</h2>
              
              <div className="space-y-4 mb-6">
                {/* شهري */}
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">اشتراك شهري</h3>
                      <p className="text-sm text-slate-500">كل 30 يوم</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {plans.monthly.price} ج.م
                    </p>
                  </div>
                </div>

                {/* سنوي */}
                <div
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative ${
                    selectedPlan === 'yearly'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="absolute top-0 right-4 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                    وفر {plans.yearly.savings}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">اشتراك سنوي</h3>
                      <p className="text-sm text-slate-500">كل 365 يوم</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {plans.yearly.price} ج.م
                    </p>
                  </div>
                </div>
              </div>

              {/* معلومات InstaPay */}
              {paymentSettings?.instaPayIdentifier ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                    📱 معلومات الدفع عبر InstaPay
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-500">معرف InstaPay</p>
                        <p className="font-bold text-lg" dir="ltr">{paymentSettings.instaPayIdentifier}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(paymentSettings.instaPayIdentifier)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">المبلغ المطلوب</p>
                      <p className="font-bold text-2xl text-green-600">
                        {plans[selectedPlan].price} ج.م
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <p>✓ قم بتحويل المبلغ إلى الحساب أعلاه</p>
                    <p>✓ التقط صورة لإيصال التحويل</p>
                    <p>✓ ارفع الصورة أدناه واضغط إرسال</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    ⚠️ لم يتم تعيين معرف InstaPay بعد. يرجى التواصل مع الإدارة.
                  </p>
                </div>
              )}

              {/* رفع صورة الإيصال */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  📸 صورة إثبات الدفع
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={screenshotPreview} 
                        alt="معاينة" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        إزالة الصورة
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        اضغط لرفع صورة إثبات الدفع
                      </p>
                      <p className="text-xs text-slate-500">
                        JPG, PNG (حد أقصى 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* زر الإرسال */}
              <button
                onClick={handleSubmitPayment}
                disabled={processing || !screenshot || !paymentSettings?.instaPayIdentifier}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="loading-spinner-sm"></div>
                    جاري الإرسال...
                  </span>
                ) : (
                  `إرسال طلب الدفع - ${plans[selectedPlan].price} ج.م`
                )}
              </button>
            </div>

            {/* قسم طلبات الدفع السابقة */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">طلبات الدفع السابقة</h2>
              {myRequests.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {myRequests.map((request) => (
                    <div 
                      key={request._id} 
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{request.amount} ج.م</p>
                          <p className="text-sm text-slate-500">
                            {request.planDuration === 'monthly' ? 'شهري' : 'سنوي'}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {new Date(request.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {request.adminNote && (
                        <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                          <p className="font-medium text-slate-700 dark:text-slate-300">
                            ملاحظة الإدارة:
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {request.adminNote}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="mx-auto mb-2" size={48} />
                  <p>لا توجد طلبات دفع سابقة</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">إدارة الاشتراك</h3>
                <p className="text-blue-700 dark:text-blue-300">
                  تتم إدارة اشتراك المنصة ودفع الرسوم من خلال مسؤول المكتب (Admin). لا يتطلب منك أي إجراء هنا.
                </p>
              </div>
            </div>
          </div>
        )}

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
