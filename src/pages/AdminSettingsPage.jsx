import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * صفحة إعدادات InstaPay والأسعار - Super Admin فقط
 * InstaPay Settings and Pricing Configuration Page - Super Admin Only
 */
const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    instaPayIdentifier: '',
    subscriptionPrices: {
      monthly: 199,
      yearly: 1999,
    },
  });

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/admin/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      toast.error('حدث خطأ في جلب الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/payments/admin/settings', settings);
      
      if (response.data.success) {
        toast.success('تم حفظ الإعدادات بنجاح');
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-bold text-gray-600">غير مصرح</h2>
        <p className="text-gray-500 mt-2">هذه الصفحة متاحة للمسؤولين فقط</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">إعدادات الدفع والاشتراكات</h1>
        <p className="text-gray-500 mt-1">تكوين InstaPay وأسعار الاشتراكات</p>
      </div>

      {/* InstaPay Settings */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Settings className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">إعدادات InstaPay</h2>
            <p className="text-sm text-gray-500">معرف الحساب الذي سيستخدمه المستخدمون للدفع</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              معرف InstaPay (رقم الهاتف أو IPA)
            </label>
            <input
              type="text"
              value={settings.instaPayIdentifier}
              onChange={(e) => handleChange('instaPayIdentifier', e.target.value)}
              className="input w-full"
              placeholder="مثال: 01012345678 أو IPA123456"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              سيتم عرض هذا المعرف للمستخدمين عند طلب الاشتراك
            </p>
          </div>

          {settings.instaPayIdentifier && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ تم تعيين معرف InstaPay. يمكن للمستخدمين الآن إرسال طلبات الدفع.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Settings */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <DollarSign className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">أسعار الاشتراكات</h2>
            <p className="text-sm text-gray-500">تحديد أسعار الخطط الشهرية والسنوية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">📅 الاشتراك الشهري</h3>
            <div>
              <label className="block text-sm mb-2">السعر (بالجنيه المصري)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.subscriptionPrices.monthly}
                  onChange={(e) => handleChange('subscriptionPrices.monthly', parseInt(e.target.value))}
                  className="input flex-1"
                  min="0"
                />
                <span className="text-sm font-medium">ج.م</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">المدة: 30 يوم</p>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">📆 الاشتراك السنوي</h3>
            <div>
              <label className="block text-sm mb-2">السعر (بالجنيه المصري)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.subscriptionPrices.yearly}
                  onChange={(e) => handleChange('subscriptionPrices.yearly', parseInt(e.target.value))}
                  className="input flex-1"
                  min="0"
                />
                <span className="text-sm font-medium">ج.م</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">المدة: 365 يوم</p>
            </div>

            {/* Savings Calculation */}
            {settings.subscriptionPrices.monthly > 0 && settings.subscriptionPrices.yearly > 0 && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  💰 التوفير السنوي: {settings.subscriptionPrices.monthly * 12 - settings.subscriptionPrices.yearly} ج.م
                  ({Math.round((1 - settings.subscriptionPrices.yearly / (settings.subscriptionPrices.monthly * 12)) * 100)}%)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="card mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold mb-3">👁️ معاينة ما سيراه المستخدمون</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border-2 border-blue-500">
            <h4 className="font-bold mb-2">اشتراك شهري</h4>
            <p className="text-2xl font-bold text-blue-600">{settings.subscriptionPrices.monthly} ج.م</p>
            <p className="text-sm text-gray-500">كل 30 يوم</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border-2 border-green-500 relative">
            <div className="absolute top-0 right-4 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
              وفر {Math.round((1 - settings.subscriptionPrices.yearly / (settings.subscriptionPrices.monthly * 12)) * 100)}%
            </div>
            <h4 className="font-bold mb-2">اشتراك سنوي</h4>
            <p className="text-2xl font-bold text-green-600">{settings.subscriptionPrices.yearly} ج.م</p>
            <p className="text-sm text-gray-500">كل 365 يوم</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => fetchSettings()}
          className="btn-secondary"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="loading-spinner-sm"></div>
              جاري الحفظ...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={18} />
              حفظ التغييرات
            </span>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="card mt-6 bg-slate-50 dark:bg-slate-900">
        <h3 className="font-bold mb-3">📋 تعليمات الاستخدام</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>قم بتعيين معرف InstaPay الخاص بك (رقم الهاتف أو IPA)</li>
          <li>حدد أسعار الاشتراكات الشهرية والسنوية</li>
          <li>احفظ التغييرات</li>
          <li>سيتمكن المستخدمون من رؤية معرف InstaPay وإرسال طلبات الدفع</li>
          <li>راجع طلبات الدفع من صفحة "إدارة طلبات الدفع"</li>
          <li>وافق أو ارفض الطلبات بناءً على صورة إثبات الدفع</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
