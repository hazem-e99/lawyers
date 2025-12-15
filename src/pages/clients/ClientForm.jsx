import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientsService } from '../../services';
import { FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * نموذج إضافة/تعديل العميل
 * Client Form Page
 */
const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    nationalId: '',
    clientType: 'individual',
    companyName: '',
    address: { street: '', city: '', state: '', country: 'مصر', postalCode: '' },
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    if (isEdit) fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await clientsService.getById(id);
      const client = response.data;
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        alternatePhone: client.alternatePhone || '',
        nationalId: client.nationalId || '',
        clientType: client.clientType || 'individual',
        companyName: client.companyName || '',
        address: client.address || { street: '', city: '', state: '', country: 'مصر', postalCode: '' },
        notes: client.notes || '',
        status: client.status || 'active',
      });
    } catch (error) {
      toast.error('حدث خطأ في جلب بيانات العميل');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await clientsService.update(id, formData);
        toast.success('تم تحديث بيانات العميل بنجاح');
      } else {
        await clientsService.create(formData);
        toast.success('تم إضافة العميل بنجاح');
      }
      navigate('/clients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/clients"
          className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <FaArrowRight />
        </Link>
        <h1 className="text-2xl font-bold text-dark-800">
          {isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* المعلومات الأساسية */}
            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">المعلومات الأساسية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
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
                  <label className="input-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">رقم الهاتف *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">رقم هاتف بديل</label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">الرقم القومي</label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* العنوان */}
            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">العنوان</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="input-label">الشارع</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">المدينة</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">المحافظة</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* ملاحظات */}
            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">ملاحظات</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows={4}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </div>

          {/* الجانب */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">التصنيف</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">نوع العميل</label>
                  <select
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="individual">فرد</option>
                    <option value="company">شركة</option>
                    <option value="government">جهة حكومية</option>
                  </select>
                </div>
                {formData.clientType === 'company' && (
                  <div>
                    <label className="input-label">اسم الشركة</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                )}
                <div>
                  <label className="input-label">الحالة</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="potential">محتمل</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'جارٍ الحفظ...' : isEdit ? 'تحديث البيانات' : 'إضافة العميل'}
              </button>
              <Link to="/clients" className="btn-secondary w-full mt-3 text-center block">
                إلغاء
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
