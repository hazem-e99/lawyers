import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { libraryService } from '../../services';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  FaSave, 
  FaFileDownload, 
  FaArrowRight,
  FaFileWord
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../../styles/editor.scss';

/**
 * صفحة محرر المستندات
 * Editor Page - محرر نصوص شبيه بـ Word
 */
const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // إعدادات محرر Quill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // جلب المستند
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const response = await libraryService.getEditorFile(id);
      setDocument(response.data);
      setContent(response.data.content || '');
      setDocumentName(response.data.name || '');
      setLastSaved(new Date(response.data.updatedAt));
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('حدث خطأ في جلب المستند');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  // تتبع التغييرات
  const handleContentChange = (value) => {
    setContent(value);
    setHasChanges(true);
  };

  // حفظ المستند
  const handleSave = async () => {
    try {
      setSaving(true);
      await libraryService.updateEditorFile(id, { 
        content,
        name: documentName 
      });
      setHasChanges(false);
      setLastSaved(new Date());
      toast.success('تم حفظ المستند بنجاح');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('حدث خطأ في حفظ المستند');
    } finally {
      setSaving(false);
    }
  };

  // تصدير كملف Word
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await libraryService.exportEditorFile(id);
      
      // إنشاء رابط تحميل
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${documentName || 'document'}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير المستند بنجاح');
    } catch (error) {
      console.error('Error exporting document:', error);
      toast.error('حدث خطأ في تصدير المستند');
    } finally {
      setExporting(false);
    }
  };

  // العودة للمكتبة
  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('يوجد تغييرات غير محفوظة. هل تريد المتابعة؟')) {
        navigate('/library');
      }
    } else {
      navigate('/library');
    }
  };

  // حفظ تلقائي
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasChanges && !saving) {
        handleSave();
      }
    }, 60000); // كل دقيقة

    return () => clearInterval(autoSaveInterval);
  }, [hasChanges, saving, content, documentName]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, documentName]);

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل المستند...</p>
      </div>
    );
  }

  return (
    <div className="editor-page">
      {/* Header */}
      <div className="editor-header">
        <div className="header-right">
          <button className="btn-back" onClick={handleBack}>
            <FaArrowRight />
            <span>العودة للمكتبة</span>
          </button>
          <div className="document-title">
            <input
              type="text"
              value={documentName}
              onChange={(e) => {
                setDocumentName(e.target.value);
                setHasChanges(true);
              }}
              placeholder="اسم المستند"
              className="title-input"
            />
            {hasChanges && <span className="unsaved-badge">غير محفوظ</span>}
          </div>
        </div>
        <div className="header-left">
          {lastSaved && (
            <span className="last-saved">
              آخر حفظ: {lastSaved.toLocaleTimeString('ar-EG')}
            </span>
          )}
          <button 
            className="btn-save"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            <FaSave />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
          </button>
          <button 
            className="btn-export"
            onClick={handleExport}
            disabled={exporting}
          >
            <FaFileWord />
            <span>{exporting ? 'جاري التصدير...' : 'تصدير Word'}</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="editor-container">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder="ابدأ الكتابة هنا..."
          className="quill-editor"
        />
      </div>
    </div>
  );
};

export default Editor;
