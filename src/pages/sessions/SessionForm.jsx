import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { sessionsService, casesService } from '../../services';
import { FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * نموذج إضافة/تعديل الجلسة
 * Session Form Page
 */
const SessionForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    case: searchParams.get('case') || '',
    sessionDate: '',
    sessionTime: '',
    sessionType: 'hearing',
    court: { name: '', circuit: '', room: '' },
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const casesRes = await casesService.getAll({ limit: 100 });
      setCases(casesRes.data);

      if (isEdit) {
        const sessionRes = await sessionsService.getById(id);
        const session = sessionRes.data;
        setFormData({
          case: session.case?._id || '',
          sessionDate: session.sessionDate?.split('T')[0] || '',
          sessionTime: session.sessionTime || '',
          sessionType: session.sessionType || 'hearing',
          court: session.court || { name: '', circuit: '', room: '' },
          status: session.status || 'scheduled',
          notes: session.notes || '',
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
        await sessionsService.update(id, formData);
        toast.success('تم تحديث الجلسة بنجاح');
      } else {
        await sessionsService.create(formData);
        toast.success('تم إضافة الجلسة بنجاح');
      }
      navigate('/sessions');
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
          to="/sessions"
          className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <FaArrowRight />
        </Link>
        <h1 className="text-2xl font-bold text-dark-800">
          {isEdit ? 'تعديل الجلسة' : 'إضافة جلسة جديدة'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-bold text-dark-800 mb-4">معلومات الجلسة</h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">القضية *</label>
                <select
                  name="case"
                  value={formData.case}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">اختر القضية</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">تاريخ الجلسة *</label>
                  <input
                    type="date"
                    name="sessionDate"
                    value={formData.sessionDate}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">الوقت</label>
                  <input
                    type="time"
                    name="sessionTime"
                    value={formData.sessionTime}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">نوع الجلسة</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="first_session">أول جلسة</option>
                  <option value="hearing">جلسة استماع</option>
                  <option value="pleading">مرافعة</option>
                  <option value="ruling">نطق بالحكم</option>
                  <option value="postponement">تأجيل</option>
                  <option value="expert">خبير</option>
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
                  <option value="scheduled">مجدولة</option>
                  <option value="completed">مكتملة</option>
                  <option value="postponed">مؤجلة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">معلومات المحكمة</h2>
              <div className="space-y-4">
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
                  <label className="input-label">القاعة</label>
                  <input
                    type="text"
                    name="court.room"
                    value={formData.court.room}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">ملاحظات</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows={4}
                placeholder="أي ملاحظات..."
              />
            </div>

            <div className="card">
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'جارٍ الحفظ...' : isEdit ? 'تحديث الجلسة' : 'إضافة الجلسة'}
              </button>
              <Link to="/sessions" className="btn-secondary w-full mt-3 text-center block">
                إلغاء
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SessionForm;
