import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { libraryService } from '../../services';
import JoditEditor from 'jodit-react';
import { 
  FaSave, 
  FaArrowRight,
  FaFileWord,
  FaPrint,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../../styles/editor.scss';

/**
 * صفحة محرر المستندات - Jodit
 * Editor Page - Professional Word-like Editor (Free)
 */
const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // إعدادات Jodit Editor
  const config = useMemo(() => ({
    readonly: false,
    language: 'ar',
    direction: 'rtl',
    height: 'calc(100vh - 180px)',
    minHeight: 500,
    
    // شريط الأدوات
    toolbarButtonSize: 'middle',
    toolbarAdaptive: true,
    toolbarSticky: true,
    
    // الأزرار
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'ul', 'ol', 'indent', 'outdent', '|',
      'align', '|',
      'table', 'link', 'image', '|',
      'hr', 'symbol', '|',
      'undo', 'redo', '|',
      'find', 'selectall', '|',
      'copyformat', 'eraser', '|',
      'fullsize', 'print', 'preview'
    ],
    
    // أزرار الموبايل
    buttonsMD: [
      'bold', 'italic', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', '|',
      'align', '|',
      'table', 'link', 'image', '|',
      'undo', 'redo', '|',
      'dots'
    ],
    
    buttonsSM: [
      'bold', 'italic', '|',
      'ul', 'ol', '|',
      'align', '|',
      'image', '|',
      'dots'
    ],
    
    buttonsXS: [
      'bold', 'italic', '|',
      'ul', '|',
      'dots'
    ],
    
    // الخطوط
    controls: {
      font: {
        list: {
          'Amiri': 'Amiri',
          'Almarai': 'Almarai',
          'Cairo': 'Cairo',
          'Tajawal': 'Tajawal',
          'Arial': 'Arial',
          'Times New Roman': 'Times New Roman',
          'Courier New': 'Courier New',
          'Georgia': 'Georgia',
        }
      },
      fontsize: {
        list: [
          '8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'
        ]
      }
    },
    
    // إعدادات عامة
    spellcheck: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    
    // الصور
    imageDefaultWidth: 300,
    
    // الجداول
    tableAllowCellResize: true,
    
    // التنسيق
    defaultMode: 1,
    enter: 'p',
    
    // الستايل الداخلي
    style: {
      fontFamily: 'Amiri, Times New Roman, serif',
      fontSize: '14pt',
      direction: 'rtl',
      textAlign: 'right'
    },
    
    // أحداث
    events: {
      afterInit: (editor) => {
        // تطبيق RTL
        editor.editor.style.direction = 'rtl';
        editor.editor.style.textAlign = 'right';
      }
    },
    
    // إزالة العلامة التجارية
    hidePoweredByJodit: true,
    
    // الألوان
    colors: {
      greyscale: ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
      palette: ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
      full: [
        '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
        '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
        '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
        '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
        '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#733554',
        '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'
      ]
    },

    // placeholder
    placeholder: 'ابدأ الكتابة هنا...',
    
    // Size
    allowResizeY: false,
    saveModeInStorage: false,
  }), []);

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
      // حفظ أولاً
      if (hasChanges) {
        await handleSave();
      }
      
      const response = await libraryService.exportEditorFile(id);
      
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

  // طباعة المستند
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${documentName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Amiri', serif; 
              direction: rtl; 
              text-align: right;
              padding: 40px;
              line-height: 1.8;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

  // تحديث المحتوى
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasChanges(true);
  };

  // حفظ تلقائي
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasChanges && !saving) {
        handleSave();
      }
    }, 120000); // كل دقيقتين

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
    <div className={`editor-page ${isFullscreen ? 'fullscreen' : ''}`}>
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
            className="btn-action"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button 
            className="btn-action"
            onClick={handlePrint}
            title="طباعة"
          >
            <FaPrint />
          </button>
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

      {/* Jodit Editor */}
      <div className="editor-container">
        <JoditEditor
          ref={editorRef}
          value={content}
          config={config}
          onBlur={handleContentChange}
          onChange={() => {}}
        />
      </div>
    </div>
  );
};

export default Editor;
