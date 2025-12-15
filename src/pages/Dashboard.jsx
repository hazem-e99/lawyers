import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services';
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
      <div className="fixed left-6 bottom-6">
        <Link
          to="/cases/new"
          className="w-14 h-14 rounded-full bg-gradient-to-l from-primary-500 to-primary-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:-translate-y-1"
          title="إضافة قضية جديدة"
        >
          <FaPlus className="text-xl" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
