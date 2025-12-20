/**
 * Theme Utility Helpers
 * دوال مساعدة للثيمات
 * 
 * مجموعة من الدوال والثوابت المساعدة لتسهيل العمل مع نظام الثيمات
 * A collection of helper functions and constants for easier theme usage
 */

// ====================================
// Theme Constants - ثوابت الثيمات
// ====================================

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const THEME_COLORS = {
  BLUE: 'blue',
  SLATE: 'slate',
  PURPLE: 'purple',
  BLACK: 'black'
};

export const DEFAULT_THEME = {
  mode: THEME_MODES.LIGHT,
  color: THEME_COLORS.BLUE
};

// ====================================
// Tailwind Class Helpers - مساعدات كلاسات Tailwind
// ====================================

/**
 * احصل على كلاسات Tailwind للخلفية
 * Get Tailwind classes for background
 */
export const themeBg = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]',
  surface: 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]',
  page: 'bg-[var(--color-bg)]',
};

/**
 * احصل على كلاسات Tailwind للنص
 * Get Tailwind classes for text
 */
export const themeText = {
  primary: 'text-[var(--color-text)]',
  muted: 'text-[var(--color-text-muted)]',
  light: 'text-[var(--color-text-light)]',
  onPrimary: 'text-white',
};

/**
 * احصل على كلاسات Tailwind للحدود
 * Get Tailwind classes for borders
 */
export const themeBorder = {
  default: 'border-[var(--color-border)]',
  light: 'border-[var(--color-border-light)]',
  primary: 'border-[var(--color-primary)]',
};

/**
 * احصل على كلاسات Tailwind للظلال
 * Get Tailwind classes for shadows
 */
export const themeShadow = {
  sm: 'shadow-[var(--shadow-sm)]',
  md: 'shadow-[var(--shadow-md)]',
  lg: 'shadow-[var(--shadow-lg)]',
  xl: 'shadow-[var(--shadow-xl)]',
};

/**
 * احصل على كلاسات الحالة
 * Get status classes
 */
export const themeStatus = {
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
  info: 'bg-[var(--color-info-light)] text-[var(--color-info)]',
};

// ====================================
// Combined Class Generators - مولدات الكلاسات المدمجة
// ====================================

/**
 * احصل على كلاسات البطاقة الكاملة
 * Get complete card classes
 */
export const getCardClasses = (withHover = true) => {
  const base = `${themeBg.surface} ${themeBorder.default} ${themeShadow.md} rounded-2xl p-6 border transition-all duration-200`;
  const hover = withHover ? `hover:${themeShadow.lg} hover:-translate-y-0.5` : '';
  return `${base} ${hover}`.trim();
};

/**
 * احصل على كلاسات الزر الأساسي
 * Get primary button classes
 */
export const getPrimaryButtonClasses = () => {
  return `${themeBg.primary} ${themeText.onPrimary} ${themeShadow.md} px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:${themeShadow.lg} hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`;
};

/**
 * احصل على كلاسات حقل الإدخال
 * Get input field classes
 */
export const getInputClasses = () => {
  return `w-full px-4 py-3 ${themeBg.surface} ${themeBorder.default} ${themeText.primary} rounded-xl border transition-all duration-200 focus:outline-none focus:${themeBorder.primary} focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20`;
};

/**
 * احصل على كلاسات الشارة (Badge)
 * Get badge classes
 */
export const getBadgeClasses = (status = 'info') => {
  const base = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold';
  return `${base} ${themeStatus[status] || themeStatus.info}`;
};

// ====================================
// Utility Functions - دوال مساعدة
// ====================================

/**
 * احصل على سلسلة الثيم من الوضع واللون
 * Get theme string from mode and color
 */
export const getThemeString = (mode, color) => {
  return `${mode}-${color}`;
};

/**
 * فك سلسلة الثيم إلى وضع ولون
 * Parse theme string to mode and color
 */
export const parseThemeString = (themeString) => {
  const [mode, color] = themeString.split('-');
  return { mode, color };
};

/**
 * تحقق من صحة الوضع
 * Validate mode
 */
export const isValidMode = (mode) => {
  return Object.values(THEME_MODES).includes(mode);
};

/**
 * تحقق من صحة اللون
 * Validate color
 */
export const isValidColor = (color) => {
  return Object.values(THEME_COLORS).includes(color);
};

/**
 * احصل على كل الثيمات الممكنة
 * Get all possible themes
 */
export const getAllThemes = () => {
  const themes = [];
  Object.values(THEME_MODES).forEach(mode => {
    Object.values(THEME_COLORS).forEach(color => {
      themes.push({
        value: getThemeString(mode, color),
        mode,
        color
      });
    });
  });
  return themes;
};

// ====================================
// CSS Variable Getters - قراء متغيرات CSS
// ====================================

/**
 * احصل على قيمة متغير CSS
 * Get CSS variable value
 */
export const getCSSVariable = (variableName) => {
  if (typeof window === 'undefined') return null;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

/**
 * احصل على اللون الأساسي الحالي
 * Get current primary color
 */
export const getCurrentPrimaryColor = () => {
  return getCSSVariable('--color-primary');
};

/**
 * احصل على لون الخلفية الحالي
 * Get current background color
 */
export const getCurrentBgColor = () => {
  return getCSSVariable('--color-bg');
};

// ====================================
// Export Default Object
// ====================================

export default {
  // Constants
  THEME_MODES,
  THEME_COLORS,
  DEFAULT_THEME,
  
  // Class Objects
  themeBg,
  themeText,
  themeBorder,
  themeShadow,
  themeStatus,
  
  // Class Generators
  getCardClasses,
  getPrimaryButtonClasses,
  getInputClasses,
  getBadgeClasses,
  
  // Utilities
  getThemeString,
  parseThemeString,
  isValidMode,
  isValidColor,
  getAllThemes,
  getCSSVariable,
  getCurrentPrimaryColor,
  getCurrentBgColor,
};
