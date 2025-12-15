import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsService } from '../../services';
import SessionsCalendar from '../../components/calendar/SessionsCalendar';
import { FaCalendarAlt, FaCircle, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * صفحة تقويم الجلسات
 * Sessions Calendar Page
 * 
 * تعرض جميع جلسات المحكمة على شكل تقويم
 * Displays all court sessions in a calendar view
 */
const Calendar = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  /**
   * تحويل حالة الجلسة إلى لون
   * Convert session status to color
   * 
   * جارية → أزرق (blue)
   * مؤجلة → أصفر (yellow)
   * محكوم فيها → أخضر (green)
   */
  const getStatusColor = (status) => {
    const colors = {
      // الحالات الأساسية المطلوبة
      'جارية': { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
      'مؤجلة': { bg: '#f59e0b', border: '#d97706', text: '#1f2937' },
      'محكوم فيها': { bg: '#10b981', border: '#059669', text: '#ffffff' },
      
      // حالات إضافية من النظام (للتوافق)
      'scheduled': { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
      'postponed': { bg: '#f59e0b', border: '#d97706', text: '#1f2937' },
      'completed': { bg: '#10b981', border: '#059669', text: '#ffffff' },
      'cancelled': { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
    };
    
    return colors[status] || { bg: '#6b7280', border: '#4b5563', text: '#ffffff' };
  };

  /**
   * ترجمة حالة الجلسة للعربية
   * Translate session status to Arabic
   */
  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'جارية',
      'postponed': 'مؤجلة',
      'completed': 'محكوم فيها',
      'cancelled': 'ملغاة',
      'جارية': 'جارية',
      'مؤجلة': 'مؤجلة',
      'محكوم فيها': 'محكوم فيها',
    };
    return labels[status] || status;
  };

  /**
   * ترجمة نوع الجلسة للعربية
   * Translate session type to Arabic
   */
  const getSessionTypeName = (type) => {
    const types = {
      'hearing': 'جلسة استماع',
      'pleading': 'مرافعة',
      'ruling': 'نطق بالحكم',
      'postponement': 'تأجيل',
      'first_session': 'أول جلسة',
      'expert': 'خبير',
      'other': 'أخرى',
    };
    return types[type] || 'جلسة';
  };

  /**
   * دالة مساعدة لدمج التاريخ والوقت
   * Helper function to combine date and time
   */
  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    
    // إذا لم يكن هناك وقت، نعيد التاريخ فقط
    if (!timeStr) {
      return dateStr;
    }
    
    try {
      // تحويل التاريخ إلى كائن Date
      const date = new Date(dateStr);
      
      // تحليل الوقت (يمكن أن يكون بصيغ مختلفة مثل "09:00" أو "9:00 AM" أو "٩:٠٠ ص")
      let hours = 0;
      let minutes = 0;
      
      // محاولة تحليل الوقت بصيغة 24 ساعة (مثل "09:00" أو "14:30")
      const time24Match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (time24Match) {
        hours = parseInt(time24Match[1], 10);
        minutes = parseInt(time24Match[2], 10);
        
        // التحقق من صيغة AM/PM
        if (timeStr.toLowerCase().includes('pm') || timeStr.includes('م')) {
          if (hours !== 12) hours += 12;
        } else if (timeStr.toLowerCase().includes('am') || timeStr.includes('ص')) {
          if (hours === 12) hours = 0;
        }
      }
      
      // تعيين الوقت على التاريخ
      date.setHours(hours, minutes, 0, 0);
      
      return date.toISOString();
    } catch (error) {
      console.error('Error combining date and time:', error);
      return dateStr;
    }
  };

  /**
   * جلب الجلسات من الـ API
   * Fetch sessions from API
   */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sessionsService.getAll({ limit: 1000 });
      
      // تحويل الجلسات إلى أحداث التقويم
      const calendarEvents = response.data.map((session) => {
        // تتبع حالة الجلسة للتأكد من الألوان
        console.log('Session:', session._id, 'Status:', session.status, 'Color:', getStatusColor(session.status));
        
        const statusColor = getStatusColor(session.status);
        const sessionDate = session.sessionDate || session.date;
        const sessionTime = session.sessionTime;
        
        // دمج التاريخ والوقت إذا كان الوقت موجوداً
        const hasTime = sessionTime && sessionTime.trim() !== '';
        const startDateTime = hasTime 
          ? combineDateTime(sessionDate, sessionTime)
          : sessionDate;
        
        // إنشاء عنوان الجلسة: نوع الجلسة - رقم القضية
        const sessionTypeName = getSessionTypeName(session.sessionType);
        const caseNumber = session.case?.caseNumber || session.caseNumber || '';
        const eventTitle = caseNumber 
          ? `${sessionTypeName} - ${caseNumber}`
          : sessionTypeName;
        
        return {
          id: session._id,
          title: eventTitle,
          start: startDateTime,
          // إذا كان هناك وقت محدد، لا تعرض كـ all day
          allDay: !hasTime,
          backgroundColor: statusColor.bg,
          borderColor: statusColor.border,
          textColor: statusColor.text,
          extendedProps: {
            sessionId: session._id,
            caseId: session.case?._id,
            caseNumber: session.case?.caseNumber || session.caseNumber,
            clientName: session.case?.client?.name || session.clientName || '',
            status: session.status,
            statusLabel: getStatusLabel(session.status),
            court: session.court?.name || '',
            room: session.court?.room || '',
            sessionType: session.sessionType,
            sessionTypeName: sessionTypeName,
            sessionTime: session.sessionTime,
            notes: session.notes,
          },
        };
      });
      
      setSessions(calendarEvents);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('حدث خطأ في جلب الجلسات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * معالجة النقر على الحدث (عرض التفاصيل)
   * Handle event click (show details)
   */
  const handleEventClick = (event) => {
    setSelectedSession({
      id: event.id,
      title: event.title,
      ...event.extendedProps,
    });
  };

  /**
   * إغلاق نافذة التفاصيل
   * Close details modal
   */
  const closeModal = () => {
    setSelectedSession(null);
  };

  /**
   * الانتقال لصفحة القضية
   * Navigate to case details
   */
  const goToCase = () => {
    if (selectedSession?.caseId) {
      navigate(`/cases/${selectedSession.caseId}`);
    }
  };

  // دليل الألوان
  const legend = [
    { status: 'جارية', color: '#3b82f6', label: 'جارية' },
    { status: 'مؤجلة', color: '#f59e0b', label: 'مؤجلة' },
    { status: 'محكوم فيها', color: '#10b981', label: 'محكوم فيها' },
  ];

  return (
    <div className="calendar-page">
      {/* العنوان */}
      <div className="calendar-header">
        <div className="header-content">
          <div className="header-title">
            <FaCalendarAlt className="header-icon" />
            <div>
              <h1>تقويم الجلسات</h1>
              <p>عرض جميع جلسات المحكمة على التقويم</p>
            </div>
          </div>
          
          {/* دليل الألوان */}
          <div className="status-legend">
            <span className="legend-title">حالة الجلسة:</span>
            {legend.map((item) => (
              <div key={item.status} className="legend-item">
                <FaCircle style={{ color: item.color, fontSize: '10px' }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* التقويم */}
      <div className="calendar-wrapper card">
        <SessionsCalendar
          events={sessions}
          onEventClick={handleEventClick}
          loading={loading}
        />
      </div>

      {/* نافذة تفاصيل الجلسة */}
      {selectedSession && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="session-modal modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تفاصيل الجلسة</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* نوع الجلسة */}
              <div className="session-detail">
                <span className="detail-label">نوع الجلسة:</span>
                <span className="detail-value">{selectedSession.sessionTypeName || 'جلسة'}</span>
              </div>
              
              <div className="session-detail">
                <span className="detail-label">رقم القضية:</span>
                <span className="detail-value">{selectedSession.caseNumber || selectedSession.title}</span>
              </div>
              
              {selectedSession.clientName && (
                <div className="session-detail">
                  <span className="detail-label">اسم العميل:</span>
                  <span className="detail-value">{selectedSession.clientName}</span>
                </div>
              )}
              
              <div className="session-detail">
                <span className="detail-label">الحالة:</span>
                <span 
                  className="detail-value status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(selectedSession.status).bg,
                    color: getStatusColor(selectedSession.status).text,
                  }}
                >
                  {selectedSession.statusLabel}
                </span>
              </div>
              
              {selectedSession.court && (
                <div className="session-detail">
                  <span className="detail-label">المحكمة:</span>
                  <span className="detail-value">
                    {selectedSession.court}
                    {selectedSession.room && ` - ${selectedSession.room}`}
                  </span>
                </div>
              )}
              
              {selectedSession.sessionTime && (
                <div className="session-detail">
                  <span className="detail-label">الوقت:</span>
                  <span className="detail-value">{selectedSession.sessionTime}</span>
                </div>
              )}
              
              {selectedSession.notes && (
                <div className="session-detail notes">
                  <span className="detail-label">ملاحظات:</span>
                  <p className="detail-value">{selectedSession.notes}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {selectedSession.caseId && (
                <button className="btn btn-primary" onClick={goToCase}>
                  عرض القضية
                </button>
              )}
              <button className="btn btn-secondary" onClick={closeModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* رسالة معلومات */}
      <div className="calendar-info">
        <FaInfoCircle />
        <span>انقر على أي جلسة لعرض تفاصيلها</span>
      </div>
    </div>
  );
};

export default Calendar;
