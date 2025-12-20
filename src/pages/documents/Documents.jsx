import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { documentsService } from '../../services';
import { FaPlus, FaSearch, FaFile, FaDownload, FaTrash, FaUpload, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

/**
 * صفحة المستندات
 * Documents Page
 */
const Documents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [uploadData, setUploadData] = useState({
    file: null,
    name: '',
    documentType: 'other',
    description: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  // تحديث البحث عند تغيير URL
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchQuery(urlSearch);
    filterDocuments(urlSearch);
  }, [searchParams, documents]);

  const fetchDocuments = async () => {
    try {
      const response = await documentsService.getAll({ limit: 100 });
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      toast.error('حدث خطأ في جلب المستندات');
    } finally {
      setLoading(false);
    }
  };

  // فلترة المستندات
  const filterDocuments = (query) => {
    if (!query.trim()) {
      setFilteredDocuments(documents);
      return;
    }
    const filtered = documents.filter(
      (doc) =>
        doc.name?.toLowerCase().includes(query.toLowerCase()) ||
        doc.description?.toLowerCase().includes(query.toLowerCase()) ||
        doc.documentType?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  // البحث من الصفحة
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  // مسح البحث
  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('يرجى اختيار ملف');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('name', uploadData.name || uploadData.file.name);
    formData.append('documentType', uploadData.documentType);
    formData.append('description', uploadData.description);

    try {
      await documentsService.upload(formData);
      toast.success('تم رفع المستند بنجاح');
      setShowUploadModal(false);
      setUploadData({ file: null, name: '', documentType: 'other', description: '' });
      fetchDocuments();
    } catch (error) {
      toast.error('حدث خطأ في رفع المستند');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await documentsService.download(doc._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file.originalName || doc.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('حدث خطأ في تحميل المستند');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      try {
        await documentsService.delete(id);
        toast.success('تم حذف المستند بنجاح');
        fetchDocuments();
      } catch (error) {
        toast.error('حدث خطأ في حذف المستند');
      }
    }
  };

  const getDocumentType = (type) => {
    const types = {
      contract: 'عقد',
      power_of_attorney: 'توكيل',
      court_document: 'مستند محكمة',
      evidence: 'دليل',
      correspondence: 'مراسلات',
      judgment: 'حكم',
      appeal: 'استئناف',
      report: 'تقرير',
      invoice: 'فاتورة',
      other: 'أخرى',
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'غير معروف';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">المستندات</h1>
          <p className="text-gray-500 mt-1">إدارة الملفات والوثائق</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary">
          <FaUpload />
          رفع مستند
        </button>
      </div>

      {/* Search Box */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              className="input-field pr-12"
              placeholder="ابحث في المستندات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button type="submit" className="btn-primary">
            بحث
          </button>
          {searchParams.get('search') && (
            <button type="button" onClick={clearSearch} className="btn-secondary">
              <FaTimes />
              مسح
            </button>
          )}
        </form>
        {searchParams.get('search') && (
          <p className="text-sm text-gray-500 mt-3">
            نتائج البحث عن: <strong>"{searchParams.get('search')}"</strong>
            <span className="mr-2">({filteredDocuments.length} نتيجة)</span>
          </p>
        )}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FaFile className="text-blue-500 text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--color-text)] truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{getDocumentType(doc.documentType)}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500 space-y-1">
                <p>الحجم: {formatFileSize(doc.file?.size)}</p>
                <p>
                  تاريخ الرفع:{' '}
                  {format(new Date(doc.createdAt), 'dd MMM yyyy', { locale: ar })}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  <FaDownload className="inline ml-1" />
                  تحميل
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
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
          <FaFile className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            {searchParams.get('search') ? 'لا توجد نتائج' : 'لا توجد مستندات'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchParams.get('search')
              ? 'جرّب البحث بكلمات أخرى'
              : 'ابدأ برفع مستنداتك'}
          </p>
          {!searchParams.get('search') && (
            <button onClick={() => setShowUploadModal(true)} className="btn-primary inline-flex">
              <FaUpload />
              رفع مستند
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">رفع مستند جديد</h2>
              <form onSubmit={handleUpload}>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">الملف *</label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setUploadData({ ...uploadData, file: e.target.files[0] })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">اسم المستند</label>
                    <input
                      type="text"
                      value={uploadData.name}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, name: e.target.value })
                      }
                      className="input-field"
                      placeholder="اختياري - سيستخدم اسم الملف"
                    />
                  </div>
                  <div>
                    <label className="input-label">النوع</label>
                    <select
                      value={uploadData.documentType}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, documentType: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="contract">عقد</option>
                      <option value="power_of_attorney">توكيل</option>
                      <option value="court_document">مستند محكمة</option>
                      <option value="evidence">دليل</option>
                      <option value="correspondence">مراسلات</option>
                      <option value="judgment">حكم</option>
                      <option value="report">تقرير</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">الوصف</label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) =>
                        setUploadData({ ...uploadData, description: e.target.value })
                      }
                      className="input-field"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn-primary flex-1" disabled={uploading}>
                    {uploading ? 'جارٍ الرفع...' : 'رفع المستند'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn-secondary flex-1"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
