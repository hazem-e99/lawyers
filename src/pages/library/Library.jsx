import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { libraryService } from '../../services';
import { 
  FaFolder, 
  FaFolderOpen, 
  FaFile, 
  FaFileWord, 
  FaFilePdf, 
  FaFileImage, 
  FaFileAlt,
  FaPlus, 
  FaUpload, 
  FaTrash, 
  FaEdit,
  FaHome,
  FaChevronLeft,
  FaDownload,
  FaTimes,
  FaSearch,
  FaEye,
  FaExpand,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import '../../styles/library.scss';

/**
 * صفحة المكتبة
 * Library Page - عرض وإدارة المجلدات والملفات
 */
const Library = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // الحالات
  const [items, setItems] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // حالات الموديلات
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  
  // بيانات النماذج
  const [folderName, setFolderName] = useState('');
  const [editorFileName, setEditorFileName] = useState('');
  const [uploadData, setUploadData] = useState({ file: null, name: '' });
  const [renameData, setRenameData] = useState({ id: null, name: '' });
  const [submitting, setSubmitting] = useState(false);

  // الحصول على المجلد الحالي من URL
  const currentParentId = searchParams.get('folder') || null;

  // جلب العناصر
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await libraryService.getItems(currentParentId, { search: searchQuery });
      setItems(response.data || []);
      setBreadcrumbs(response.breadcrumbs || []);
    } catch (error) {
      console.error('Error fetching library items:', error);
      toast.error('حدث خطأ في جلب محتويات المكتبة');
    } finally {
      setLoading(false);
    }
  }, [currentParentId, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // التنقل إلى مجلد
  const navigateToFolder = (folderId) => {
    if (folderId) {
      setSearchParams({ folder: folderId });
    } else {
      setSearchParams({});
    }
  };

  // فتح عنصر
  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      navigateToFolder(item._id);
    } else if (item.type === 'editor-file') {
      navigate(`/library/editor/${item._id}`);
    } else if (item.type === 'file') {
      // فتح الملف في تاب جديد
      window.open(`${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.fileUrl}`, '_blank');
    }
  };

  // إنشاء مجلد
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toast.error('يرجى إدخال اسم المجلد');
      return;
    }

    try {
      setSubmitting(true);
      await libraryService.createFolder({
        name: folderName,
        parentId: currentParentId,
      });
      toast.success('تم إنشاء المجلد بنجاح');
      setShowFolderModal(false);
      setFolderName('');
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في إنشاء المجلد');
    } finally {
      setSubmitting(false);
    }
  };

  // رفع ملف
  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('يرجى اختيار ملف');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('name', uploadData.name || uploadData.file.name);
      if (currentParentId) {
        formData.append('parentId', currentParentId);
      }

      await libraryService.uploadFile(formData);
      toast.success('تم رفع الملف بنجاح');
      setShowUploadModal(false);
      setUploadData({ file: null, name: '' });
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في رفع الملف');
    } finally {
      setSubmitting(false);
    }
  };

  // إنشاء مستند نصي
  const handleCreateEditorFile = async (e) => {
    e.preventDefault();
    if (!editorFileName.trim()) {
      toast.error('يرجى إدخال اسم المستند');
      return;
    }

    try {
      setSubmitting(true);
      const response = await libraryService.createEditorFile({
        name: editorFileName,
        parentId: currentParentId,
      });
      toast.success('تم إنشاء المستند بنجاح');
      setShowEditorModal(false);
      setEditorFileName('');
      // الانتقال إلى صفحة المحرر
      navigate(`/library/editor/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في إنشاء المستند');
    } finally {
      setSubmitting(false);
    }
  };

  // إعادة تسمية عنصر
  const handleRename = async (e) => {
    e.preventDefault();
    if (!renameData.name.trim()) {
      toast.error('يرجى إدخال الاسم الجديد');
      return;
    }

    try {
      setSubmitting(true);
      await libraryService.updateItem(renameData.id, { name: renameData.name });
      toast.success('تم إعادة التسمية بنجاح');
      setShowRenameModal(false);
      setRenameData({ id: null, name: '' });
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في إعادة التسمية');
    } finally {
      setSubmitting(false);
    }
  };

  // حذف عنصر
  const handleDelete = async (item) => {
    const typeAr = item.type === 'folder' ? 'المجلد' : item.type === 'editor-file' ? 'المستند' : 'الملف';
    if (!window.confirm(`هل أنت متأكد من حذف ${typeAr} "${item.name}"؟`)) {
      return;
    }

    try {
      await libraryService.deleteItem(item._id);
      toast.success(`تم حذف ${typeAr} بنجاح`);
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ في الحذف');
    }
  };

  // تحميل ملف
  const handleDownload = (item) => {
    if (item.type === 'file' && item.fileUrl) {
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.fileUrl}`;
      link.download = item.originalName || item.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // عرض ملف
  const handleView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  // الحصول على رابط الملف الكامل
  const getFileUrl = (item) => {
    if (!item?.fileUrl) return '';
    return `${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.fileUrl}`;
  };

  // التحقق من إمكانية عرض الملف مباشرة
  const canPreviewFile = (item) => {
    if (!item?.fileType) return false;
    const fileType = item.fileType.toLowerCase();
    // الملفات التي يمكن عرضها مباشرة في المتصفح
    return (
      fileType.includes('pdf') ||
      fileType.includes('image') ||
      fileType.includes('text')
    );
  };

  // التحقق من نوع الملف
  const isImageFile = (item) => item?.fileType?.toLowerCase().includes('image');
  const isPdfFile = (item) => item?.fileType?.toLowerCase().includes('pdf');
  const isWordFile = (item) => {
    const type = item?.fileType?.toLowerCase() || '';
    return type.includes('word') || type.includes('document') || type.includes('msword');
  };

  // أيقونة حسب نوع الملف
  const getFileIcon = (item) => {
    if (item.type === 'folder') {
      return <FaFolderOpen className="text-amber-500" />;
    }
    if (item.type === 'editor-file') {
      return <FaFileWord className="text-blue-600" />;
    }
    
    const fileType = item.fileType || '';
    if (fileType.includes('pdf')) {
      return <FaFilePdf className="text-red-500" />;
    }
    if (fileType.includes('image')) {
      return <FaFileImage className="text-green-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FaFileWord className="text-blue-500" />;
    }
    return <FaFileAlt className="text-gray-500" />;
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="library-page">
      {/* Header */}
      <div className="library-header">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">المكتبة</h1>
          <p className="text-gray-500 mt-1">إدارة الملفات والمستندات</p>
        </div>
        <div className="library-actions">
          <button 
            className="btn-action btn-folder"
            onClick={() => setShowFolderModal(true)}
          >
            <FaFolder />
            <span>مجلد جديد</span>
          </button>
          <button 
            className="btn-action btn-upload"
            onClick={() => setShowUploadModal(true)}
          >
            <FaUpload />
            <span>رفع ملف</span>
          </button>
          <button 
            className="btn-action btn-editor"
            onClick={() => setShowEditorModal(true)}
          >
            <FaFileAlt />
            <span>مستند نصي جديد</span>
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <button 
          className={`breadcrumb-item ${!currentParentId ? 'active' : ''}`}
          onClick={() => navigateToFolder(null)}
        >
          <FaHome />
          <span>الرئيسية</span>
        </button>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb._id} className="breadcrumb-wrapper">
            <FaChevronLeft className="breadcrumb-separator" />
            <button
              className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
              onClick={() => navigateToFolder(crumb._id)}
            >
              <span>{crumb.name}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="library-search">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="ابحث في المكتبة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
          />
          {searchQuery && (
            <button 
              className="clear-search"
              onClick={() => {
                setSearchQuery('');
                fetchItems();
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="library-grid">
          {items.map((item) => (
            <div 
              key={item._id} 
              className={`library-item ${item.type}`}
            >
              <div 
                className="item-main"
                onClick={() => handleItemClick(item)}
              >
                <div className="item-icon">
                  {getFileIcon(item)}
                </div>
                <div className="item-info">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-meta">
                    {item.type === 'file' && item.fileSize && (
                      <span className="file-size">{formatFileSize(item.fileSize)}</span>
                    )}
                    {item.type === 'editor-file' && (
                      <span className="file-type">مستند نصي</span>
                    )}
                    {item.type === 'folder' && (
                      <span className="file-type">مجلد</span>
                    )}
                    <span className="item-date">
                      {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: ar })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="item-actions">
                {/* زر العرض للملفات المرفوعة */}
                {item.type === 'file' && (
                  <button 
                    className="action-btn view"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(item);
                    }}
                    title="عرض"
                  >
                    <FaEye />
                  </button>
                )}
                {/* زر العرض للمستندات النصية - يفتح المحرر */}
                {item.type === 'editor-file' && (
                  <button 
                    className="action-btn view"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/library/editor/${item._id}`);
                    }}
                    title="فتح في المحرر"
                  >
                    <FaEye />
                  </button>
                )}
                {item.type === 'file' && (
                  <button 
                    className="action-btn download"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                    title="تحميل"
                  >
                    <FaDownload />
                  </button>
                )}
                {/* زر تصدير Word للمستندات النصية */}
                {item.type === 'editor-file' && (
                  <button 
                    className="action-btn download"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const response = await libraryService.exportEditorFile(item._id);
                        const blob = new Blob([response.data], { 
                          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
                        });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${item.name}.docx`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        toast.success('تم تصدير المستند بنجاح');
                      } catch (error) {
                        toast.error('حدث خطأ في تصدير المستند');
                      }
                    }}
                    title="تصدير كـ Word"
                  >
                    <FaFileWord />
                  </button>
                )}
                <button 
                  className="action-btn edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameData({ id: item._id, name: item.name });
                    setShowRenameModal(true);
                  }}
                  title="إعادة تسمية"
                >
                  <FaEdit />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  title="حذف"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaFolder className="empty-icon" />
          <h3>المجلد فارغ</h3>
          <p>
            {searchQuery 
              ? 'لا توجد نتائج مطابقة للبحث'
              : 'ابدأ بإنشاء مجلد أو رفع ملف أو إنشاء مستند نصي'}
          </p>
        </div>
      )}

      {/* Modal: إنشاء مجلد */}
      {showFolderModal && (
        <div className="modal-overlay" onClick={() => setShowFolderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إنشاء مجلد جديد</h2>
              <button className="modal-close" onClick={() => setShowFolderModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateFolder}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم المجلد</label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="أدخل اسم المجلد"
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'جاري الإنشاء...' : 'إنشاء مجلد'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowFolderModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: رفع ملف */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>رفع ملف</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUploadFile}>
              <div className="modal-body">
                <div className="form-group">
                  <label>الملف</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                  />
                </div>
                <div className="form-group">
                  <label>اسم الملف (اختياري)</label>
                  <input
                    type="text"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                    placeholder="سيستخدم اسم الملف الأصلي"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'جاري الرفع...' : 'رفع الملف'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: إنشاء مستند نصي */}
      {showEditorModal && (
        <div className="modal-overlay" onClick={() => setShowEditorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إنشاء مستند نصي جديد</h2>
              <button className="modal-close" onClick={() => setShowEditorModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateEditorFile}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم المستند</label>
                  <input
                    type="text"
                    value={editorFileName}
                    onChange={(e) => setEditorFileName(e.target.value)}
                    placeholder="أدخل اسم المستند"
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'جاري الإنشاء...' : 'إنشاء وفتح المحرر'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditorModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: إعادة تسمية */}
      {showRenameModal && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إعادة تسمية</h2>
              <button className="modal-close" onClick={() => setShowRenameModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleRename}>
              <div className="modal-body">
                <div className="form-group">
                  <label>الاسم الجديد</label>
                  <input
                    type="text"
                    value={renameData.name}
                    onChange={(e) => setRenameData({ ...renameData, name: e.target.value })}
                    placeholder="أدخل الاسم الجديد"
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowRenameModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: عرض الملف */}
      {showViewModal && viewItem && (
        <div className="modal-overlay view-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="view-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="view-modal-header">
              <div className="view-modal-title">
                <span className="view-icon">{getFileIcon(viewItem)}</span>
                <h2>{viewItem.name}</h2>
              </div>
              <div className="view-modal-actions">
                <button 
                  className="view-action-btn"
                  onClick={() => window.open(getFileUrl(viewItem), '_blank')}
                  title="فتح في نافذة جديدة"
                >
                  <FaExternalLinkAlt />
                </button>
                <button 
                  className="view-action-btn"
                  onClick={() => handleDownload(viewItem)}
                  title="تحميل"
                >
                  <FaDownload />
                </button>
                <button 
                  className="view-close-btn" 
                  onClick={() => setShowViewModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="view-modal-body">
              {isImageFile(viewItem) ? (
                <div className="image-viewer">
                  <img 
                    src={getFileUrl(viewItem)} 
                    alt={viewItem.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<p class="error-message">تعذر تحميل الصورة</p>';
                    }}
                  />
                </div>
              ) : isPdfFile(viewItem) ? (
                <div className="pdf-viewer">
                  <object
                    data={getFileUrl(viewItem)}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  >
                    {/* Fallback if browser doesn't support embedded PDF */}
                    <div className="pdf-fallback">
                      <FaFilePdf className="pdf-icon" />
                      <h3>ملف PDF</h3>
                      <p>تعذر عرض ملف PDF مباشرة في المتصفح.</p>
                      <div className="pdf-actions">
                        <button 
                          className="btn-primary"
                          onClick={() => window.open(getFileUrl(viewItem), '_blank')}
                        >
                          <FaExternalLinkAlt />
                          فتح في نافذة جديدة
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => handleDownload(viewItem)}
                        >
                          <FaDownload />
                          تحميل الملف
                        </button>
                      </div>
                    </div>
                  </object>
                </div>
              ) : isWordFile(viewItem) ? (
                <div className="word-viewer">
                  <div className="word-preview-notice">
                    <FaFileWord className="word-icon" />
                    <h3>ملف Word</h3>
                    <p>لا يمكن عرض ملفات Word مباشرة في المتصفح.</p>
                    <p>يمكنك استخدام أحد الخيارات التالية:</p>
                    <div className="word-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleDownload(viewItem)}
                      >
                        <FaDownload />
                        تحميل الملف
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => window.open(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(getFileUrl(viewItem))}`, '_blank')}
                      >
                        <FaExternalLinkAlt />
                        فتح في Office Online
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="generic-viewer">
                  <div className="generic-preview-notice">
                    {getFileIcon(viewItem)}
                    <h3>{viewItem.name}</h3>
                    <p>نوع الملف: {viewItem.fileType || 'غير محدد'}</p>
                    <p>الحجم: {formatFileSize(viewItem.fileSize)}</p>
                    <button 
                      className="btn-primary"
                      onClick={() => handleDownload(viewItem)}
                    >
                      <FaDownload />
                      تحميل الملف
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
