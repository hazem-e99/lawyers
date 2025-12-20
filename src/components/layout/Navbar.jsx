import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsService } from '../../services';
import {
  FaBars,
  FaSearch,
  FaBell,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaGavel,
  FaCalendarAlt,
  FaTimes,
  FaCheckDouble,
} from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * شريط التنقل العلوي
 * Navbar Component
 */
const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // جلب الإشعارات
  useEffect(() => {
    fetchNotifications();
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsService.getAll({ limit: 10 });
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // تحديد إشعار كمقروء
  const markAsRead = async (notifId) => {
    try {
      await notificationsService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // تحديد الكل كمقروء
  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // الضغط على إشعار
  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // الحصول على أيقونة الإشعار
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'case_assigned':
        return <FaGavel className="text-[var(--color-primary)" />;
      case 'session_reminder':
      case 'session_created':
        return <FaCalendarAlt className="text-blue-500" />;
      default:
        return <FaBell className="text-amber-500" />;
    }
  };

  // الحصول على الأحرف الأولى من الاسم
  const getInitials = (name) => {
    if (!name) return 'م';
    const parts = name.split(' ');
    return parts.length > 1
      ? parts[0].charAt(0) + parts[1].charAt(0)
      : parts[0].charAt(0);
  };

  // الحصول على URL الصورة
  const getAvatarUrl = () => {
    if (!user?.avatar || user.avatar === 'default-avatar.png') {
      return null;
    }
    if (user.avatar.startsWith('/uploads')) {
      return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`;
    }
    return user.avatar;
  };

  // البحث
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // إغلاق القوائم
  const closeMenus = () => {
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  return (
    <header className="navbar">
      {/* الجانب الأيمن */}
      <div className="navbar-right">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <FaBars />
        </button>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن قضية، عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </form>
      </div>

      {/* الجانب الأيسر */}
      <div className="navbar-left">
        {/* الإشعارات */}
        <div className="relative">
          <button
            className="nav-btn"
            title="الإشعارات"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* قائمة الإشعارات */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeMenus} />
              <div className="absolute left-0 top-12 bg-white rounded-xl shadow-elegant z-50 overflow-hidden w-80">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[var(--color-text)]">الإشعارات</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[var(--color-primary) hover:text-primary-600 flex items-center gap-1"
                        title="تحديد الكل كمقروء"
                      >
                        <FaCheckDouble />
                        قراءة الكل
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer ${
                          !notif.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.isRead ? 'bg-gray-100' : 'bg-primary-100'
                          }`}
                        >
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              notif.isRead
                                ? 'text-gray-500'
                                : 'font-medium text-[var(--color-text)]'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(notif.createdAt), 'dd MMM - HH:mm', {
                              locale: ar,
                            })}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <FaBell className="text-3xl mx-auto mb-2 opacity-30" />
                      <p>لا توجد إشعارات</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* قائمة المستخدم */}
        <div
          className="user-menu"
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowNotifications(false);
          }}
        >
          {getAvatarUrl() ? (
            <img src={getAvatarUrl()} alt={user?.name} className="user-avatar-sm-img" />
          ) : (
            <div className="user-avatar-sm">{getInitials(user?.name)}</div>
          )}
          <span className="user-name-sm">{user?.name?.split(' ')[0]}</span>
        </div>

        {/* القائمة المنسدلة للمستخدم */}
        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenus} />
            <div className="absolute left-4 top-16 bg-white rounded-xl shadow-elegant z-50 overflow-hidden min-w-[200px]">
              <div className="p-4 border-b border-gray-100">
                <p className="font-bold text-[var(--color-text)]">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="py-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={closeMenus}
                >
                  <FaUser className="text-gray-400" />
                  <span>الملف الشخصي</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={closeMenus}
                >
                  <FaCog className="text-gray-400" />
                  <span>الإعدادات</span>
                </Link>
              </div>
              <div className="py-2 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <FaSignOutAlt />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
