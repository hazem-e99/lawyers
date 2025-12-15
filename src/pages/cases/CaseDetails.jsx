import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { casesService } from '../../services';
import {
  FaArrowRight,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaGavel,
  FaMoneyBillWave,
  FaPlus,
} from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

/**
 * صفحة تفاصيل القضية
 * Case Details Page
 */
const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const response = await casesService.getById(id);
      setCaseData(response.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب بيانات القضية');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      try {
        await casesService.delete(id);
        toast.success('تم حذف القضية بنجاح');
        navigate('/cases');
      } catch (error) {
        toast.error('حدث خطأ في حذف القضية');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'info', text: 'مفتوحة' },
      in_progress: { class: 'warning', text: 'جارية' },
      pending: { class: 'warning', text: 'معلقة' },
      closed: { class: 'success', text: 'مغلقة' },
      won: { class: 'success', text: 'مربوحة' },
      lost: { class: 'danger', text: 'خاسرة' },
    };
    return badges[status] || { class: 'info', text: status };
  };

  const getCaseType = (type) => {
    const types = {
      civil: 'مدني',
      criminal: 'جنائي',
      family: 'أحوال شخصية',
      commercial: 'تجاري',
      labor: 'عمالي',
      administrative: 'إداري',
      real_estate: 'عقاري',
      other: 'أخرى',
    };
    return types[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-600">القضية غير موجودة</h2>
        <Link to="/cases" className="btn-primary mt-4 inline-flex">
          العودة للقضايا
        </Link>
      </div>
    );
  }

  const status = getStatusBadge(caseData.status);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/cases"
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <FaArrowRight />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-800">{caseData.title}</h1>
              <span className={`status-badge ${status.class}`}>{status.text}</span>
            </div>
            <p className="text-gray-500">{caseData.caseNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/cases/${id}/edit`} className="btn-secondary">
            <FaEdit />
            تعديل
          </Link>
          <button onClick={handleDelete} className="btn-secondary text-red-500 hover:bg-red-50">
            <FaTrash />
            حذف
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الأساسية */}
        <div className="lg:col-span-2 space-y-6">
          {/* التفاصيل */}
          <div className="card">
            <h2 className="text-lg font-bold text-dark-800 mb-4">تفاصيل القضية</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">نوع القضية</p>
                <p className="font-medium">{getCaseType(caseData.caseType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">الأولوية</p>
                <p className="font-medium capitalize">{caseData.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">تاريخ الإيداع</p>
                <p className="font-medium">
                  {caseData.filingDate
                    ? format(new Date(caseData.filingDate), 'dd MMMM yyyy', { locale: ar })
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">المحامي المسؤول</p>
                <p className="font-medium">{caseData.assignedLawyer?.name || '-'}</p>
              </div>
            </div>
            {caseData.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">الوصف</p>
                <p className="text-gray-700">{caseData.description}</p>
              </div>
            )}
          </div>

          {/* معلومات المحكمة */}
          {caseData.court?.name && (
            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">
                <FaGavel className="inline ml-2" />
                معلومات المحكمة
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">اسم المحكمة</p>
                  <p className="font-medium">{caseData.court.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">الدائرة</p>
                  <p className="font-medium">{caseData.court.circuit || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">الموقع</p>
                  <p className="font-medium">{caseData.court.location || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* الجلسات */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-800">
                <FaCalendarAlt className="inline ml-2" />
                الجلسات
              </h2>
              <Link
                to={`/sessions/new?case=${id}`}
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                <FaPlus className="inline ml-1" />
                إضافة جلسة
              </Link>
            </div>
            {caseData.sessions?.length > 0 ? (
              <div className="space-y-3">
                {caseData.sessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: ar })}
                      </p>
                      <p className="text-sm text-gray-500">{session.sessionTime}</p>
                    </div>
                    <span
                      className={`status-badge ${
                        session.status === 'completed' ? 'success' : 'info'
                      }`}
                    >
                      {session.status === 'scheduled' ? 'مجدولة' : 'مكتملة'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد جلسات</p>
            )}
          </div>
        </div>

        {/* الجانب */}
        <div className="space-y-6">
          {/* العميل */}
          <div className="card">
            <h2 className="text-lg font-bold text-dark-800 mb-4">
              <FaUser className="inline ml-2" />
              العميل
            </h2>
            {caseData.client ? (
              <div>
                <Link
                  to={`/clients/${caseData.client._id}`}
                  className="text-primary-500 hover:underline font-medium text-lg"
                >
                  {caseData.client.name}
                </Link>
                <p className="text-gray-500 mt-2">{caseData.client.phone}</p>
                {caseData.client.email && (
                  <p className="text-gray-500">{caseData.client.email}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">لا يوجد عميل</p>
            )}
          </div>

          {/* الأتعاب */}
          <div className="card">
            <h2 className="text-lg font-bold text-dark-800 mb-4">
              <FaMoneyBillWave className="inline ml-2" />
              الأتعاب
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">المتفق عليه</span>
                <span className="font-bold">{formatCurrency(caseData.fees?.agreed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">المدفوع</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(caseData.fees?.paid)}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="text-gray-500">المتبقي</span>
                <span className="font-bold text-amber-600">
                  {formatCurrency((caseData.fees?.agreed || 0) - (caseData.fees?.paid || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* الطرف الآخر */}
          {caseData.opposingParty?.name && (
            <div className="card">
              <h2 className="text-lg font-bold text-dark-800 mb-4">الطرف الآخر</h2>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">الاسم: </span>
                  {caseData.opposingParty.name}
                </p>
                {caseData.opposingParty.lawyer && (
                  <p>
                    <span className="text-gray-500">المحامي: </span>
                    {caseData.opposingParty.lawyer}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
