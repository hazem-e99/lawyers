import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { casesService, clientsService, usersService } from '../../services';
import { FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * نموذج إضافة/تعديل القضية
 * Case Form Page
 */
const CaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseType: 'civil',
    status: 'open',
    priority: 'medium',
    client: '',
    assignedLawyer: '',
    court: { name: '', circuit: '', location: '' },
    opposingParty: { name: '', lawyer: '', contact: '' },
    filingDate: '',
    fees: { agreed: 0, paid: 0 },
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // جلب العملاء والمحامين
      const [clientsRes, lawyersRes] = await Promise.all([
        clientsService.getAll({ limit: 100 }),
        usersService.getLawyers(),
      ]);
      setClients(clientsRes.data);
      setLawyers(lawyersRes.data);

      // جلب بيانات القضية في حالة التعديل
      if (isEdit) {
        const caseRes = await casesService.getById(id);
        const caseData = caseRes.data;
        setFormData({
          title: caseData.title || '',
          description: caseData.description || '',
          caseType: caseData.caseType || 'civil',
          status: caseData.status || 'open',
          priority: caseData.priority || 'medium',
          client: caseData.client?._id || '',
          assignedLawyer: caseData.assignedLawyer?._id || '',
          court: caseData.court || { name: '', circuit: '', location: '' },
          opposingParty: caseData.opposingParty || { name: '', lawyer: '', contact: '' },
          filingDate: caseData.filingDate?.split('T')[0] || '',
          fees: caseData.fees || { agreed: 0, paid: 0 },
        });
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب البيانات');
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
        await casesService.update(id, formData);
        toast.success('تم تحديث القضية بنجاح');
      } else {
        await casesService.create(formData);
        toast.success('تم إضافة القضية بنجاح');
      }
      navigate('/cases');
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
          to="/cases"
          className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <FaArrowRight />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {isEdit ? 'تعديل القضية' : 'إضافة قضية جديدة'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* المعلومات الأساسية */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">المعلومات الأساسية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="input-label">عنوان القضية *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="input-label">الوصف</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="input-label">نوع القضية *</label>
                  <select
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="civil">مدني</option>
                    <option value="criminal">جنائي</option>
                    <option value="family">أحوال شخصية</option>
                    <option value="commercial">تجاري</option>
                    <option value="labor">عمالي</option>
                    <option value="administrative">إداري</option>
                    <option value="real_estate">عقاري</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">الحالة</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="open">مفتوحة</option>
                    <option value="in_progress">جارية</option>
                    <option value="pending">معلقة</option>
                    <option value="closed">مغلقة</option>
                    <option value="won">مربوحة</option>
                    <option value="lost">خاسرة</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">الأولوية</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">تاريخ الإيداع</label>
                  <input
                    type="date"
                    name="filingDate"
                    value={formData.filingDate}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* معلومات المحكمة */}
            <div className="card">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">معلومات المحكمة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">اسم المحكمة</label>
                  <input
                    type="text"
                    name="court.name"
                    value={formData.court.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">الدائرة</label>
                  <input
                    type="text"
                    name="court.circuit"
                    value={formData.court.circuit}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">الموقع</label>
                  <input
                    type="text"
                    name="court.location"
                    value={formData.court.location}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* الطرف الآخر */}
            <div className="card">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">الطرف الآخر</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">الاسم</label>
                  <input
                    type="text"
                    name="opposingParty.name"
                    value={formData.opposingParty.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">محامي الطرف الآخر</label>
                  <input
                    type="text"
                    name="opposingParty.lawyer"
                    value={formData.opposingParty.lawyer}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">رقم التواصل</label>
                  <input
                    type="text"
                    name="opposingParty.contact"
                    value={formData.opposingParty.contact}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* الجانب */}
          <div className="space-y-6">
            {/* العميل والمحامي */}
            <div className="card">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">التعيينات</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">العميل *</label>
                  <select
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">اختر العميل</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">المحامي المسؤول</label>
                  <select
                    name="assignedLawyer"
                    value={formData.assignedLawyer}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">اختر المحامي</option>
                    {lawyers.map((lawyer) => (
                      <option key={lawyer._id} value={lawyer._id}>
                        {lawyer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* الأتعاب */}
            <div className="card">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">الأتعاب</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">المبلغ المتفق عليه</label>
                  <input
                    type="number"
                    name="fees.agreed"
                    value={formData.fees.agreed}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="input-label">المبلغ المدفوع</label>
                  <input
                    type="number"
                    name="fees.paid"
                    value={formData.fees.paid}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* الإجراءات */}
            <div className="card">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'جارٍ الحفظ...' : isEdit ? 'تحديث القضية' : 'إضافة القضية'}
              </button>
              <Link
                to="/cases"
                className="btn-secondary w-full mt-3 text-center block"
              >
                إلغاء
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CaseForm;
