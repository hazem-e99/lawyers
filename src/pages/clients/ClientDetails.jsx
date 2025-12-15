import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientsService } from '../../services';
import { FaArrowRight, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaGavel } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * صفحة تفاصيل العميل
 * Client Details Page
 */
const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await clientsService.getById(id);
      setClient(response.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب بيانات العميل');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await clientsService.delete(id);
        toast.success('تم حذف العميل بنجاح');
        navigate('/clients');
      } catch (error) {
        toast.error('حدث خطأ في حذف العميل');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-600">العميل غير موجود</h2>
        <Link to="/clients" className="btn-primary mt-4 inline-flex">العودة للعملاء</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/clients"
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <FaArrowRight />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-800">{client.name}</h1>
            <p className="text-gray-500">
              {client.clientType === 'individual' ? 'عميل فرد' : 
               client.clientType === 'company' ? 'شركة' : 'جهة حكومية'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/clients/${id}/edit`} className="btn-secondary">
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
        {/* معلومات التواصل */}
        <div className="card">
          <h2 className="text-lg font-bold text-dark-800 mb-4">معلومات التواصل</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FaPhone className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">الهاتف</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
            {client.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaEnvelope className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
            )}
            {client.address?.city && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">العنوان</p>
                  <p className="font-medium">
                    {[client.address.street, client.address.city, client.address.state]
                      .filter(Boolean)
                      .join('، ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* القضايا */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark-800">
              <FaGavel className="inline ml-2" />
              القضايا
            </h2>
            <Link to={`/cases/new?client=${id}`} className="text-primary-500 hover:underline text-sm">
              + إضافة قضية
            </Link>
          </div>
          {client.cases?.length > 0 ? (
            <div className="space-y-3">
              {client.cases.map((caseItem) => (
                <Link
                  key={caseItem._id}
                  to={`/cases/${caseItem._id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-dark-800">{caseItem.title}</h4>
                      <p className="text-sm text-gray-500">{caseItem.caseNumber}</p>
                    </div>
                    <span className={`status-badge ${caseItem.status === 'open' ? 'info' : 'success'}`}>
                      {caseItem.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">لا توجد قضايا لهذا العميل</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
