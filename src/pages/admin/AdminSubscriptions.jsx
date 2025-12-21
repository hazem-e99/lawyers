import { useState, useEffect } from 'react';
import { usersService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUsers, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaCalendarAlt,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

/**
 * صفحة إدارة اشتراكات المستخدمين (للأدمن فقط)
 * Admin Subscriptions Management Page
 */
const AdminSubscriptions = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, trial, expired
  const [activatingUser, setActivatingUser] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll({ limit: 100 });
      setUsers(response.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const activateSubscription = async (userId, isTrial = false) => {
    try {
      setActivatingUser(userId);
      const durationDays = isTrial ? 7 : 30;
      
      await api.post('/subscription/start', {
        userId,
        isTrial,
        durationDays
      });

      toast.success(isTrial ? 'تم تفعيل الفترة التجريبية بنجاح' : 'تم تفعيل الاشتراك بنجاح');
      await fetchUsers(); // تحديث القائمة
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في تفعيل الاشتراك');
    } finally {
      setActivatingUser(null);
    }
  };

  const renewSubscription = async (userId) => {
    try {
      setActivatingUser(userId);
      
      await api.post('/subscription/renew', { userId });
      
      toast.success('تم تجديد الاشتراك بنجاح');
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في تجديد الاشتراك');
    } finally {
      setActivatingUser(null);
    }
  };

  const cancelSubscription = async (userId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء الاشتراك؟')) return;

    try {
      setActivatingUser(userId);
      
      await api.post('/subscription/cancel', { userId });
      
      toast.success('تم إلغاء الاشتراك');
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في إلغاء الاشتراك');
    } finally {
      setActivatingUser(null);
    }
  };

  const getSubscriptionStatus = (user) => {
    if (user.role === 'admin') return 'admin';
    if (!user.subscription || !user.subscription.isActive) return 'inactive';
    
    const now = new Date();
    const expiresAt = new Date(user.subscription.expiresAt);
    
    if (expiresAt < now) return 'expired';
    if (user.subscription.isTrial) return 'trial';
    return 'active';
  };

  const getDaysRemaining = (user) => {
    if (!user.subscription?.expiresAt) return 0;
    
    const now = new Date();
    const expiresAt = new Date(user.subscription.expiresAt);
    const diffTime = expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredUsers = users.filter(user => {
    // البحث
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // الفلتر
    if (filterStatus === 'all') return true;
    
    const status = getSubscriptionStatus(user);
    
    if (filterStatus === 'active') return status === 'active' || status === 'admin';
    if (filterStatus === 'inactive') return status === 'inactive';
    if (filterStatus === 'trial') return status === 'trial';
    if (filterStatus === 'expired') return status === 'expired';
    
    return true;
  });

  // إحصائيات
  const stats = {
    total: users.length,
    active: users.filter(u => {
      const status = getSubscriptionStatus(u);
      return status === 'active' || status === 'admin';
    }).length,
    trial: users.filter(u => getSubscriptionStatus(u) === 'trial').length,
    inactive: users.filter(u => {
      const status = getSubscriptionStatus(u);
      return status === 'inactive' || status === 'expired';
    }).length,
  };

  if (!isAdmin) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-bold text-gray-600">غير مصرح</h2>
        <p className="text-gray-500 mt-2">هذه الصفحة متاحة للمسؤولين فقط</p>
      </div>
    );
  }

  return (
<div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">إدارة الاشتراكات</h1>
        <p className="text-gray-500 mt-1">تحكم في اشتراكات جميع المستخدمين</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <FaUsers className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">اشتراكات نشطة</p>
              <p className="text-3xl font-bold mt-1">{stats.active}</p>
            </div>
            <FaCheckCircle className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">فترات تجريبية</p>
              <p className="text-3xl font-bold mt-1">{stats.trial}</p>
            </div>
            <FaClock className="text-4xl text-yellow-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">غير نشط / منتهي</p>
              <p className="text-3xl font-bold mt-1">{stats.inactive}</p>
            </div>
            <FaTimesCircle className="text-4xl text-red-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pr-10 w-full"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="trial">تجريبي</option>
              <option value="inactive">غير نشط</option>
              <option value="expired">منتهي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>الدور</th>
                  <th>حالة الاشتراك</th>
                  <th>تاريخ الانتهاء</th>
                  <th>الأيام المتبقية</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const status = getSubscriptionStatus(user);
                  const daysRemaining = getDaysRemaining(user);

                  return (
                    <tr key={user._id}>
                      <td>
                        <div>
                          <p className="font-medium text-[var(--color-text)]">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${user.role === 'admin' ? 'warning' : 'info'}`}>
                          {user.role === 'admin' ? 'مسؤول' : user.role === 'lawyer' ? 'محامي' : 'مساعد'}
                        </span>
                      </td>
                      <td>
                        {status === 'admin' && (
                          <span className="status-badge success">دائم</span>
                        )}
                        {status === 'active' && (
                          <span className="status-badge success">نشط</span>
                        )}
                        {status === 'trial' && (
                          <span className="status-badge warning">تجريبي</span>
                        )}
                        {status === 'inactive' && (
                          <span className="status-badge secondary">غير نشط</span>
                        )}
                        {status === 'expired' && (
                          <span className="status-badge danger">منتهي</span>
                        )}
                      </td>
                      <td>
                        {user.subscription?.expiresAt ? (
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400 text-sm" />
                            <span className="text-sm">
                              {new Date(user.subscription.expiresAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td>
                        {status === 'admin' ? (
                          <span className="text-gray-400">∞</span>
                        ) : daysRemaining > 0 ? (
                          <span className={`font-semibold ${
                            daysRemaining <= 3 ? 'text-red-600' : 
                            daysRemaining <= 7 ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {daysRemaining} يوم
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td>
                        {user.role !== 'admin' && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {(status === 'inactive' || status === 'expired') && (
                              <>
                                <button
                                  onClick={() => activateSubscription(user._id, true)}
                                  disabled={activatingUser === user._id}
                                  className="btn-sm bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                                >
                                  تجريبي 7 أيام
                                </button>
                                <button
                                  onClick={() => activateSubscription(user._id, false)}
                                  disabled={activatingUser === user._id}
                                  className="btn-sm bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                                >
                                  مدفوع 30 يوم
                                </button>
                              </>
                            )}
                            {(status === 'active' || status === 'trial') && (
                              <>
                                <button
                                  onClick={() => renewSubscription(user._id)}
                                  disabled={activatingUser === user._id}
                                  className="btn-sm bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                                >
                                  تجديد
                                </button>
                                <button
                                  onClick={() => cancelSubscription(user._id)}
                                  disabled={activatingUser === user._id}
                                  className="btn-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                                >
                                  إلغاء
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">لا يوجد مستخدمين</h3>
          <p className="text-gray-500">جرب تغيير معايير البحث</p>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
