import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

/**
 * مكون تقويم الجلسات
 * Sessions Calendar Component
 * 
 * يعرض جلسات المحكمة على شكل تقويم مع دعم RTL والعربية
 * Displays court sessions on a calendar with RTL and Arabic support
 */
const SessionsCalendar = ({ events, onEventClick, loading }) => {
  const calendarRef = useRef(null);

  // ترجمة أزرار التقويم للعربية
  const arabicButtonText = {
    today: 'اليوم',
    month: 'شهر',
    week: 'أسبوع',
    day: 'يوم',
    prev: 'السابق',
    next: 'التالي',
  };

  /**
   * معالجة تنسيق عنوان الحدث
   * Handle event content rendering
   */
  const renderEventContent = (eventInfo) => {
    const { event, timeText } = eventInfo;
    const hasTime = !event.allDay && timeText;
    
    return (
      <div className="fc-event-content-wrapper">
        {/* عرض الوقت إذا كان موجوداً */}
        {hasTime && (
          <div className="fc-event-time-text">
            {timeText}
          </div>
        )}
        <div className="fc-event-title-text">
          {event.title}
        </div>
        {event.extendedProps?.clientName && (
          <div className="fc-event-client">
            {event.extendedProps.clientName}
          </div>
        )}
      </div>
    );
  };

  /**
   * معالجة النقر على الحدث
   * Handle event click
   */
  const handleEventClick = (clickInfo) => {
    if (onEventClick) {
      onEventClick(clickInfo.event);
    }
  };

  return (
    <div className="sessions-calendar-container">
      {loading && (
        <div className="calendar-loading-overlay">
          <div className="loading-spinner"></div>
          <span>جاري تحميل الجلسات...</span>
        </div>
      )}
      
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        direction="rtl"
        locale="ar"
        
        // إعدادات العرض
        headerToolbar={{
          start: 'prev,next today',
          center: 'title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        
        // أزرار عربية
        buttonText={arabicButtonText}
        
        // الأحداث (الجلسات)
        events={events}
        
        // تخصيص عرض الأحداث
        eventContent={renderEventContent}
        
        // عرض الألوان بشكل صحيح
        eventDisplay="block"
        
        // معالجة النقر (للقراءة فقط - عرض التفاصيل)
        eventClick={handleEventClick}
        
        // إعدادات العرض
        dayMaxEvents={3}
        moreLinkText={(count) => `+${count} جلسات أخرى`}
        
        // تعطيل السحب والإفلات (للقراءة فقط)
        editable={false}
        droppable={false}
        selectable={false}
        
        // تخصيص المظهر
        height="auto"
        contentHeight="auto"
        aspectRatio={1.8}
        
        // إعدادات التوقيت
        firstDay={6} // السبت هو أول يوم في الأسبوع
        weekends={true}
        
        // تخصيص أسماء الأيام
        dayHeaderFormat={{ weekday: 'short' }}
        
        // إعدادات عرض الوقت
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }}
        
        // إعدادات إضافية
        navLinks={true}
        nowIndicator={true}
        
        // معالجة أسماء الأشهر
        titleFormat={{ year: 'numeric', month: 'long' }}
      />
    </div>
  );
};

export default SessionsCalendar;
