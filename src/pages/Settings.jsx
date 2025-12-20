import { FaCog, FaBell, FaDatabase, FaShieldAlt, FaPalette } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import ThemeDemo from '../components/ThemeDemo';

/**
 * صفحة الإعدادات
 * Settings Page
 */
const Settings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">الإعدادات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إعدادات المظهر - Theme Settings */}
        <div className="lg:col-span-2">
          <ThemeToggle />
        </div>

        {/* إعدادات عامة */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-info-light)] flex items-center justify-center">
              <FaCog className="text-[var(--color-info)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">الإعدادات العامة</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="input-label">اسم المكتب</label>
              <input
                type="text"
                className="input-field"
                defaultValue="مكتب المحاماة"
              />
            </div>
            <div>
              <label className="input-label">العنوان</label>
              <input
                type="text"
                className="input-field"
                placeholder="عنوان المكتب"
              />
            </div>
            <div>
              <label className="input-label">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                className="input-field"
                placeholder="info@example.com"
              />
            </div>
          </div>
          <button className="btn-primary mt-4">حفظ</button>
        </div>

        {/* إعدادات الإشعارات */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-light)] flex items-center justify-center">
              <FaBell className="text-[var(--color-warning)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">الإشعارات</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span>إشعارات الجلسات القادمة</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span>إشعارات القضايا الجديدة</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span>إشعارات البريد الإلكتروني</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>إشعارات SMS</span>
            </label>
          </div>
          <button className="btn-primary mt-4">حفظ التفضيلات</button>
        </div>

        {/* النسخ الاحتياطي */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-success-light)] flex items-center justify-center">
              <FaDatabase className="text-[var(--color-success)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">النسخ الاحتياطي</h2>
          </div>
          <p className="text-[var(--color-text-muted)] mb-4">
            قم بإنشاء نسخة احتياطية من بياناتك لحمايتها
          </p>
          <div className="flex gap-3">
            <button className="btn-secondary">تصدير البيانات</button>
            <button className="btn-secondary">استيراد البيانات</button>
          </div>
        </div>

        {/* الأمان */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-danger-light)] flex items-center justify-center">
              <FaShieldAlt className="text-[var(--color-danger)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">الأمان</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span>تفعيل التحقق الثنائي</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span>تسجيل الخروج التلقائي بعد 30 دقيقة</span>
            </label>
          </div>
          <button className="btn-primary mt-4">حفظ إعدادات الأمان</button>
        </div>
      </div>

      {/* معلومات النظام */}
      <div className="card mt-6">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">معلومات النظام</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-muted)]">إصدار النظام</p>
            <p className="font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">آخر تحديث</p>
            <p className="font-medium">ديسمبر 2024</p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">قاعدة البيانات</p>
            <p className="font-medium">MongoDB</p>
          </div>
          <div>
            <p className="text-[var(--color-text-muted)]">الخادم</p>
            <p className="font-medium">Node.js</p>
          </div>
        </div>
      </div>

      {/* عرض توضيحي للثيمات - Theme Demo */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">🎨 معاينة الثيمات</h2>
        <ThemeDemo />
      </div>
    </div>
  );
};

export default Settings;
