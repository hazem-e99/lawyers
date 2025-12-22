import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersService } from '../../services';
import { FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * نموذج إضافة/تعديل المستخدم
 * User Form Page
 */
const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'lawyer',
    specialization: '',
    licenseNumber: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEdit) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await usersService.getById(id);
      const user = response.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        role: user.role || 'lawyer',
        specialization: user.specialization || '',
        licenseNumber: user.licenseNumber || '',
        isActive: user.isActive ?? true,
      });
    } catch (error) {
      toast.error('حدث خطأ في جلب بيانات المستخدم');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData };
      if (!data.password) delete data.password;

      if (isEdit) {
        await usersService.update(id, data);
        toast.success('تم تحديث بيانات المستخدم بنجاح');
      } else {
        await usersService.create(data);
        toast.success('تم إضافة المستخدم بنجاح');
      }
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/users"
          className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <FaArrowRight />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {isEdit ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">المعلومات الأساسية</h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">الاسم *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">البريد الإلكتروني *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">
                  كلمة المرور {isEdit && '(اتركها فارغة للإبقاء على الحالية)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  {...(!isEdit && { required: true, minLength: 6 })}
                />
              </div>
              <div>
                <label className="input-label">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">الدور والصلاحيات</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">الدور</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="lawyer">محامي</option>
                    <option value="assistant">مساعد</option>
                    <option value="viewer">مشاهد</option>
                    <option value="superadmin">مدير النظام (Super Admin)</option>
                    <option value="admin">مسؤول (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">التخصص</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">رقم الترخيص</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-gray-700">حساب نشط</label>
                </div>
              </div>
            </div>

            <div className="card">
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'جارٍ الحفظ...' : isEdit ? 'تحديث البيانات' : 'إضافة المستخدم'}
              </button>
              <Link to="/users" className="btn-secondary w-full mt-3 text-center block">
                إلغاء
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
