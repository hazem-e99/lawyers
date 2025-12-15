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
import VoiceDictation from '../../components/VoiceDictation';
import LegalAIChat from '../../components/LegalAIChat';
import toast from 'react-hot-toast';
import '../../styles/editor.scss';

/**
 * ======================================
 * صفحة محرر المستندات مع الأوامر الصوتية الشاملة
 * Editor Page with Comprehensive Voice Commands
 * ======================================
 * 
 * يدعم أكثر من 80 أمر صوتي للتحكم الكامل في المحرر
 * Supports 80+ voice commands for full editor control
 */
const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const voiceDictationRef = useRef(null);
  
  // ================================
  // حالة المكون
  // Component State
  // ================================
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  
  // تخزين آخر النصوص اللي اتقالت بالصوت عشان نقدر نمسحها
  const voiceHistoryRef = useRef([]);

  // ================================
  // إعدادات Jodit Editor
  // Jodit Editor Configuration
  // ================================
  const config = useMemo(() => ({
    readonly: false,
    language: 'ar',
    direction: 'rtl',
    height: 'calc(100vh - 180px)',
    minHeight: 500,
    
    toolbarButtonSize: 'middle',
    toolbarAdaptive: true,
    toolbarSticky: true,
    
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
    
    spellcheck: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    
    imageDefaultWidth: 300,
    tableAllowCellResize: true,
    
    defaultMode: 1,
    enter: 'p',
    
    style: {
      fontFamily: 'Amiri, Times New Roman, serif',
      fontSize: '14pt',
      direction: 'rtl',
      textAlign: 'right'
    },
    
    events: {
      afterInit: (editor) => {
        editor.editor.style.direction = 'rtl';
        editor.editor.style.textAlign = 'right';
      }
    },
    
    hidePoweredByJodit: true,
    
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

    placeholder: 'ابدأ الكتابة هنا...',
    allowResizeY: false,
    saveModeInStorage: false,
  }), []);

  // ================================
  // جلب المستند
  // Fetch Document
  // ================================
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

  // ================================
  // حفظ المستند
  // Save Document
  // ================================
  const handleSave = useCallback(async () => {
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
  }, [id, content, documentName]);

  // ================================
  // تصدير كملف Word
  // Export as Word
  // ================================
  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
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
  }, [id, hasChanges, handleSave, documentName]);

  // ================================
  // طباعة المستند
  // Print Document
  // ================================
  const handlePrint = useCallback(() => {
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
  }, [documentName, content]);

  // ================================
  // العودة للمكتبة
  // Go Back to Library
  // ================================
  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('يوجد تغييرات غير محفوظة. هل تريد المتابعة؟')) {
        navigate('/library');
      }
    } else {
      navigate('/library');
    }
  };

  // ================================
  // تحديث المحتوى
  // Update Content
  // ================================
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setHasChanges(true);
  };

  // ================================
  // الحصول على مرجع المحرر
  // Get Editor Reference
  // ================================
  const getEditorInstance = useCallback(() => {
    return editorRef.current || null;
  }, []);

  // ================================
  // إدراج نص في المحرر
  // Insert Text into Editor
  // ================================
  const insertTextAtCursor = useCallback((text) => {
    const editor = getEditorInstance();
    
    if (editor && editor.selection) {
      try {
        editor.selection.insertHTML(text);
        setHasChanges(true);
      } catch (e) {
        console.error('خطأ في إدراج النص:', e);
        setContent(prev => prev + text);
        setHasChanges(true);
      }
    } else {
      setContent(prev => prev + text);
      setHasChanges(true);
    }
  }, [getEditorInstance]);

  // ================================
  // تنفيذ أمر المحرر - نسخة محسّنة لـ Jodit
  // Execute Editor Command - Optimized for Jodit
  // ================================
  const executeEditorCommand = useCallback((command, value = null) => {
    const editor = getEditorInstance();
    
    if (!editor) {
      console.warn('المحرر غير متاح');
      return false;
    }
    
    try {
      // Jodit يستخدم طرق مختلفة للأوامر
      switch (command) {
        case 'undo':
          // استخدام history للتراجع
          if (editor.history && typeof editor.history.undo === 'function') {
            editor.history.undo();
          } else if (editor.undo) {
            editor.undo();
          } else {
            // fallback - استخدام execCommand
            editor.execCommand('undo');
          }
          toast.success('تم التراجع ↩️');
          break;
          
        case 'redo':
          if (editor.history && typeof editor.history.redo === 'function') {
            editor.history.redo();
          } else if (editor.redo) {
            editor.redo();
          } else {
            editor.execCommand('redo');
          }
          toast.success('تم الإعادة ↪️');
          break;
          
        case 'bold':
          editor.execCommand('bold');
          break;
          
        case 'italic':
          editor.execCommand('italic');
          break;
          
        case 'underline':
          editor.execCommand('underline');
          break;
          
        case 'strikethrough':
          editor.execCommand('strikethrough');
          break;
          
        case 'removeFormat':
          editor.execCommand('removeFormat');
          break;
          
        case 'justifyLeft':
          editor.execCommand('justifyleft');
          break;
          
        case 'justifyCenter':
          editor.execCommand('justifycenter');
          break;
          
        case 'justifyRight':
          editor.execCommand('justifyright');
          break;
          
        case 'justifyFull':
          editor.execCommand('justifyfull');
          break;
          
        case 'insertUnorderedList':
          editor.execCommand('insertUnorderedList');
          break;
          
        case 'insertOrderedList':
          editor.execCommand('insertOrderedList');
          break;
          
        case 'indent':
          editor.execCommand('indent');
          break;
          
        case 'outdent':
          editor.execCommand('outdent');
          break;
          
        case 'selectAll':
          editor.execCommand('selectAll');
          break;
          
        default:
          // محاولة تنفيذ الأمر مباشرة
          if (editor.execCommand) {
            editor.execCommand(command, false, value);
          }
      }
      
      setHasChanges(true);
      return true;
    } catch (e) {
      console.error('خطأ في تنفيذ الأمر:', e);
      return false;
    }
  }, [getEditorInstance]);
  
  // ================================
  // حذف النص المحدد أو آخر حرف
  // Delete Selected Text or Last Character
  // ================================
  const deleteText = useCallback(() => {
    const editor = getEditorInstance();
    
    if (!editor) return;
    
    try {
      // محاولة حذف النص المحدد
      const selection = editor.selection;
      if (selection) {
        const selectedText = selection.sel?.toString() || '';
        
        if (selectedText) {
          // حذف النص المحدد
          selection.remove();
          toast.success('تم الحذف ✓');
        } else {
          // لا يوجد تحديد - استخدام undo
          if (editor.history && typeof editor.history.undo === 'function') {
            editor.history.undo();
            toast.success('تم التراجع ↩️');
          } else {
            editor.execCommand('undo');
            toast.success('تم التراجع ↩️');
          }
        }
        setHasChanges(true);
      }
    } catch (e) {
      console.error('خطأ في الحذف:', e);
      // fallback to undo
      try {
        editor.execCommand('undo');
        toast.success('تم التراجع ↩️');
      } catch (e2) {}
    }
  }, [getEditorInstance]);

  // ================================
  // الحصول على التاريخ الحالي
  // Get Current Date
  // ================================
  const getCurrentDate = useCallback(() => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('ar-EG', options);
  }, []);

  // ================================
  // معالجة النص من الإملاء الصوتي
  // Handle Voice Dictation Text
  // ================================
  const handleVoiceTextReceived = useCallback((text) => {
    if (!text) return;
    
    const textWithSpace = text + ' ';
    const editor = getEditorInstance();
    
    // حفظ النص في السجل عشان نقدر نمسحه بعدين
    voiceHistoryRef.current.push(textWithSpace);
    
    // الاحتفاظ بآخر 20 نص فقط
    if (voiceHistoryRef.current.length > 20) {
      voiceHistoryRef.current.shift();
    }
    
    // إدراج النص في المحرر
    if (editor && editor.selection) {
      try {
        editor.selection.insertHTML(textWithSpace);
        setHasChanges(true);
      } catch (e) {
        console.error('خطأ في إدراج النص:', e);
      }
    }
  }, [getEditorInstance]);
  
  // ================================
  // مسح آخر نص اتقال بالصوت
  // Delete Last Voice Text
  // ================================
  const deleteLastVoiceText = useCallback(() => {
    const editor = getEditorInstance();
    const lastText = voiceHistoryRef.current.pop();
    
    if (!lastText) {
      // لو مفيش في الـ history، نستخدم undo
      if (editor) {
        try {
          if (editor.history && typeof editor.history.undo === 'function') {
            editor.history.undo();
            toast.success('تم التراجع ↩️');
          } else {
            editor.execCommand('undo');
            toast.success('تم التراجع ↩️');
          }
          setHasChanges(true);
        } catch (e) {
          toast.error('مش قادر أمسح!');
        }
      }
      return;
    }
    
    // محاولة مسح النص من المحرر مباشرة
    if (editor) {
      try {
        // الحصول على المحتوى الحالي من المحرر
        const currentContent = editor.value || '';
        const trimmedText = lastText.trim();
        
        // البحث عن آخر ظهور للنص
        let lastIndex = currentContent.lastIndexOf(lastText);
        
        if (lastIndex === -1) {
          lastIndex = currentContent.lastIndexOf(trimmedText);
        }
        
        if (lastIndex !== -1) {
          // حذف النص
          const textToRemove = lastIndex === currentContent.lastIndexOf(lastText) ? lastText : trimmedText;
          const newContent = currentContent.substring(0, lastIndex) + 
                            currentContent.substring(lastIndex + textToRemove.length);
          
          // تحديث المحرر
          editor.value = newContent;
          setContent(newContent);
          setHasChanges(true);
          toast.success(`تم مسح: "${trimmedText}" ✓`);
        } else {
          // لو مش لاقي النص، استخدم undo
          if (editor.history && typeof editor.history.undo === 'function') {
            editor.history.undo();
          } else {
            editor.execCommand('undo');
          }
          toast.success('تم التراجع ↩️');
          setHasChanges(true);
        }
      } catch (e) {
        console.error('خطأ في الحذف:', e);
        // Fallback to undo
        try {
          editor.execCommand('undo');
          toast.success('تم التراجع ↩️');
        } catch (e2) {
          toast.error('مش قادر أمسح!');
        }
      }
    }
  }, [getEditorInstance]);

  // ================================
  // معالجة الأوامر الصوتية الشاملة
  // Handle Comprehensive Voice Commands
  // ================================
  const handleVoiceCommand = useCallback((command) => {
    console.log('تنفيذ الأمر الصوتي:', command);
    
    switch (command) {
      // ========================================
      // أوامر الأسطر والفقرات
      // ========================================
      case 'newLine':
        insertTextAtCursor('<br>');
        break;
      case 'paragraph':
        insertTextAtCursor('<p>&nbsp;</p>');
        break;
      case 'doubleLine':
        insertTextAtCursor('<br><br>');
        break;
        
      // ========================================
      // أوامر العناوين
      // ========================================
      case 'heading':
        insertTextAtCursor('<h2 style="font-family: Almarai, sans-serif; color: #1e40af;">عنوان</h2>');
        break;
      case 'subheading':
        insertTextAtCursor('<h3 style="font-family: Almarai, sans-serif; color: #374151;">عنوان فرعي</h3>');
        break;
      case 'heading3':
        insertTextAtCursor('<h4 style="font-family: Almarai, sans-serif;">عنوان ثالث</h4>');
        break;
        
      // ========================================
      // أوامر التنسيق
      // ========================================
      case 'bold':
        executeEditorCommand('bold');
        break;
      case 'italic':
        executeEditorCommand('italic');
        break;
      case 'underline':
        executeEditorCommand('underline');
        break;
      case 'strikethrough':
        executeEditorCommand('strikethrough');
        break;
      case 'highlight':
        insertTextAtCursor('<mark>نص مظلل</mark>');
        break;
      case 'removeFormat':
        executeEditorCommand('removeFormat');
        break;
        
      // ========================================
      // أوامر المحاذاة
      // ========================================
      case 'alignRight':
        executeEditorCommand('justifyRight');
        break;
      case 'alignLeft':
        executeEditorCommand('justifyLeft');
        break;
      case 'alignCenter':
        executeEditorCommand('justifyCenter');
        break;
      case 'justify':
        executeEditorCommand('justifyFull');
        break;
        
      // ========================================
      // أوامر القوائم
      // ========================================
      case 'bulletList':
        executeEditorCommand('insertUnorderedList');
        break;
      case 'numberedList':
        executeEditorCommand('insertOrderedList');
        break;
      case 'listItem':
        insertTextAtCursor('<li>عنصر جديد</li>');
        break;
        
      // ========================================
      // علامات الترقيم
      // ========================================
      case 'period':
        insertTextAtCursor('.');
        break;
      case 'comma':
        insertTextAtCursor('،');
        break;
      case 'question':
        insertTextAtCursor('؟');
        break;
      case 'exclamation':
        insertTextAtCursor('!');
        break;
      case 'colon':
        insertTextAtCursor(':');
        break;
      case 'semicolon':
        insertTextAtCursor('؛');
        break;
      case 'dash':
        insertTextAtCursor(' - ');
        break;
      case 'openBracket':
        insertTextAtCursor('(');
        break;
      case 'closeBracket':
        insertTextAtCursor(')');
        break;
      case 'openQuotes':
        insertTextAtCursor('"');
        break;
      case 'closeQuotes':
        insertTextAtCursor('"');
        break;
        
      // ========================================
      // أوامر المسافات
      // ========================================
      case 'space':
        insertTextAtCursor('&nbsp;');
        break;
      case 'tab':
        insertTextAtCursor('&nbsp;&nbsp;&nbsp;&nbsp;');
        break;
      case 'indent':
        executeEditorCommand('indent');
        break;
      case 'outdent':
        executeEditorCommand('outdent');
        break;
        
      // ========================================
      // أوامر الجداول
      // ========================================
      case 'insertTable':
        insertTextAtCursor(`
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <th style="border: 1px solid #000; padding: 8px; background: #f3f4f6;">عمود 1</th>
              <th style="border: 1px solid #000; padding: 8px; background: #f3f4f6;">عمود 2</th>
              <th style="border: 1px solid #000; padding: 8px; background: #f3f4f6;">عمود 3</th>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;"></td>
              <td style="border: 1px solid #000; padding: 8px;"></td>
              <td style="border: 1px solid #000; padding: 8px;"></td>
            </tr>
          </table>
        `);
        break;
      case 'tableRow':
        insertTextAtCursor('<tr><td style="border: 1px solid #000; padding: 8px;"></td><td style="border: 1px solid #000; padding: 8px;"></td><td style="border: 1px solid #000; padding: 8px;"></td></tr>');
        break;
        
      // ========================================
      // أوامر الخط
      // ========================================
      case 'fontBigger':
        setFontSize(prev => {
          const newSize = Math.min(prev + 2, 72);
          insertTextAtCursor(`<span style="font-size: ${newSize}pt">`);
          return newSize;
        });
        break;
      case 'fontSmaller':
        setFontSize(prev => {
          const newSize = Math.max(prev - 2, 8);
          insertTextAtCursor(`<span style="font-size: ${newSize}pt">`);
          return newSize;
        });
        break;
      case 'fontRed':
        insertTextAtCursor('<span style="color: #dc2626;">');
        break;
      case 'fontBlue':
        insertTextAtCursor('<span style="color: #2563eb;">');
        break;
      case 'fontGreen':
        insertTextAtCursor('<span style="color: #059669;">');
        break;
      case 'fontBlack':
        insertTextAtCursor('<span style="color: #000000;">');
        break;
        
      // ========================================
      // أوامر الإدراج الخاصة
      // ========================================
      case 'horizontalLine':
        insertTextAtCursor('<hr style="border: none; border-top: 2px solid #000; margin: 20px 0;">');
        break;
      case 'pageBreak':
        insertTextAtCursor('<div style="page-break-after: always;"></div>');
        break;
      case 'blockquote':
        insertTextAtCursor('<blockquote style="border-right: 4px solid #1e40af; padding-right: 16px; margin: 16px 0; color: #4b5563; font-style: italic;">نص مقتبس</blockquote>');
        break;
      case 'codeBlock':
        insertTextAtCursor('<pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; font-family: Courier New, monospace; direction: ltr; text-align: left;">// كود برمجي</pre>');
        break;
        
      // ========================================
      // أوامر التراجع والإعادة
      // ========================================
      case 'undo':
        // مسح آخر نص اتقال بالصوت
        deleteLastVoiceText();
        break;
      case 'redo':
        executeEditorCommand('redo');
        break;
        
      // ========================================
      // أوامر الحذف
      // ========================================
      case 'deleteLastLine':
        setContent(prevContent => {
          const tempDiv = window.document.createElement('div');
          tempDiv.innerHTML = prevContent;
          const children = tempDiv.children;
          if (children.length > 0) {
            tempDiv.removeChild(children[children.length - 1]);
          }
          setHasChanges(true);
          return tempDiv.innerHTML;
        });
        toast.success('تم حذف آخر سطر');
        break;
      case 'deleteWord':
        // حذف آخر كلمة
        setContent(prevContent => {
          const newContent = prevContent.replace(/\s*\S+\s*$/, '');
          setHasChanges(true);
          return newContent;
        });
        toast.success('تم حذف آخر كلمة');
        break;
      case 'deleteAll':
        if (window.confirm('هل أنت متأكد من حذف كل المحتوى؟')) {
          setContent('');
          setHasChanges(true);
          toast.success('تم حذف كل المحتوى');
        }
        break;
      case 'clearFormat':
        executeEditorCommand('removeFormat');
        break;
        
      // ========================================
      // أوامر التحديد
      // ========================================
      case 'selectAll':
        executeEditorCommand('selectAll');
        break;
        
      // ========================================
      // أوامر النسخ واللصق
      // ========================================
      case 'copy':
        window.document.execCommand('copy');
        toast.success('تم النسخ');
        break;
      case 'cut':
        window.document.execCommand('cut');
        toast.success('تم القص');
        break;
        
      // ========================================
      // عبارات قانونية شائعة
      // ========================================
      case 'legalArticle':
        insertTextAtCursor('<p><strong>المادة رقم ( )</strong></p><p></p>');
        break;
      case 'legalClause':
        insertTextAtCursor('<p><strong>البند رقم ( )</strong>: </p>');
        break;
      case 'legalWhereas':
        insertTextAtCursor('<p>حيث أن </p>');
        break;
      case 'legalTherefore':
        insertTextAtCursor('<p>وبناءً عليه، </p>');
        break;
      case 'partyFirst':
        insertTextAtCursor('<strong>الطرف الأول</strong>: ');
        break;
      case 'partySecond':
        insertTextAtCursor('<strong>الطرف الثاني</strong>: ');
        break;
      case 'signature':
        insertTextAtCursor(`
          <div style="margin-top: 40px;">
            <p>التوقيع: _______________________</p>
            <p>الاسم: _______________________</p>
            <p>التاريخ: _______________________</p>
          </div>
        `);
        break;
      case 'insertDate':
        insertTextAtCursor(`<strong>${getCurrentDate()}</strong>`);
        break;
      case 'witness':
        insertTextAtCursor(`
          <div style="margin-top: 20px;">
            <p><strong>الشاهد:</strong></p>
            <p>الاسم: _______________________</p>
            <p>الرقم القومي: _______________________</p>
            <p>التوقيع: _______________________</p>
          </div>
        `);
        break;
      case 'court':
        insertTextAtCursor('<p style="text-align: center;"><strong>محكمة _______________</strong></p>');
        break;
      case 'defendant':
        insertTextAtCursor('<strong>المدعى عليه</strong>: ');
        break;
      case 'plaintiff':
        insertTextAtCursor('<strong>المدعي</strong>: ');
        break;
        
      // ========================================
      // أوامر التنسيق القانوني
      // ========================================
      case 'legalHeader':
        insertTextAtCursor(`
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
            <h2 style="margin: 0;">بسم الله الرحمن الرحيم</h2>
            <p style="margin: 10px 0;">جمهورية مصر العربية</p>
            <p style="margin: 0;">محكمة _______________</p>
          </div>
        `);
        break;
      case 'legalFooter':
        insertTextAtCursor(`
          <div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="text-align: right; width: 50%;">
                  <p>الطرف الأول</p>
                  <p>التوقيع: _____________</p>
                </td>
                <td style="text-align: left; width: 50%;">
                  <p>الطرف الثاني</p>
                  <p>التوقيع: _____________</p>
                </td>
              </tr>
            </table>
          </div>
        `);
        break;
        
      // ========================================
      // أوامر البحث
      // ========================================
      case 'find':
        executeEditorCommand('find');
        break;
      case 'findReplace':
        executeEditorCommand('findReplace');
        break;
        
      // ========================================
      // أوامر العرض
      // ========================================
      case 'fullscreen':
        setIsFullscreen(prev => !prev);
        break;
      case 'zoomIn':
        toast.success('تم التكبير');
        break;
      case 'zoomOut':
        toast.success('تم التصغير');
        break;
        
      // ========================================
      // أوامر المساعدة
      // ========================================
      case 'help':
        toast.success(
          `🎤 الأوامر المتاحة بالمصري:
• نزل سطر، اعمل عنوان، بولد، مايل
• نقطة، فاصلة، علامة استفهام
• الطرف الأول، توقيع، النهارده
• سيڤ، خلاص، كفاية، تمام`,
          { duration: 6000 }
        );
        break;
        
      // ========================================
      // أرقام
      // ========================================
      case 'number1':
        insertTextAtCursor('<p><strong>أولاً:</strong> </p>');
        break;
      case 'number2':
        insertTextAtCursor('<p><strong>ثانياً:</strong> </p>');
        break;
      case 'number3':
        insertTextAtCursor('<p><strong>ثالثاً:</strong> </p>');
        break;
      case 'number4':
        insertTextAtCursor('<p><strong>رابعاً:</strong> </p>');
        break;
      case 'number5':
        insertTextAtCursor('<p><strong>خامساً:</strong> </p>');
        break;
        
      // ========================================
      // تحيات ونهايات الخطابات
      // ========================================
      case 'greetingFormal':
        insertTextAtCursor('<p>سيادة المستشار/ _______________</p><p>تحية طيبة وبعد،</p>');
        break;
      case 'closingFormal':
        insertTextAtCursor('<p>وتفضلوا بقبول فائق الاحترام والتقدير،</p>');
        break;
        
      // ========================================
      // الرموز الخاصة
      // ========================================
      case 'symbolStar':
        insertTextAtCursor('★');
        break;
      case 'symbolArrow':
        insertTextAtCursor('←');
        break;
      case 'symbolCheck':
        insertTextAtCursor('✓');
        break;
      case 'symbolX':
        insertTextAtCursor('✗');
        break;
      case 'symbolBullet':
        insertTextAtCursor('●');
        break;
        
      // ========================================
      // أوامر التأكيد والرفض (عامية مصرية)
      // Confirmation Commands (Egyptian Dialect)
      // ========================================
      case 'confirmYes':
        toast.success('تمام! 👍');
        break;
      case 'confirmNo':
        toast.success('تم الإلغاء');
        break;
        
      // ========================================
      // عبارات الكتابة (عامية مصرية)
      // Writing Phrases (Egyptian Dialect)
      // ========================================
      case 'writeBismillah':
        insertTextAtCursor('<p style="text-align: center; font-size: 18pt; font-weight: bold;">بسم الله الرحمن الرحيم</p>');
        break;
      case 'writeThanks':
        insertTextAtCursor('<p>شكراً جزيلاً،</p>');
        break;
      case 'writeRegards':
        insertTextAtCursor('<p>مع خالص تحياتي،</p>');
        break;
        
      // ========================================
      // أوامر خاصة (تُعالج في مكان آخر)
      // ========================================
      case 'save':
      case 'stop':
      case 'print':
      case 'exportWord':
        // تُعالج في callbacks منفصلة
        break;
        
      default:
        console.warn('أمر غير معروف:', command);
    }
  }, [insertTextAtCursor, executeEditorCommand, getCurrentDate, deleteLastVoiceText]);

  // ================================
  // معالجة أمر الحفظ الصوتي
  // Handle Voice Save Command
  // ================================
  const handleVoiceSave = useCallback(() => {
    handleSave();
    toast.success('تم تنفيذ أمر الحفظ الصوتي');
  }, [handleSave]);

  // ================================
  // معالجة أمر الإيقاف الصوتي
  // Handle Voice Stop Command
  // ================================
  const handleVoiceStop = useCallback(() => {
    toast.success('تم إيقاف الإملاء الصوتي');
  }, []);

  // ================================
  // معالجة أمر الطباعة الصوتي
  // Handle Voice Print Command
  // ================================
  const handleVoicePrint = useCallback(() => {
    handlePrint();
    toast.success('جاري الطباعة...');
  }, [handlePrint]);

  // ================================
  // معالجة أمر التصدير الصوتي
  // Handle Voice Export Command
  // ================================
  const handleVoiceExport = useCallback(() => {
    handleExport();
  }, [handleExport]);

  // ================================
  // معالجة أمر ملء الشاشة الصوتي
  // Handle Voice Fullscreen Command
  // ================================
  const handleVoiceFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // ================================
  // حفظ تلقائي
  // Auto Save
  // ================================
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasChanges && !saving) {
        handleSave();
      }
    }, 120000);

    return () => clearInterval(autoSaveInterval);
  }, [hasChanges, saving, handleSave]);

  // ================================
  // اختصارات لوحة المفاتيح
  // Keyboard Shortcuts
  // ================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // ================================
  // شاشة التحميل
  // Loading Screen
  // ================================
  if (loading) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل المستند...</p>
      </div>
    );
  }

  // ================================
  // واجهة المستخدم
  // User Interface
  // ================================
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
        {/* زر الإملاء الصوتي مع الأوامر الشاملة */}
        <div className="voice-dictation-wrapper">
          <VoiceDictation 
            ref={voiceDictationRef}
            onTextReceived={handleVoiceTextReceived}
            onCommand={handleVoiceCommand}
            onSave={handleVoiceSave}
            onStop={handleVoiceStop}
            onPrint={handleVoicePrint}
            onExport={handleVoiceExport}
            onFullscreen={handleVoiceFullscreen}
          />
        </div>
        
        <JoditEditor
          ref={editorRef}
          value={content}
          config={config}
          onBlur={handleContentChange}
          onChange={() => {}}
        />
        
        {/* المساعد القانوني الذكي - AI Chatbot */}
        <LegalAIChat onInsertContent={insertTextAtCursor} />
      </div>
    </div>
  );
};

export default Editor;
