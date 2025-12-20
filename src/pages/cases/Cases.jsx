import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { casesService } from '../../services';
import { FaPlus, FaSearch, FaFilter, FaGavel, FaEye, FaEdit, FaTrash, FaFileExcel } from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { exportCasesToExcel } from '../../utils/excelExport';

/**
 * صفحة القضايا
 * Cases List Page
 */
const Cases = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    caseType: searchParams.get('caseType') || '',
    priority: searchParams.get('priority') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [searchParams]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 10,
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        caseType: searchParams.get('caseType') || '',
        priority: searchParams.get('priority') || '',
      };
      const response = await casesService.getAll(params);
      setCases(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('حدث خطأ في جلب القضايا');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', filters.search);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilter = () => {
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set('search', filters.search);
    if (filters.status) newParams.set('status', filters.status);
    if (filters.caseType) newParams.set('caseType', filters.caseType);
    if (filters.priority) newParams.set('priority', filters.priority);
    newParams.set('page', '1');
    setSearchParams(newParams);
    setShowFilters(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      try {
        await casesService.delete(id);
        toast.success('تم حذف القضية بنجاح');
        fetchCases();
      } catch (error) {
        toast.error('حدث خطأ في حذف القضية');
      }
    }
  };

  const handleExportToExcel = () => {
    if (cases.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    try {
      exportCasesToExcel(cases);
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في تصدير البيانات');
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">القضايا</h1>
          <p className="text-gray-500 mt-1">إدارة جميع القضايا القانونية</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportToExcel}
            className="btn-secondary"
            disabled={cases.length === 0}
          >
            <FaFileExcel />
            تصدير Excel
          </button>
          <Link to="/cases/new" className="btn-primary">
            <FaPlus />
            إضافة قضية
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="input-field pr-12"
                placeholder="ابحث عن قضية..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </form>
          <button
            className="btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            تصفية
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="input-label">الحالة</label>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">الكل</option>
                <option value="open">مفتوحة</option>
                <option value="in_progress">جارية</option>
                <option value="pending">معلقة</option>
                <option value="closed">مغلقة</option>
                <option value="won">مربوحة</option>
                <option value="lost">خاسرة</option>
              </select>
            </div>
            <div>
              <label className="input-label">النوع</label>
              <select
                className="input-field"
                value={filters.caseType}
                onChange={(e) => setFilters({ ...filters, caseType: e.target.value })}
              >
                <option value="">الكل</option>
                <option value="civil">مدني</option>
                <option value="criminal">جنائي</option>
                <option value="family">أحوال شخصية</option>
                <option value="commercial">تجاري</option>
                <option value="labor">عمالي</option>
                <option value="administrative">إداري</option>
                <option value="real_estate">عقاري</option>
              </select>
            </div>
            <div>
              <label className="input-label">الأولوية</label>
              <select
                className="input-field"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="">الكل</option>
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button className="btn-primary" onClick={handleFilter}>
                تطبيق الفلتر
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cases Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : cases.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم القضية</th>
                  <th>العنوان</th>
                  <th>العميل</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                  <th>المحامي</th>
                  <th>الجلسة القادمة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => {
                  const status = getStatusBadge(caseItem.status);
                  return (
                    <tr key={caseItem._id}>
                      <td className="font-medium">{caseItem.caseNumber}</td>
                      <td>
                        <Link
                          to={`/cases/${caseItem._id}`}
                          className="text-[var(--color-primary) hover:underline font-medium"
                        >
                          {caseItem.title}
                        </Link>
                      </td>
                      <td>{caseItem.client?.name}</td>
                      <td>{getCaseType(caseItem.caseType)}</td>
                      <td>
                        <span className={`status-badge ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>{caseItem.assignedLawyer?.name}</td>
                      <td>
                        {caseItem.nextSessionDate
                          ? format(new Date(caseItem.nextSessionDate), 'dd/MM/yyyy', { locale: ar })
                          : '-'}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/cases/${caseItem._id}`}
                            className="p-2 text-gray-500 hover:text-[var(--color-primary) hover:bg-gray-100 rounded-lg transition-colors"
                            title="عرض"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/cases/${caseItem._id}/edit`}
                            className="p-2 text-gray-500 hover:text-amber-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(caseItem._id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
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
          <FaGavel className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد قضايا</h3>
          <p className="text-gray-500 mb-4">ابدأ بإضافة قضية جديدة</p>
          <Link to="/cases/new" className="btn-primary inline-flex">
            <FaPlus />
            إضافة قضية
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

export default Cases;
