import { useTheme } from '../context/ThemeContext';
import {
  getCardClasses,
  getPrimaryButtonClasses,
  getInputClasses,
  getBadgeClasses,
  themeText,
  themeBg,
} from '../utils/themeUtils';

/**
 * عرض توضيحي لنظام الثيمات
 * Theme System Demo Component
 */
const ThemeDemo = () => {
  const { mode, color, theme } = useTheme();

  return (
    <div className="space-y-6">
      {/* معلومات الثيم الحالي */}
      <div className={getCardClasses(false)}>
        <h2 className={`text-2xl font-bold ${themeText.primary} mb-4`}>
          🎨 معلومات الثيم الحالي
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className={themeText.muted}>الوضع</p>
            <p className={`font-bold text-xl ${themeText.primary}`}>
              {mode === 'light' ? '☀️ فاتح' : '🌙 داكن'}
            </p>
          </div>
          <div>
            <p className={themeText.muted}>اللون</p>
            <p className={`font-bold text-xl ${themeText.primary}`}>
              {color === 'blue' && '🔵 أزرق'}
              {color === 'slate' && '⚪ رمادي'}
              {color === 'purple' && '🟣 بنفسجي'}
              {color === 'black' && '⚫ أسود'}
            </p>
          </div>
          <div>
            <p className={themeText.muted}>الثيم الكامل</p>
            <p className={`font-bold text-xl ${themeText.primary}`}>
              {theme}
            </p>
          </div>
        </div>
      </div>

      {/* أمثلة على الأزرار */}
      <div className={getCardClasses()}>
        <h3 className={`text-lg font-bold ${themeText.primary} mb-4`}>
          الأزرار - Buttons
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className={getPrimaryButtonClasses()}>
            زر أساسي
          </button>
          <button className={`${getPrimaryButtonClasses()} opacity-50 cursor-not-allowed`} disabled>
            زر معطل
          </button>
        </div>
      </div>

      {/* أمثلة على حقول الإدخال */}
      <div className={getCardClasses()}>
        <h3 className={`text-lg font-bold ${themeText.primary} mb-4`}>
          حقول الإدخال - Input Fields
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            className={getInputClasses()}
            placeholder="أدخل النص هنا..."
          />
          <input
            type="email"
            className={getInputClasses()}
            placeholder="البريد الإلكتروني"
          />
        </div>
      </div>

      {/* أمثلة على الشارات */}
      <div className={getCardClasses()}>
        <h3 className={`text-lg font-bold ${themeText.primary} mb-4`}>
          الشارات - Badges
        </h3>
        <div className="flex flex-wrap gap-3">
          <span className={getBadgeClasses('success')}>
            ✓ نجاح
          </span>
          <span className={getBadgeClasses('warning')}>
            ⚠ تحذير
          </span>
          <span className={getBadgeClasses('danger')}>
            ✕ خطر
          </span>
          <span className={getBadgeClasses('info')}>
            ℹ معلومات
          </span>
        </div>
      </div>

      {/* بطاقات ملونة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={getCardClasses()}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white text-xl">
              📊
            </div>
            <div>
              <h4 className={`font-bold ${themeText.primary}`}>إحصائيات</h4>
              <p className={themeText.muted}>معلومات عامة</p>
            </div>
          </div>
          <p className={themeText.primary}>
            هذه بطاقة تستخدم متغيرات CSS للثيم
          </p>
        </div>

        <div className={getCardClasses()}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-success)] flex items-center justify-center text-white text-xl">
              ✓
            </div>
            <div>
              <h4 className={`font-bold ${themeText.primary}`}>نجاح</h4>
              <p className={themeText.muted}>العملية تمت بنجاح</p>
            </div>
          </div>
          <p className={themeText.primary}>
            جميع الألوان تتغير تلقائياً مع الثيم
          </p>
        </div>
      </div>

      {/* مثال على قائمة */}
      <div className={getCardClasses()}>
        <h3 className={`text-lg font-bold ${themeText.primary} mb-4`}>
          قائمة بسيطة - Simple List
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`p-4 rounded-xl border ${themeBg.surface} hover:${themeBg.surface} ${themeText.primary} border-[var(--color-border)] transition-all cursor-pointer`}
            >
              عنصر رقم {item}
            </div>
          ))}
        </div>
      </div>

      {/* ألوان CSS Variables المباشرة */}
      <div className={getCardClasses()}>
        <h3 className={`text-lg font-bold ${themeText.primary} mb-4`}>
          متغيرات CSS - CSS Variables
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="w-full h-16 rounded-lg bg-[var(--color-primary)] mb-2"></div>
            <p className={themeText.muted}>Primary</p>
          </div>
          <div className="text-center">
            <div className="w-full h-16 rounded-lg bg-[var(--color-secondary)] mb-2"></div>
            <p className={themeText.muted}>Secondary</p>
          </div>
          <div className="text-center">
            <div className="w-full h-16 rounded-lg bg-[var(--color-success)] mb-2"></div>
            <p className={themeText.muted}>Success</p>
          </div>
          <div className="text-center">
            <div className="w-full h-16 rounded-lg bg-[var(--color-warning)] mb-2"></div>
            <p className={themeText.muted}>Warning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
