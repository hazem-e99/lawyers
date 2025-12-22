import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaUsersCog, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * صفحة المستخدمين
 * Users Page
 */
const Users = () => {
  const { isSuperAdmin } = useAuth(); // استخدام isSuperAdmin بدلاً من isAdmin
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) fetchUsers();
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      // استخدام API المخصص لجلب جميع الاشتراكات والمستخدمين للـ Super Admin
      // أو استخدام usersService إذا تم تحديث الـ endpoint الخاص به
      // سأستخدم usersService كما هو، مفترضًا أنه يوجه لـ /api/users الذي يعمل للـ superadmin
      const response = await usersService.getAll(); 
      setUsers(response.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await usersService.toggleStatus(id);
      toast.success('تم تحديث حالة المستخدم');
      fetchUsers();
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await usersService.delete(id);
        toast.success('تم حذف المستخدم بنجاح');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'حدث خطأ');
      }
    }
  };

  const getRoleName = (role) => {
    const roles = {
      superadmin: 'مدير النظام',
      admin: 'مدير مكتب',
      lawyer: 'محامي',
      assistant: 'مساعد',
      viewer: 'مشاهد',
    };
    return roles[role] || role;
  };

  if (!isSuperAdmin) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">المستخدمين</h1>
          <p className="text-gray-500 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <Link to="/users/new" className="btn-primary">
          <FaPlus />
          إضافة مستخدم
        </Link>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : users.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الهاتف</th>
                  <th>الدور</th>
                  <th>حالة الاشتراك</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="font-medium">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className={`status-badge ${user.role === 'admin' ? 'warning' : 'info'}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="status-badge success">دائم</span>
                      ) : user.subscription?.isActive ? (
                        <div className="flex flex-col gap-1">
                          <span className="status-badge success">نشط</span>
                          {user.subscription.isTrial && (
                            <span className="text-xs text-yellow-600">تجريبي</span>
                          )}
                        </div>
                      ) : (
                        <Link 
                          to="/admin/subscriptions"
                          className="status-badge danger hover:bg-red-600 hover:text-white transition-colors"
                        >
                          غير نشط
                        </Link>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`flex items-center gap-1 ${
                          user.isActive ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {user.isActive ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                        <span className="text-sm">{user.isActive ? 'نشط' : 'معطل'}</span>
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/users/${user._id}/edit`}
                          className="p-2 text-gray-500 hover:text-amber-500 hover:bg-gray-100 rounded-lg"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <FaUsersCog className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">لا يوجد مستخدمين</h3>
          <Link to="/users/new" className="btn-primary inline-flex mt-4">
            <FaPlus />
            إضافة مستخدم
          </Link>
        </div>
      )}
    </div>
  );
};

export default Users;
