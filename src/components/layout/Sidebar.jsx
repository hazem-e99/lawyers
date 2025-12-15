import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaBalanceScale,
  FaHome,
  FaGavel,
  FaUsers,
  FaCalendarAlt,
  FaCalendarCheck,
  FaFolderOpen,
  FaBook,
  FaUsersCog,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

/**
 * الشريط الجانبي
 * Sidebar Component
 */
const Sidebar = ({ isOpen, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout, isAdmin } = useAuth();

  // عناصر القائمة
  const menuItems = [
    {
      section: 'الرئيسية',
      items: [
        { path: '/dashboard', icon: FaHome, label: 'لوحة التحكم' },
      ],
    },
    {
      section: 'إدارة القضايا',
      items: [
        { path: '/cases', icon: FaGavel, label: 'القضايا' },
        { path: '/clients', icon: FaUsers, label: 'العملاء' },
        { path: '/sessions', icon: FaCalendarAlt, label: 'الجلسات' },
        { path: '/calendar', icon: FaCalendarCheck, label: 'تقويم الجلسات' },
      ],
    },
    {
      section: 'الملفات',
      items: [
        { path: '/documents', icon: FaFolderOpen, label: 'المستندات' },
        { path: '/library', icon: FaBook, label: 'المكتبة' },
      ],
    },
  ];

  // إضافة قسم الإدارة للمسؤول فقط
  if (isAdmin) {
    menuItems.push({
      section: 'الإدارة',
      items: [
        { path: '/users', icon: FaUsersCog, label: 'المستخدمين' },
        { path: '/settings', icon: FaCog, label: 'الإعدادات' },
      ],
    });
  }

  // الحصول على الأحرف الأولى من الاسم
  const getInitials = (name) => {
    if (!name) return 'م';
    const parts = name.split(' ');
    return parts.length > 1
      ? parts[0].charAt(0) + parts[1].charAt(0)
      : parts[0].charAt(0);
  };

  // الحصول على اسم الدور بالعربية
  const getRoleName = (role) => {
    const roles = {
      admin: 'مسؤول النظام',
      lawyer: 'محامي',
      assistant: 'مساعد',
      viewer: 'مشاهد',
    };
    return roles[role] || role;
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

  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* رأس الشريط الجانبي */}
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo" onClick={onMobileClose}>
          <FaBalanceScale className="logo-icon" />
          {isOpen && <span className="sidebar-logo-text">المحاماة</span>}
        </Link>
        <button className="sidebar-toggle" onClick={onToggle} title={isOpen ? 'تصغير' : 'توسيع'}>
          {isOpen ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* قائمة التنقل */}
      <nav className="sidebar-nav">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="nav-section">
            {isOpen && <h3 className="nav-section-title">{section.section}</h3>}
            {section.items.map((item, itemIndex) => (
              <NavLink
                key={itemIndex}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={onMobileClose}
                title={!isOpen ? item.label : ''}
              >
                <item.icon className="nav-icon" />
                {isOpen && <span className="nav-text">{item.label}</span>}
                {isOpen && item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* معلومات المستخدم */}
      <div className="sidebar-user">
        {getAvatarUrl() ? (
          <img src={getAvatarUrl()} alt={user?.name} className="user-avatar-img" />
        ) : (
          <div className="user-avatar">{getInitials(user?.name)}</div>
        )}
        {isOpen && (
          <div className="sidebar-user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{getRoleName(user?.role)}</div>
          </div>
        )}
        <button className="sidebar-logout" onClick={logout} title="تسجيل الخروج">
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
