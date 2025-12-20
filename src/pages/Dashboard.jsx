import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, databaseService } from '../services';
import {
  FaGavel,
  FaUsers,
  FaCalendarAlt,
  FaFolderOpen,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaMoneyBillWave,
  FaPlus,
  FaChevronLeft,
  FaTrash,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * لوحة التحكم الرئيسية
 * Dashboard Page
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [feesStats, setFeesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingDatabase, setClearingDatabase] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sessionsRes, casesRes, feesRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getUpcomingSessions(),
        dashboardService.getRecentCases(),
        dashboardService.getFeesStats(),
      ]);

      setStats(statsRes.data);
      setUpcomingSessions(sessionsRes.data);
      setRecentCases(casesRes.data);
      setFeesStats(feesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: ar });
  };

  // تنسيق المبلغ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
    const colors = {
      open: 'info',
      in_progress: 'warning',
      pending: 'warning',
      closed: 'success',
      won: 'success',
      lost: 'danger',
    };
    return colors[status] || 'info';
  };

  // الحصول على نص الحالة
  const getStatusText = (status) => {
    const texts = {
      open: 'مفتوحة',
      in_progress: 'جارية',
      pending: 'معلقة',
      closed: 'مغلقة',
      won: 'مربوحة',
      lost: 'خاسرة',
    };
    return texts[status] || status;
  };

  // تفريغ قاعدة البيانات
  const handleClearDatabase = async () => {
    try {
      setClearingDatabase(true);
      await databaseService.clearAll();
      
      // إغلاق الحوار
      setShowClearConfirm(false);
      
      // إعادة تحميل البيانات
      await fetchDashboardData();
      
      // يمكن إضافة إشعار نجاح هنا
      alert('تم حذف القضايا والعملاء والجلسات بنجاح. تم الحفاظ على المستندات والقوالب.');
    } catch (error) {
      console.error('Error clearing database:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء تفريغ قاعدة البيانات');
    } finally {
      setClearingDatabase(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* الترحيب */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-800 mb-2">
          مرحباً، {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500">
          إليك نظرة عامة على نشاط مكتبك اليوم
        </p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaGavel className="text-xl text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <FaArrowUp />
              <span>12%</span>
            </span>
          </div>
          <h3 className="text-3xl font-bold text-dark-800 mb-1">
            {stats?.cases?.total || 0}
          </h3>
          <p className="text-gray-500 text-sm">إجمالي القضايا</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-primary-500 font-medium">
              {stats?.cases?.open || 0} قضية مفتوحة
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FaUsers className="text-xl text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <FaArrowUp />
              <span>8%</span>
            </span>
          </div>
          <h3 className="text-3xl font-bold text-dark-800 mb-1">
            {stats?.clients?.total || 0}
          </h3>
          <p className="text-gray-500 text-sm">إجمالي العملاء</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-emerald-500 font-medium">
              {stats?.clients?.active || 0} عميل نشط
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FaCalendarAlt className="text-xl text-amber-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-amber-600">
              <FaClock />
              <span>اليوم</span>
            </span>
          </div>
          <h3 className="text-3xl font-bold text-dark-800 mb-1">
            {stats?.sessions?.today || 0}
          </h3>
          <p className="text-gray-500 text-sm">جلسات اليوم</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-amber-500 font-medium">
              {stats?.sessions?.upcoming || 0} جلسة هذا الأسبوع
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FaFolderOpen className="text-xl text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-dark-800 mb-1">
            {stats?.documents?.total || 0}
          </h3>
          <p className="text-gray-500 text-sm">المستندات المحفوظة</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/documents" className="text-purple-500 font-medium hover:underline">
              عرض المستندات
            </Link>
          </div>
        </div>
      </div>

      {/* الإحصائيات المالية */}
      {feesStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-l from-slate-700 to-slate-800 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <FaMoneyBillWave className="text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">إجمالي الأتعاب المتفق عليها</p>
                <h3 className="text-2xl font-bold">{formatCurrency(feesStats.totalAgreed)}</h3>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-l from-slate-600 to-slate-700 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <FaArrowUp className="text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">المبالغ المحصلة</p>
                <h3 className="text-2xl font-bold">{formatCurrency(feesStats.totalPaid)}</h3>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-l from-slate-500 to-slate-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <FaArrowDown className="text-2xl" />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">المبالغ المتبقية</p>
                <h3 className="text-2xl font-bold">{formatCurrency(feesStats.totalRemaining)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الجلسات القادمة وآخر القضايا */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الجلسات القادمة */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark-800">الجلسات القادمة</h2>
            <Link
              to="/sessions"
              className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
            >
              عرض الكل
              <FaChevronLeft />
            </Link>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <FaCalendarAlt className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-dark-800 truncate">
                      {session.case?.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {session.case?.client?.name}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-dark-800">
                      {formatDate(session.sessionDate)}
                    </p>
                    <p className="text-sm text-gray-500">{session.sessionTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaCalendarAlt className="text-4xl mx-auto mb-3 opacity-30" />
              <p>لا توجد جلسات قادمة</p>
            </div>
          )}
        </div>

        {/* آخر القضايا */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark-800">آخر القضايا</h2>
            <Link
              to="/cases"
              className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1"
            >
              عرض الكل
              <FaChevronLeft />
            </Link>
          </div>

          {recentCases.length > 0 ? (
            <div className="space-y-4">
              {recentCases.map((caseItem) => (
                <Link
                  key={caseItem._id}
                  to={`/cases/${caseItem._id}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FaGavel className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-dark-800 truncate">
                      {caseItem.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {caseItem.caseNumber} • {caseItem.client?.name}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusColor(caseItem.status)}`}>
                    {getStatusText(caseItem.status)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaGavel className="text-4xl mx-auto mb-3 opacity-30" />
              <p>لا توجد قضايا مضافة</p>
            </div>
          )}
        </div>
      </div>

      {/* أزرار الإجراءات السريعة */}
      <div className="fixed left-6 bottom-6 flex flex-col gap-3">
        <Link
          to="/cases/new"
          className="w-14 h-14 rounded-full bg-gradient-to-l from-primary-500 to-primary-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:-translate-y-1"
          title="إضافة قضية جديدة"
        >
          <FaPlus className="text-xl" />
        </Link>

        {/* زر تفريغ قاعدة البيانات - للمسؤولين فقط */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-l from-red-500 to-red-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:-translate-y-1"
            title="تفريغ قاعدة البيانات"
          >
            <FaTrash className="text-xl" />
          </button>
        )}
      </div>

      {/* حوار تأكيد تفريغ قاعدة البيانات */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            {/* Header with warning color */}
            <div className="bg-gradient-to-l from-red-500 to-red-600 text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-3xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">⚠️ تحذير هام</h3>
                  <p className="text-red-100 text-sm mt-1">
                    عملية لا يمكن التراجع عنها
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-dark-800 mb-3">
                  هل أنت متأكد من حذف بيانات القضايا والعملاء والجلسات؟
                </h4>
                <p className="text-gray-600 mb-4">
                  سيتم حذف جميع البيانات التالية بشكل <strong className="text-red-600">نهائي</strong>:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <FaGavel className="text-red-500" />
                    <span>جميع القضايا والملفات المرتبطة بها</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaUsers className="text-red-500" />
                    <span>جميع بيانات العملاء</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCalendarAlt className="text-red-500" />
                    <span>جميع الجلسات والمواعيد</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>ملاحظة:</strong> سيتم الحفاظ على حسابات المستخدمين، جميع المستندات والملفات، والقوالب.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={clearingDatabase}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleClearDatabase}
                  disabled={clearingDatabase}
                  className="flex-1 px-6 py-3 bg-gradient-to-l from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {clearingDatabase ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري التفريغ...</span>
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      <span>تأكيد التفريغ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
