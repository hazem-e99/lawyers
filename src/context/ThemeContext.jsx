import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme Context
 * يوفر نظام الثيمات الشامل للتطبيق بالكامل
 * Provides comprehensive theming system for the entire application
 */

const ThemeContext = createContext();

// الثيم الافتراضي - Default theme
const DEFAULT_MODE = 'light';
const DEFAULT_COLOR = 'blue';
const STORAGE_KEY = 'app-theme-preference';

/**
 * موفر سياق الثيم - Theme Context Provider
 */
export const ThemeProvider = ({ children }) => {
  // حالة الوضع (فاتح/داكن) - Mode state (light/dark)
  const [mode, setMode] = useState(DEFAULT_MODE);
  
  // حالة اللون - Color state
  const [color, setColor] = useState(DEFAULT_COLOR);

  /**
   * تحميل الثيم المحفوظ عند التهيئة
   * Load saved theme on initialization
   */
  useEffect(() => {
    try {
      // محاولة تحميل الثيم المحفوظ - Try to load saved theme
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      
      if (savedTheme) {
        const { mode: savedMode, color: savedColor } = JSON.parse(savedTheme);
        
        // التحقق من صحة البيانات المحفوظة - Validate saved data
        if (isValidMode(savedMode) && isValidColor(savedColor)) {
          setMode(savedMode);
          setColor(savedColor);
          applyThemeToDocument(savedMode, savedColor);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }

    // في حالة عدم وجود ثيم محفوظ، استخدم تفضيل النظام
    // If no saved theme, use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = prefersDark ? 'dark' : 'light';
    
    setMode(initialMode);
    setColor(DEFAULT_COLOR);
    applyThemeToDocument(initialMode, DEFAULT_COLOR);
  }, []);

  /**
   * تطبيق الثيم على المستند
   * Apply theme to document
   */
  const applyThemeToDocument = (themeMode, themeColor) => {
    const themeString = `${themeMode}-${themeColor}`;
    document.documentElement.setAttribute('data-theme', themeString);
  };

  /**
   * حفظ الثيم في localStorage
   * Save theme to localStorage
   */
  const saveThemePreference = (themeMode, themeColor) => {
    try {
      const themeData = {
        mode: themeMode,
        color: themeColor,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeData));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  /**
   * تبديل الوضع (فاتح ↔ داكن)
   * Toggle mode (light ↔ dark)
   */
  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    // تحديد اللون الافتراضي: أزرق للفاتح، أسود للداكن
    const defaultColor = newMode === 'light' ? 'blue' : 'black';
    
    setMode(newMode);
    setColor(defaultColor);
    applyThemeToDocument(newMode, defaultColor);
    saveThemePreference(newMode, defaultColor);
  };

  /**
   * تغيير اللون
   * Change color
   */
  const changeColor = (newColor) => {
    if (!isValidColor(newColor)) {
      console.error(`Invalid color: ${newColor}`);
      return;
    }
    
    setColor(newColor);
    applyThemeToDocument(mode, newColor);
    saveThemePreference(mode, newColor);
  };

  /**
   * تعيين ثيم محدد (وضع + لون)
   * Set specific theme (mode + color)
   */
  const setTheme = (newMode, newColor) => {
    if (!isValidMode(newMode) || !isValidColor(newColor)) {
      console.error('Invalid theme parameters');
      return;
    }
    
    setMode(newMode);
    setColor(newColor);
    applyThemeToDocument(newMode, newColor);
    saveThemePreference(newMode, newColor);
  };

  /**
   * الحصول على سلسلة الثيم الحالية
   * Get current theme string
   */
  const getCurrentTheme = () => `${mode}-${color}`;

  // القيمة المشتركة للسياق - Shared context value
  const value = {
    // الحالة - State
    mode,
    color,
    theme: getCurrentTheme(),
    
    // الدوال - Functions
    toggleMode,
    changeColor,
    setTheme,
    
    // معلومات إضافية - Additional info
    isDark: mode === 'dark',
    isLight: mode === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * هوك مخصص لاستخدام سياق الثيم
 * Custom hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// ====================================
// دوال مساعدة - Helper Functions
// ====================================

/**
 * التحقق من صحة الوضع
 * Validate mode
 */
const isValidMode = (mode) => {
  return ['light', 'dark'].includes(mode);
};

/**
 * التحقق من صحة اللون
 * Validate color
 */
const isValidColor = (color) => {
  return ['blue', 'slate', 'purple', 'black'].includes(color);
};

export default ThemeContext;
