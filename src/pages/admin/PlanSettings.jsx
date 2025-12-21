import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

/**
 * صفحة إدارة خطة الاشتراك (للأدمن فقط)
 * Plan Management Page (Admin Only)
 */
const PlanSettings = () => {
  const { isAdmin } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (isAdmin) fetchPlan();
  }, [isAdmin]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get('/plan');
      setPlan(response.data.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب بيانات الخطة');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      setSaving(true);
      await api.put('/plan', plan);
      toast.success('تم تحديث الخطة بنجاح');
      fetchPlan();
    } catch (error) {
      toast.error('حدث خطأ في تحديث الخطة');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeature.trim()) {
      toast.error('يرجى إدخال عنوان الميزة');
      return;
    }

    try {
      await api.post('/plan/features', { title: newFeature });
      toast.success('تم إضافة الميزة بنجاح');
      setNewFeature('');
      fetchPlan();
    } catch (error) {
      toast.error('حدث خطأ في إضافة الميزة');
    }
  };

  const handleDeleteFeature = async (featureId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الميزة؟')) return;

    try {
      await api.delete(`/plan/features/${featureId}`);
      toast.success('تم حذف الميزة بنجاح');
      fetchPlan();
    } catch (error) {
      toast.error('حدث خطأ في حذف الميزة');
    }
  };

  if (!isAdmin) {
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

  if (!plan) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">لا توجد بيانات للخطة</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">إعدادات خطة الاشتراك</h1>
        <p className="text-gray-500 mt-1">تحكم في تفاصيل الخطة والأسعار والمميزات</p>
      </div>

      {/* معلومات أساسية */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">المعلومات الأساسية</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم الخطة</label>
            <input
              type="text"
              value={plan.name}
              onChange={(e) => setPlan({ ...plan, name: e.target.value })}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <textarea
              value={plan.description}
              onChange={(e) => setPlan({ ...plan, description: e.target.value })}
              className="input w-full"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* الأسعار */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">الأسعار</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* شهري */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3">🗓️ الاشتراك الشهري</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">السعر</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={plan.pricing.monthly.price}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        pricing: {
                          ...plan.pricing,
                          monthly: {
                            ...plan.pricing.monthly,
                            price: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="input flex-1"
                  />
                  <span className="text-sm font-medium">ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* سنوي */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3">📅 الاشتراك السنوي</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">السعر</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={plan.pricing.yearly.price}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        pricing: {
                          ...plan.pricing,
                          yearly: {
                            ...plan.pricing.yearly,
                            price: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="input flex-1"
                  />
                  <span className="text-sm font-medium">ج.م</span>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">نسبة التوفير</label>
                <input
                  type="text"
                  value={plan.pricing.yearly.savings}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      pricing: {
                        ...plan.pricing,
                        yearly: {
                          ...plan.pricing.yearly,
                          savings: e.target.value,
                        },
                      },
                    })
                  }
                  className="input w-full"
                  placeholder="43%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* المميزات */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">المميزات</h2>

        {/* إضافة ميزة جديدة */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
            placeholder="أدخل ميزة جديدة..."
            className="input flex-1"
          />
          <button onClick={handleAddFeature} className="btn-primary">
            + إضافة
          </button>
        </div>

        {/* قائمة المميزات */}
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div
              key={feature._id || index}
              className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span>{feature.title}</span>
              </div>
              <button
                onClick={() => handleDeleteFeature(feature._id)}
                className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
              >
                حذف
              </button>
            </div>
          ))}
        </div>

        {plan.features.length === 0 && (
          <p className="text-center text-gray-500 py-8">لا توجد مميزات مضافة</p>
        )}
      </div>

      {/* زر الحفظ */}
      <div className="flex justify-end gap-3">
        <button onClick={fetchPlan} className="btn-secondary">
          إلغاء
        </button>
        <button
          onClick={handleUpdatePlan}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
};

export default PlanSettings;
