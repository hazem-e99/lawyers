import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionsService } from '../../services';
import { FaPlus, FaCalendarAlt, FaClock, FaGavel } from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

/**
 * صفحة الجلسات
 * Sessions List Page
 */
const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      let response;
      if (filter === 'today') {
        response = await sessionsService.getToday();
      } else if (filter === 'upcoming') {
        response = await sessionsService.getUpcoming(30);
      } else {
        response = await sessionsService.getAll({ limit: 50 });
      }
      setSessions(response.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب الجلسات');
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">الجلسات</h1>
          <p className="text-gray-500 mt-1">إدارة جلسات المحكمة والمواعيد</p>
        </div>
        <Link to="/sessions/new" className="btn-primary">
          <FaPlus />
          إضافة جلسة
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'today', label: 'اليوم' },
          { value: 'upcoming', label: 'القادمة' },
          { value: 'all', label: 'الكل' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.value
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
            {filter === 'today'
              ? 'لا توجد جلسات اليوم'
              : filter === 'upcoming'
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
