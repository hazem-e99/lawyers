import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesService, libraryService } from '../../services';
import { 
  FaFileAlt, 
  FaFileContract, 
  FaGavel, 
  FaBell,
  FaSearch,
  FaPlus,
  FaFolderOpen,
  FaFileWord,
  FaChevronLeft,
  FaSeedling,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../../styles/templates.scss';

/**
 * صفحة القوالب القانونية
 * Legal Templates Page
 */
const Templates = () => {
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [creating, setCreating] = useState(false);

  // التصنيفات
  const categories = [
    { id: 'all', name: 'الكل', icon: FaFileAlt, color: '#6b7280' },
    { id: 'memo', name: 'مذكرات', icon: FaFileAlt, color: '#3b82f6' },
    { id: 'contract', name: 'عقود', icon: FaFileContract, color: '#10b981' },
    { id: 'legal-paper', name: 'صحف دعاوى', icon: FaGavel, color: '#8b5cf6' },
    { id: 'notice', name: 'إنذارات', icon: FaBell, color: '#f59e0b' },
  ];

  // جلب القوالب
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      
      const response = await templatesService.getAll(params);
      setTemplates(response.data || []);
      setGrouped(response.grouped || {});
    } catch (error) {
      console.error('Error fetching templates:', error);
      // إذا لم توجد قوالب، نظهر رسالة مفيدة
      if (error.response?.status === 404) {
        setTemplates([]);
        setGrouped({});
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // جلب المجلدات
  const fetchFolders = async () => {
    try {
      const response = await libraryService.getItems(null, { type: 'folder' });
      setFolders(response.data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchFolders();
  }, [fetchTemplates]);

  // تهيئة القوالب
  const handleSeedTemplates = async () => {
    try {
      const response = await templatesService.seedTemplates();
      toast.success(response.message);
      fetchTemplates();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('القوالب موجودة بالفعل');
      } else {
        toast.error('حدث خطأ في تهيئة القوالب');
      }
    }
  };

  // فتح موديل اختيار المجلد
  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setDocumentName(`${template.name} - ${new Date().toLocaleDateString('ar-EG')}`);
    setSelectedFolder(null);
    setShowFolderModal(true);
  };

  // إنشاء مستند من القالب
  const handleCreateDocument = async () => {
    if (!selectedTemplate) return;

    try {
      setCreating(true);
      const response = await templatesService.useTemplate(selectedTemplate._id, {
        parentId: selectedFolder?._id || null,
        name: documentName,
      });

      toast.success('تم إنشاء المستند بنجاح');
      setShowFolderModal(false);
      
      // فتح المستند في المحرر
      navigate(`/library/editor/${response.data._id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('حدث خطأ في إنشاء المستند');
    } finally {
      setCreating(false);
    }
  };

  // فلترة القوالب
  const getFilteredTemplates = () => {
    if (activeCategory === 'all') {
      return templates;
    }
    return templates.filter(t => t.category === activeCategory);
  };

  // أيقونة التصنيف
  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : FaFileAlt;
  };

  // لون التصنيف
  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : '#6b7280';
  };

  // اسم التصنيف بالعربي
  const getCategoryName = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  if (loading) {
    return (
      <div className="templates-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل القوالب...</p>
      </div>
    );
  }

  return (
    <div className="templates-page">
      {/* Header */}
      <div className="templates-header">
        <div className="header-info">
          <h1>القوالب القانونية</h1>
          <p>قوالب جاهزة للمذكرات والعقود والصحف القانونية</p>
        </div>
        {templates.length === 0 && (
          <button className="btn-seed" onClick={handleSeedTemplates}>
            <FaSeedling />
            <span>تهيئة القوالب</span>
          </button>
        )}
      </div>

      {/* Search & Categories */}
      <div className="templates-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="ابحث عن قالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{ '--cat-color': cat.color }}
            >
              <cat.icon />
              <span>{cat.name}</span>
              {cat.id !== 'all' && grouped[cat.id] && (
                <span className="count">{grouped[cat.id]?.length || 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="empty-state">
          <FaFileAlt className="empty-icon" />
          <h3>لا توجد قوالب</h3>
          <p>اضغط على "تهيئة القوالب" لإضافة القوالب الافتراضية</p>
          <button className="btn-primary" onClick={handleSeedTemplates}>
            <FaSeedling />
            <span>تهيئة القوالب</span>
          </button>
        </div>
      ) : (
        <div className="templates-grid">
          {getFilteredTemplates().map(template => {
            const Icon = getCategoryIcon(template.category);
            const color = getCategoryColor(template.category);
            
            return (
              <div key={template._id} className="template-card">
                <div className="template-icon" style={{ background: `${color}15`, color }}>
                  <Icon />
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <span className="template-category" style={{ background: `${color}15`, color }}>
                    {getCategoryName(template.category)}
                  </span>
                </div>
                <button 
                  className="btn-use-template"
                  onClick={() => handleUseTemplate(template)}
                >
                  <FaPlus />
                  <span>استخدام القالب</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Folder Selection Modal */}
      {showFolderModal && (
        <div className="modal-overlay" onClick={() => setShowFolderModal(false)}>
          <div className="modal-content folder-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إنشاء مستند من القالب</h2>
              <button className="modal-close" onClick={() => setShowFolderModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="selected-template">
                <FaFileWord className="template-icon" />
                <div>
                  <strong>{selectedTemplate?.name}</strong>
                  <span>{getCategoryName(selectedTemplate?.category)}</span>
                </div>
              </div>

              <div className="form-group">
                <label>اسم المستند</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="أدخل اسم المستند"
                />
              </div>

              <div className="form-group">
                <label>اختر المجلد (اختياري)</label>
                <div className="folders-list">
                  <div 
                    className={`folder-item ${selectedFolder === null ? 'selected' : ''}`}
                    onClick={() => setSelectedFolder(null)}
                  >
                    <FaFolderOpen />
                    <span>المكتبة الرئيسية</span>
                  </div>
                  {folders.map(folder => (
                    <div 
                      key={folder._id}
                      className={`folder-item ${selectedFolder?._id === folder._id ? 'selected' : ''}`}
                      onClick={() => setSelectedFolder(folder)}
                    >
                      <FaFolderOpen />
                      <span>{folder.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowFolderModal(false)}
              >
                إلغاء
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateDocument}
                disabled={creating || !documentName.trim()}
              >
                {creating ? 'جاري الإنشاء...' : 'إنشاء المستند'}
                <FaChevronLeft />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
