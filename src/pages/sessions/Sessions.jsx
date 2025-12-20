import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sessionsService } from '../../services';
import { FaPlus, FaCalendarAlt, FaClock, FaGavel, FaFileExcel, FaSearch, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { exportSessionsToExcel } from '../../utils/excelExport';

/**
 * صفحة الجلسات
 * Sessions List Page
 */
const Sessions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    sessionType: searchParams.get('sessionType') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState('upcoming');

  useEffect(() => {
    fetchSessions();
  }, [searchParams, quickFilter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      let response;
      const params = {
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        sessionType: searchParams.get('sessionType') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || '',
        limit: 100,
      };

      // استخدام Quick Filters فقط إذا لم يكن هناك فلاتر متقدمة
      const hasAdvancedFilters = params.search || params.status || params.sessionType || params.dateFrom || params.dateTo;
      
      if (!hasAdvancedFilters) {
        if (quickFilter === 'today') {
          response = await sessionsService.getToday();
        } else if (quickFilter === 'upcoming') {
          response = await sessionsService.getUpcoming(30);
        } else {
          response = await sessionsService.getAll(params);
        }
      } else {
        response = await sessionsService.getAll(params);
      }
      
      setSessions(response.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب الجلسات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', filters.search);
    setSearchParams(newParams);
  };

  const handleFilter = () => {
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set('search', filters.search);
    if (filters.status) newParams.set('status', filters.status);
    if (filters.sessionType) newParams.set('sessionType', filters.sessionType);
    if (filters.dateFrom) newParams.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) newParams.set('dateTo', filters.dateTo);
    setSearchParams(newParams);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      sessionType: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchParams(new URLSearchParams());
    setShowFilters(false);
  };

  const getSessionType = (type) => {
    const types = {
      hearing: 'جلسة استماع',
      pleading: 'مرافعة',
      ruling: 'نطق بالحكم',
      postponement: 'تأجيل',
      first_session: 'أول جلسة',
      expert: 'خبير',
      other: 'أخرى',
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { class: 'info', text: 'مجدولة' },
      completed: { class: 'success', text: 'مكتملة' },
      postponed: { class: 'warning', text: 'مؤجلة' },
      cancelled: { class: 'danger', text: 'ملغاة' },
    };
    return badges[status] || { class: 'info', text: status };
  };

  const handleExportToExcel = () => {
    if (sessions.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    try {
      exportSessionsToExcel(sessions);
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في تصدير البيانات');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">الجلسات</h1>
          <p className="text-gray-500 mt-1">إدارة جلسات المحكمة والمواعيد</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportToExcel}
            className="btn-secondary"
            disabled={sessions.length === 0}
          >
            <FaFileExcel />
            تصدير Excel
          </button>
          <Link to="/sessions/new" className="btn-primary">
            <FaPlus />
            إضافة جلسة
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="input-field pr-12"
                placeholder="ابحث عن جلسة، قضية أو عميل..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </form>
          <button
            className="btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            فلاتر متقدمة
          </button>
        </div>

        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="input-label">الحالة</label>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">الكل</option>
                <option value="scheduled">مجدولة</option>
                <option value="completed">مكتملة</option>
                <option value="postponed">مؤجلة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>
            <div>
              <label className="input-label">نوع الجلسة</label>
              <select
                className="input-field"
                value={filters.sessionType}
                onChange={(e) => setFilters({ ...filters, sessionType: e.target.value })}
              >
                <option value="">الكل</option>
                <option value="hearing">جلسة استماع</option>
                <option value="pleading">مرافعة</option>
                <option value="ruling">نطق بالحكم</option>
                <option value="postponement">تأجيل</option>
                <option value="first_session">أول جلسة</option>
                <option value="expert">خبير</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <label className="input-label">من تاريخ</label>
              <input
                type="date"
                className="input-field"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">إلى تاريخ</label>
              <input
                type="date"
                className="input-field"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="lg:col-span-4 flex gap-3">
              <button className="btn-primary" onClick={handleFilter}>
                تطبيق الفلتر
              </button>
              <button className="btn-secondary" onClick={clearFilters}>
                مسح الفلاتر
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'today', label: 'اليوم' },
          { value: 'upcoming', label: 'القادمة' },
          { value: 'all', label: 'الكل' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setQuickFilter(tab.value)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              quickFilter === tab.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => {
            const status = getStatusBadge(session.status);
            return (
              <div
                key={session._id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* التاريخ */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-primary-100 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {format(new Date(session.sessionDate), 'dd')}
                    </span>
                    <span className="text-sm text-primary-500">
                      {format(new Date(session.sessionDate), 'MMM', { locale: ar })}
                    </span>
                  </div>

                  {/* التفاصيل */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-dark-800">
                        {session.case?.title || 'بدون عنوان'}
                      </h3>
                      <span className={`status-badge ${status.class}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaGavel />
                        {session.case?.caseNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock />
                        {session.sessionTime || 'غير محدد'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        {getSessionType(session.sessionType)}
                      </span>
                    </div>
                    {session.court?.name && (
                      <p className="text-sm text-gray-500 mt-2">
                        المحكمة: {session.court.name}
                        {session.court.room && ` - ${session.court.room}`}
                      </p>
                    )}
                  </div>

                  {/* الإجراءات */}
                  <div className="flex gap-2">
                    <Link
                      to={`/cases/${session.case?._id}`}
                      className="btn-secondary text-sm py-2"
                    >
                      عرض القضية
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد جلسات</h3>
          <p className="text-gray-500 mb-4">
            {quickFilter === 'today'
              ? 'لا توجد جلسات اليوم'
              : quickFilter === 'upcoming'
              ? 'لا توجد جلسات قادمة'
              : 'لم يتم إضافة جلسات بعد'}
          </p>
          <Link to="/sessions/new" className="btn-primary inline-flex">
            <FaPlus />
            إضافة جلسة
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sessions;
