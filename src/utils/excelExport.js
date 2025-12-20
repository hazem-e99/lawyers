import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Utilities لتصدير البيانات إلى Excel
 * Excel Export Utilities
 */

/**
 * تصدير القضايا إلى Excel
 * Export cases to Excel
 */
export const exportCasesToExcel = (cases) => {
  // تحضير البيانات للتصدير
  const data = cases.map((caseItem) => ({
    'رقم القضية': caseItem.caseNumber || '-',
    'العنوان': caseItem.title || '-',
    'العميل': caseItem.client?.name || '-',
    'النوع': getCaseTypeText(caseItem.caseType),
    'الحالة': getStatusText(caseItem.status),
    'المحامي': caseItem.assignedLawyer?.name || '-',
    'المحكمة': caseItem.court?.name || '-',
    'الدائرة': caseItem.court?.circle || '-',
    'الأولوية': getPriorityText(caseItem.priority),
    'الأتعاب': caseItem.fees?.agreed || 0,
    'الأتعاب المدفوعة': caseItem.fees?.paid || 0,
    'الأتعاب المتبقية': (caseItem.fees?.agreed || 0) - (caseItem.fees?.paid || 0),
    'تاريخ الفتح': caseItem.filingDate ? format(new Date(caseItem.filingDate), 'dd/MM/yyyy') : '-',
    'الجلسة القادمة': caseItem.nextSessionDate ? format(new Date(caseItem.nextSessionDate), 'dd/MM/yyyy') : '-',
    'تاريخ الإنشاء': format(new Date(caseItem.createdAt), 'dd/MM/yyyy HH:mm'),
  }));

  // إنشاء workbook و worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'القضايا');

  // تحسين عرض الأعمدة
  const cols = [
    { wch: 15 }, // رقم القضية
    { wch: 30 }, // العنوان
    { wch: 20 }, // العميل
    { wch: 15 }, // النوع
    { wch: 12 }, // الحالة
    { wch: 20 }, // المحامي
    { wch: 20 }, // المحكمة
    { wch: 15 }, // الدائرة
    { wch: 12 }, // الأولوية
    { wch: 15 }, // الأتعاب
    { wch: 15 }, // المدفوع
    { wch: 15 }, // المتبقي
    { wch: 15 }, // تاريخ الفتح
    { wch: 15 }, // الجلسة القادمة
    { wch: 20 }, // تاريخ الإنشاء
  ];
  worksheet['!cols'] = cols;

  // تصدير الملف
  const fileName = `القضايا_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * تصدير الجلسات إلى Excel
 * Export sessions to Excel
 */
export const exportSessionsToExcel = (sessions) => {
  const data = sessions.map((session) => ({
    'القضية': session.case?.title || '-',
    'رقم القضية': session.case?.caseNumber || '-',
    'العميل': session.case?.client?.name || '-',
    'نوع الجلسة': getSessionTypeText(session.sessionType),
    'التاريخ': session.sessionDate ? format(new Date(session.sessionDate), 'dd/MM/yyyy') : '-',
    'الوقت': session.sessionTime || '-',
    'المحكمة': session.court?.name || '-',
    'القاعة': session.court?.room || '-',
    'الحالة': getSessionStatusText(session.status),
    'الملاحظات': session.notes || '-',
    'النتيجة': session.result || '-',
    'القاضي': session.judge || '-',
    'تاريخ الإنشاء': format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الجلسات');

  // تحسين عرض الأعمدة
  const cols = [
    { wch: 30 }, // القضية
    { wch: 15 }, // رقم القضية
    { wch: 20 }, // العميل
    { wch: 15 }, // نوع الجلسة
    { wch: 15 }, // التاريخ
    { wch: 10 }, // الوقت
    { wch: 20 }, // المحكمة
    { wch: 12 }, // القاعة
    { wch: 12 }, // الحالة
    { wch: 40 }, // الملاحظات
    { wch: 30 }, // النتيجة
    { wch: 20 }, // القاضي
    { wch: 20 }, // تاريخ الإنشاء
  ];
  worksheet['!cols'] = cols;

  const fileName = `الجلسات_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * تصدير العملاء إلى Excel
 * Export clients to Excel
 */
export const exportClientsToExcel = (clients) => {
  const data = clients.map((client) => ({
    'الاسم': client.name || '-',
    'النوع': getClientTypeText(client.clientType),
    'رقم الهوية': client.idNumber || '-',
    'الهاتف': client.phone || '-',
    'البريد الإلكتروني': client.email || '-',
    'العنوان': client.address || '-',
    'المدينة': client.city || '-',
    'المنطقة': client.region || '-',
    'الرمز البريدي': client.postalCode || '-',
    'الوظيفة': client.occupation || '-',
    'جهة العمل': client.employer || '-',
    'عدد القضايا': client.casesCount || 0,
    'الملاحظات': client.notes || '-',
    'تاريخ الإضافة': format(new Date(client.createdAt), 'dd/MM/yyyy HH:mm'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء');

  // تحسين عرض الأعمدة
  const cols = [
    { wch: 25 }, // الاسم
    { wch: 15 }, // النوع
    { wch: 20 }, // رقم الهوية
    { wch: 15 }, // الهاتف
    { wch: 25 }, // البريد
    { wch: 30 }, // العنوان
    { wch: 15 }, // المدينة
    { wch: 15 }, // المنطقة
    { wch: 12 }, // الرمز البريدي
    { wch: 20 }, // الوظيفة
    { wch: 20 }, // جهة العمل
    { wch: 12 }, // عدد القضايا
    { wch: 40 }, // الملاحظات
    { wch: 20 }, // تاريخ الإضافة
  ];
  worksheet['!cols'] = cols;

  const fileName = `العملاء_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Helper functions for text conversion
const getCaseTypeText = (type) => {
  const types = {
    civil: 'مدني',
    criminal: 'جنائي',
    family: 'أحوال شخصية',
    commercial: 'تجاري',
    labor: 'عمالي',
    administrative: 'إداري',
    real_estate: 'عقاري',
    other: 'أخرى',
  };
  return types[type] || type || '-';
};

const getStatusText = (status) => {
  const statuses = {
    open: 'مفتوحة',
    in_progress: 'جارية',
    pending: 'معلقة',
    closed: 'مغلقة',
    won: 'مربوحة',
    lost: 'خاسرة',
  };
  return statuses[status] || status || '-';
};

const getPriorityText = (priority) => {
  const priorities = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  };
  return priorities[priority] || priority || '-';
};

const getSessionTypeText = (type) => {
  const types = {
    hearing: 'جلسة استماع',
    pleading: 'مرافعة',
    ruling: 'نطق بالحكم',
    postponement: 'تأجيل',
    first_session: 'أول جلسة',
    expert: 'خبير',
    other: 'أخرى',
  };
  return types[type] || type || '-';
};

const getSessionStatusText = (status) => {
  const statuses = {
    scheduled: 'مجدولة',
    completed: 'مكتملة',
    postponed: 'مؤجلة',
    cancelled: 'ملغاة',
  };
  return statuses[status] || status || '-';
};

const getClientTypeText = (type) => {
  const types = {
    individual: 'فرد',
    company: 'شركة',
    government: 'جهة حكومية',
  };
  return types[type] || type || '-';
};
