import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaCamera, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * صفحة الملف الشخصي
 * Profile Page
 */
const Profile = () => {
  const { user, updateProfile, changePassword, uploadAvatar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    licenseNumber: user?.licenseNumber || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // الحصول على URL الصورة
  const getAvatarUrl = () => {
    if (!user?.avatar || user.avatar === 'default-avatar.png') {
      return null;
    }
    // إذا كانت الصورة تبدأ بـ /uploads، أضف base URL
    if (user.avatar.startsWith('/uploads')) {
      return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`;
    }
    return user.avatar;
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(profileData);
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setLoading(false);
  };

  // معالجة اختيار الصورة
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // رفع الصورة
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('نوع الملف غير مسموح. يرجى رفع صورة (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    setUploadingAvatar(true);
    await uploadAvatar(file);
    setUploadingAvatar(false);
    
    // مسح قيمة الـ input
    e.target.value = '';
  };

  const getRoleName = (role) => {
    const roles = { admin: 'مسؤول النظام', lawyer: 'محامي', assistant: 'مساعد', viewer: 'مشاهد' };
    return roles[role] || role;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">الملف الشخصي</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* معلومات المستخدم */}
        <div className="card">
          <div className="text-center">
            {/* صورة الملف الشخصي مع زر التغيير */}
            <div className="relative inline-block mb-4">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              
              {/* زر تغيير الصورة */}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                title="تغيير الصورة"
              >
                {uploadingAvatar ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaCamera className="text-sm" />
                )}
              </button>
              
              {/* input مخفي لاختيار الملف */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            <h2 className="text-xl font-bold text-[var(--color-text)]">{user?.name}</h2>
            <p className="text-gray-500">{getRoleName(user?.role)}</p>
            {user?.specialization && (
              <p className="text-sm text-gray-500 mt-2">{user.specialization}</p>
            )}
            
            {/* رسالة توضيحية */}
            <p className="text-xs text-gray-400 mt-4">
              اضغط على أيقونة الكاميرا لتغيير الصورة
            </p>
          </div>
        </div>

        {/* تعديل المعلومات */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="card">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">المعلومات الشخصية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">الاسم</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">التخصص</label>
                <input
                  type="text"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">رقم الترخيص</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={profileData.licenseNumber}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-4" disabled={loading}>
              <FaSave />
              حفظ التغييرات
            </button>
          </form>

          {/* تغيير كلمة المرور */}
          <form onSubmit={handlePasswordSubmit} className="card">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">
              <FaLock className="inline ml-2" />
              تغيير كلمة المرور
            </h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">كلمة المرور الحالية</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="input-label">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-4" disabled={loading}>
              تغيير كلمة المرور
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
