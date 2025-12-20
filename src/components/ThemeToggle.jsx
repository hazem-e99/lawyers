import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * مكون تبديل الثيم - Theme Toggle Component
 * تصميم minimalist يعتمد على الأيقونات فقط
 */

const ThemeToggle = () => {
  const { mode, color, toggleMode, changeColor, isDark } = useTheme();

  // الألوان المتاحة حسب الوضع
  const lightColors = [
    { value: 'blue', hex: '#3b82f6', icon: '🔵' },
    { value: 'purple', hex: '#8b5cf6', icon: '🟣' }
  ];

  const darkColors = [
    { value: 'blue', hex: '#3b82f6', icon: '🔵' },
    { value: 'slate', hex: '#64748b', icon: '⚪' },
    { value: 'purple', hex: '#8b5cf6', icon: '🟣' },
    { value: 'black', hex: '#71717a', icon: '⚫' }
  ];

  const colors = isDark ? darkColors : lightColors;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          المظهر
        </h3>
      </div>

      {/* Mode Toggle - أيقونات فقط */}
      <div className="flex items-center justify-start gap-2 mb-8">
        <button
          onClick={() => mode === 'dark' && toggleMode()}
          className={`
            relative w-16 h-16 rounded-2xl transition-all duration-300
            flex items-center justify-center
            ${!isDark
              ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110'
              : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:scale-105'
            }
          `}
          aria-label="الوضع الفاتح"
          title="فاتح"
        >
          <FiSun className="text-3xl" />
          {!isDark && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs">✓</span>
            </div>
          )}
        </button>

        {/* Divider */}
        <div className="h-12 w-px bg-[var(--color-border)]"></div>

        <button
          onClick={() => mode === 'light' && toggleMode()}
          className={`
            relative w-16 h-16 rounded-2xl transition-all duration-300
            flex items-center justify-center
            ${isDark
              ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110'
              : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:scale-105'
            }
          `}
          aria-label="الوضع الداكن"
          title="داكن"
        >
          <FiMoon className="text-3xl" />
          {isDark && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs">✓</span>
            </div>
          )}
        </button>
      </div>

      {/* Separator */}
      <div className="h-px bg-[var(--color-border)] mb-6"></div>

      {/* Color Picker - دوائر ملونة فقط */}
      <div className="flex items-center justify-start gap-3">
        {colors.map((colorOption) => {
          const isActive = color === colorOption.value;

          return (
            <button
              key={colorOption.value}
              onClick={() => changeColor(colorOption.value)}
              className={`
                relative w-14 h-14 rounded-full transition-all duration-300
                flex items-center justify-center
                ${isActive 
                  ? 'scale-125 shadow-xl' 
                  : 'scale-100 hover:scale-110 opacity-70 hover:opacity-100'
                }
              `}
              style={{ 
                backgroundColor: colorOption.hex,
                boxShadow: isActive ? `0 0 0 4px var(--color-bg), 0 0 0 6px ${colorOption.hex}40` : 'none'
              }}
              aria-label={colorOption.value}
              title={colorOption.icon}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl drop-shadow-lg">✓</span>
                </div>
              )}
              
              {/* Emoji overlay للتوضيح */}
              {!isActive && (
                <span className="text-2xl opacity-80">{colorOption.icon}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current theme indicator - صغيرة وبسيطة */}
      <div className="mt-6 text-right">
        <p className="text-xs text-[var(--color-text-muted)]">
          {mode === 'light' ? '☀️' : '🌙'} {colors.find(c => c.value === color)?.icon}
        </p>
      </div>
    </div>
  );
};

export default ThemeToggle;
