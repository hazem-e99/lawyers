import { FaCog, FaBell, FaDatabase, FaShieldAlt } from 'react-icons/fa';

/**
 * صفحة الإعدادات
 * Settings Page
 */
const Settings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-800 mb-6">الإعدادات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إعدادات عامة */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaCog className="text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-dark-800">الإعدادات العامة</h2>
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
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <FaBell className="text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-dark-800">الإشعارات</h2>
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
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FaDatabase className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-dark-800">النسخ الاحتياطي</h2>
          </div>
          <p className="text-gray-500 mb-4">
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
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <FaShieldAlt className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-dark-800">الأمان</h2>
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
        <h2 className="text-lg font-bold text-dark-800 mb-4">معلومات النظام</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">إصدار النظام</p>
            <p className="font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-500">آخر تحديث</p>
            <p className="font-medium">ديسمبر 2024</p>
          </div>
          <div>
            <p className="text-gray-500">قاعدة البيانات</p>
            <p className="font-medium">MongoDB</p>
          </div>
          <div>
            <p className="text-gray-500">الخادم</p>
            <p className="font-medium">Node.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
