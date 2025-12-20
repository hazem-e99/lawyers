import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { clientsService } from '../../services';
import { FaPlus, FaSearch, FaUsers, FaEye, FaEdit, FaTrash, FaPhone, FaEnvelope, FaFileExcel } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { exportClientsToExcel } from '../../utils/excelExport';

/**
 * صفحة العملاء
 * Clients List Page
 */
const Clients = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchClients();
  }, [searchParams]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 10,
        search: searchParams.get('search') || '',
      };
      const response = await clientsService.getAll(params);
      setClients(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('حدث خطأ في جلب العملاء');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', search);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await clientsService.delete(id);
        toast.success('تم حذف العميل بنجاح');
        fetchClients();
      } catch (error) {
        toast.error('حدث خطأ في حذف العميل');
      }
    }
  };

  const getClientType = (type) => {
    const types = { individual: 'فرد', company: 'شركة', government: 'جهة حكومية' };
    return types[type] || type;
  };

  const handleExportToExcel = () => {
    if (clients.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    try {
      exportClientsToExcel(clients);
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في تصدير البيانات');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">العملاء</h1>
          <p className="text-gray-500 mt-1">إدارة بيانات العملاء والموكلين</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportToExcel}
            className="btn-secondary"
            disabled={clients.length === 0}
          >
            <FaFileExcel />
            تصدير Excel
          </button>
          <Link to="/clients/new" className="btn-primary">
            <FaPlus />
            إضافة عميل
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              className="input-field pr-12"
              placeholder="ابحث عن عميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </form>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FaUsers className="text-primary-500 text-xl" />
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {getClientType(client.clientType)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-dark-800 mb-2">{client.name}</h3>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <p className="flex items-center gap-2">
                  <FaPhone className="flex-shrink-0" />
                  {client.phone}
                </p>
                {client.email && (
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="flex-shrink-0" />
                    {client.email}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Link
                  to={`/clients/${client._id}`}
                  className="flex-1 btn-secondary text-center text-sm py-2"
                >
                  <FaEye className="inline ml-1" />
                  عرض
                </Link>
                <Link
                  to={`/clients/${client._id}/edit`}
                  className="p-2 text-gray-500 hover:text-amber-500 hover:bg-gray-100 rounded-lg"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => handleDelete(client._id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">لا يوجد عملاء</h3>
          <p className="text-gray-500 mb-4">ابدأ بإضافة عميل جديد</p>
          <Link to="/clients/new" className="btn-primary inline-flex">
            <FaPlus />
            إضافة عميل
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('page', page.toString());
                  setSearchParams(newParams);
                }}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  pagination.page === page
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
