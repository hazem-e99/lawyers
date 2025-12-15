import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

/**
 * ======================================
 * مكون الإملاء الصوتي - نسخة محسّنة وسريعة
 * Optimized Voice Dictation Component
 * ======================================
 */

// ================================
// بناء خريطة الأوامر للبحث السريع
// Build Commands Map for Fast Lookup
// ================================
const buildCommandsMap = () => {
  const commands = {
    // أوامر الأسطر والفقرات
    'سطر جديد': 'newLine', 'سطر جديده': 'newLine', 'سطر جديدة': 'newLine',
    'نزل سطر': 'newLine', 'انزل سطر': 'newLine', 'سطر تاني': 'newLine',
    'روح سطر جديد': 'newLine', 'سطر': 'newLine', 'انتر': 'newLine',
    'نزل تحت': 'newLine', 'اعمل سطر': 'newLine',
    
    'فقرة جديدة': 'paragraph', 'فقرة جديده': 'paragraph', 'فقرة': 'paragraph',
    'براجراف': 'paragraph', 'اعمل فقرة': 'paragraph',
    
    'سطرين': 'doubleLine', 'نزل سطرين': 'doubleLine', 'اتنين سطر': 'doubleLine',
    
    // العناوين
    'عنوان': 'heading', 'عنوان جديد': 'heading', 'عنوان رئيسي': 'heading',
    'هيدر': 'heading', 'اعمل عنوان': 'heading', 'حط عنوان': 'heading',
    'تايتل': 'heading', 'عنوان كبير': 'heading',
    
    'عنوان فرعي': 'subheading', 'عنوان فرعى': 'subheading',
    'عنوان صغير': 'subheading', 'ساب هيدر': 'subheading',
    
    // التنسيق
    'غامق': 'bold', 'بولد': 'bold', 'تغميق': 'bold', 'عريض': 'bold',
    'اعمله بولد': 'bold', 'اعمله غامق': 'bold', 'غمقه': 'bold',
    'خليه بولد': 'bold', 'خليه غامق': 'bold', 'تخين': 'bold',
    
    'مائل': 'italic', 'ايتاليك': 'italic', 'مايل': 'italic',
    'اعمله مايل': 'italic', 'خليه مايل': 'italic', 'ميله': 'italic',
    
    'تحته خط': 'underline', 'خط تحت': 'underline', 'اندرلاين': 'underline',
    'اعمل خط تحته': 'underline', 'حط خط تحته': 'underline',
    
    'شطب': 'strikethrough', 'اشطبه': 'strikethrough', 'اضرب عليه': 'strikethrough',
    
    'تظليل': 'highlight', 'هايلايت': 'highlight', 'لونه': 'highlight',
    'ظلله': 'highlight',
    
    // المحاذاة
    'يمين': 'alignRight', 'محاذاة يمين': 'alignRight', 'على اليمين': 'alignRight',
    'ع اليمين': 'alignRight', 'خليه يمين': 'alignRight',
    
    'يسار': 'alignLeft', 'شمال': 'alignLeft', 'على الشمال': 'alignLeft',
    'ع الشمال': 'alignLeft', 'خليه شمال': 'alignLeft',
    
    'توسيط': 'alignCenter', 'وسط': 'alignCenter', 'سنتر': 'alignCenter',
    'في النص': 'alignCenter', 'ف النص': 'alignCenter', 'وسطه': 'alignCenter',
    
    'ضبط': 'justify', 'اضبطه': 'justify', 'ظبطه': 'justify',
    
    // القوائم
    'قائمة نقطية': 'bulletList', 'نقط': 'bulletList', 'بوليت': 'bulletList',
    'اعمل نقط': 'bulletList', 'حط نقط': 'bulletList',
    
    'قائمة مرقمة': 'numberedList', 'ترقيم': 'numberedList', 'ارقام': 'numberedList',
    'اعمل ارقام': 'numberedList', 'رقمه': 'numberedList',
    
    // علامات الترقيم
    'نقطة': 'period', 'نقطه': 'period',
    'فاصلة': 'comma', 'فاصله': 'comma',
    'علامة استفهام': 'question', 'استفهام': 'question',
    'علامة تعجب': 'exclamation', 'تعجب': 'exclamation',
    'نقطتين': 'colon',
    'فاصلة منقوطة': 'semicolon',
    'شرطة': 'dash',
    'افتح قوس': 'openBracket', 'قوس': 'openBracket',
    'اقفل قوس': 'closeBracket', 'سكر قوس': 'closeBracket',
    'افتح تنصيص': 'openQuotes',
    'اقفل تنصيص': 'closeQuotes',
    
    // المسافات
    'مسافة': 'space', 'مسافه': 'space', 'سبيس': 'space',
    'تاب': 'tab', 'بادئة': 'tab',
    'زيادة المسافة': 'indent', 'دخله جوه': 'indent',
    'تقليل المسافة': 'outdent', 'طلعه برة': 'outdent',
    
    // الجداول
    'جدول': 'insertTable', 'اعمل جدول': 'insertTable', 'حط جدول': 'insertTable',
    'صف جديد': 'tableRow', 'صف تاني': 'tableRow',
    
    // الخط
    'خط اكبر': 'fontBigger', 'كبر الخط': 'fontBigger', 'كبره': 'fontBigger',
    'خط اصغر': 'fontSmaller', 'صغر الخط': 'fontSmaller', 'صغره': 'fontSmaller',
    'لون احمر': 'fontRed', 'احمر': 'fontRed', 'خليه احمر': 'fontRed',
    'لون ازرق': 'fontBlue', 'ازرق': 'fontBlue', 'خليه ازرق': 'fontBlue',
    'لون اخضر': 'fontGreen', 'اخضر': 'fontGreen', 'خليه اخضر': 'fontGreen',
    'لون اسود': 'fontBlack', 'اسود': 'fontBlack',
    
    // الإدراج الخاص
    'خط افقي': 'horizontalLine', 'فاصل': 'horizontalLine', 'اعمل خط': 'horizontalLine',
    'صفحة جديدة': 'pageBreak', 'صفحه جديده': 'pageBreak',
    'اقتباس': 'blockquote', 'كوت': 'blockquote',
    'كود': 'codeBlock',
    
    // التراجع والإعادة
    'تراجع': 'undo', 'ارجع': 'undo', 'اندو': 'undo',
    'ارجع ورا': 'undo', 'غلط': 'undo', 'مش عايز': 'undo',
    'مش كده': 'undo', 'كنسل': 'undo', 'الغيها': 'undo',
    
    'اعادة': 'redo', 'ريدو': 'redo', 'رجعها تاني': 'redo',
    
    // الحذف - أوامر كتير عشان يفهم
    'امسح': 'undo', 'احذف': 'undo', 'شيل': 'undo', 'ارجع': 'undo',
    'امسحه': 'undo', 'احذفه': 'undo', 'شيله': 'undo',
    'امسحها': 'undo', 'احذفها': 'undo', 'شيلها': 'undo',
    'امسح ده': 'undo', 'شيل ده': 'undo', 'احذف ده': 'undo',
    'امسح دي': 'undo', 'شيل دي': 'undo', 'احذف دي': 'undo',
    'امسح كده': 'undo', 'مسح': 'undo', 'حذف': 'undo',
    'delete': 'undo', 'دليت': 'undo', 'باك سبيس': 'undo',
    
    'احذف اخر سطر': 'deleteLastLine', 'امسح اخر سطر': 'deleteLastLine',
    'شيل السطر': 'deleteLastLine', 'امسح السطر': 'deleteLastLine',
    'احذف السطر': 'deleteLastLine', 'شيل اخر سطر': 'deleteLastLine',
    'امسح اللي فات': 'deleteLastLine', 'شيل اللي فات': 'deleteLastLine',
    
    'احذف كلمة': 'deleteWord', 'امسح كلمة': 'deleteWord',
    'شيل الكلمة': 'deleteWord', 'امسح الكلمة': 'deleteWord',
    'احذف الكلمة': 'deleteWord', 'شيل كلمة': 'deleteWord',
    'امسح اخر كلمة': 'deleteWord', 'شيل اخر كلمة': 'deleteWord',
    
    'احذف الكل': 'deleteAll', 'امسح الكل': 'deleteAll',
    'شيل كل حاجة': 'deleteAll', 'فضي الصفحة': 'deleteAll',
    'امسح كل حاجة': 'deleteAll', 'نظف الصفحة': 'deleteAll',
    'امسح الكلام كله': 'deleteAll', 'شيل الكلام كله': 'deleteAll',
    
    // التحديد
    'تحديد الكل': 'selectAll', 'حدد الكل': 'selectAll',
    'سلكت اول': 'selectAll', 'ظلل الكل': 'selectAll',
    
    // النسخ واللصق
    'نسخ': 'copy', 'كوبي': 'copy', 'انسخ': 'copy', 'انسخه': 'copy',
    'لصق': 'paste', 'بيست': 'paste', 'الصق': 'paste', 'الزقه': 'paste',
    'قص': 'cut', 'كت': 'cut', 'اقصه': 'cut',
    
    // القانوني
    'مادة قانونية': 'legalArticle', 'حط مادة': 'legalArticle',
    'بند قانوني': 'legalClause', 'حط بند': 'legalClause',
    'حيث ان': 'legalWhereas', 'لما كان': 'legalWhereas',
    'لذلك': 'legalTherefore', 'وبناء عليه': 'legalTherefore',
    'عشان كده': 'legalTherefore', 'علشان كده': 'legalTherefore',
    'الطرف الاول': 'partyFirst', 'الطرف الأول': 'partyFirst',
    'الطرف الثاني': 'partySecond', 'الطرف التاني': 'partySecond',
    'توقيع': 'signature', 'امضا': 'signature', 'امضاء': 'signature',
    'تاريخ اليوم': 'insertDate', 'التاريخ': 'insertDate',
    'النهارده': 'insertDate', 'النهاردة': 'insertDate', 'انهارده': 'insertDate',
    'شاهد': 'witness', 'الشهود': 'witness',
    'محكمة': 'court', 'اسم المحكمة': 'court',
    'المدعى عليه': 'defendant', 'المدعي عليه': 'defendant',
    'المدعي': 'plaintiff', 'الشاكي': 'plaintiff',
    'ترويسة قانونية': 'legalHeader', 'هيدر قانوني': 'legalHeader',
    'تذييل قانوني': 'legalFooter',
    
    // البحث
    'بحث': 'find', 'ابحث': 'find', 'دور': 'find',
    'بحث واستبدال': 'findReplace', 'استبدال': 'findReplace',
    
    // الحفظ والإيقاف
    'حفظ': 'save', 'احفظ': 'save', 'سيف': 'save', 'سيڤ': 'save',
    'خزن': 'save', 'خزنه': 'save', 'احفظه': 'save',
    
    'ايقاف': 'stop', 'إيقاف': 'stop', 'وقف': 'stop', 'اوقف': 'stop',
    'ستوب': 'stop', 'توقف': 'stop', 'كفاية': 'stop', 'خلاص': 'stop',
    'بس': 'stop', 'بس كده': 'stop', 'كفاية كده': 'stop', 'تمام': 'stop',
    
    // الطباعة والتصدير
    'طباعة': 'print', 'اطبع': 'print', 'برنت': 'print', 'اطبعه': 'print',
    'تصدير وورد': 'exportWord', 'تصدير': 'exportWord',
    'نزله وورد': 'exportWord', 'طلعه وورد': 'exportWord',
    
    // العرض
    'ملء الشاشة': 'fullscreen', 'شاشة كاملة': 'fullscreen',
    'فول سكرين': 'fullscreen', 'كبر الشاشة': 'fullscreen',
    
    // المساعدة
    'مساعدة': 'help', 'هيلب': 'help', 'ساعدني': 'help',
    'ايه الاوامر': 'help', 'الاوامر': 'help',
    
    // الأرقام
    'اولا': 'number1', 'أولاً': 'number1', 'اول حاجة': 'number1',
    'ثانيا': 'number2', 'ثانياً': 'number2', 'تاني حاجة': 'number2',
    'ثالثا': 'number3', 'ثالثاً': 'number3', 'تالت حاجة': 'number3',
    'رابعا': 'number4', 'رابعاً': 'number4', 'رابع حاجة': 'number4',
    'خامسا': 'number5', 'خامساً': 'number5', 'خامس حاجة': 'number5',
    
    // التحيات
    'تحية رسمية': 'greetingFormal', 'سيادة': 'greetingFormal',
    'ختام رسمي': 'closingFormal', 'وتفضلوا': 'closingFormal',
    
    // الرموز
    'نجمة': 'symbolStar', 'سهم': 'symbolArrow',
    'علامة صح': 'symbolCheck', 'صح': 'symbolCheck',
    'علامة خطأ': 'symbolX', 'غلط': 'symbolX',
    
    // عبارات الكتابة
    'بسم الله': 'writeBismillah', 'بسم الله الرحمن الرحيم': 'writeBismillah',
    'بسملة': 'writeBismillah',
    'شكرا': 'writeThanks', 'شكراً': 'writeThanks', 'متشكر': 'writeThanks',
    'تحياتي': 'writeRegards', 'مع تحياتي': 'writeRegards', 'سلام': 'writeRegards',
    
    // التأكيد
    'ايوه': 'confirmYes', 'اه': 'confirmYes', 'اوكي': 'confirmYes',
    'ماشي': 'confirmYes', 'حاضر': 'confirmYes', 'طيب': 'confirmYes',
    'لا': 'confirmNo', 'لأ': 'confirmNo', 'الغي': 'confirmNo',
  };
  
  return commands;
};

// إنشاء الخريطة مرة واحدة
const COMMANDS_MAP = buildCommandsMap();

// أسماء عرض الأوامر
const COMMAND_DISPLAY_NAMES = {
  'newLine': 'سطر جديد', 'paragraph': 'فقرة', 'doubleLine': 'سطرين',
  'heading': 'عنوان', 'subheading': 'عنوان فرعي',
  'bold': 'غامق', 'italic': 'مائل', 'underline': 'تحته خط',
  'strikethrough': 'شطب', 'highlight': 'تظليل',
  'alignRight': 'يمين', 'alignLeft': 'يسار', 'alignCenter': 'وسط', 'justify': 'ضبط',
  'bulletList': 'نقط', 'numberedList': 'ترقيم',
  'period': '.', 'comma': '،', 'question': '؟', 'exclamation': '!',
  'colon': ':', 'semicolon': '؛', 'dash': '-',
  'openBracket': '(', 'closeBracket': ')',
  'openQuotes': '"', 'closeQuotes': '"',
  'space': 'مسافة', 'tab': 'تاب', 'indent': 'مسافة', 'outdent': 'تقليل',
  'insertTable': 'جدول', 'tableRow': 'صف',
  'fontBigger': 'كبّر', 'fontSmaller': 'صغّر',
  'fontRed': 'أحمر', 'fontBlue': 'أزرق', 'fontGreen': 'أخضر', 'fontBlack': 'أسود',
  'horizontalLine': 'خط فاصل', 'pageBreak': 'صفحة جديدة',
  'blockquote': 'اقتباس', 'codeBlock': 'كود',
  'undo': 'تراجع', 'redo': 'إعادة',
  'deleteLastLine': 'حذف سطر', 'deleteWord': 'حذف كلمة', 'deleteAll': 'حذف الكل',
  'selectAll': 'تحديد الكل',
  'copy': 'نسخ', 'paste': 'لصق', 'cut': 'قص',
  'legalArticle': 'مادة', 'legalClause': 'بند',
  'legalWhereas': 'حيث أن', 'legalTherefore': 'لذلك',
  'partyFirst': 'الطرف الأول', 'partySecond': 'الطرف الثاني',
  'signature': 'توقيع', 'insertDate': 'التاريخ',
  'witness': 'شاهد', 'court': 'محكمة',
  'defendant': 'المدعى عليه', 'plaintiff': 'المدعي',
  'legalHeader': 'ترويسة', 'legalFooter': 'تذييل',
  'find': 'بحث', 'findReplace': 'استبدال',
  'save': 'حفظ ✓', 'stop': 'إيقاف',
  'print': 'طباعة', 'exportWord': 'تصدير',
  'fullscreen': 'ملء الشاشة',
  'help': 'مساعدة',
  'number1': 'أولاً', 'number2': 'ثانياً', 'number3': 'ثالثاً',
  'number4': 'رابعاً', 'number5': 'خامساً',
  'greetingFormal': 'تحية', 'closingFormal': 'ختام',
  'symbolStar': '★', 'symbolArrow': '←', 'symbolCheck': '✓', 'symbolX': '✗',
  'writeBismillah': 'بسملة', 'writeThanks': 'شكراً', 'writeRegards': 'تحياتي',
  'confirmYes': 'تمام ✓', 'confirmNo': 'إلغاء',
};

// ================================
// المكون الرئيسي
// ================================
const VoiceDictation = forwardRef(({ 
  onTextReceived, 
  onCommand,
  onSave,
  onStop,
  onPrint,
  onExport,
  onFullscreen,
  disabled = false 
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [lastCommand, setLastCommand] = useState(null);
  const [showCommandPopup, setShowCommandPopup] = useState(false);
  
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const commandTimeoutRef = useRef(null);
  const lastProcessedRef = useRef('');
  const restartTimeoutRef = useRef(null);
  
  // ================================
  // كشف الأوامر - نسخة سريعة
  // Fast Command Detection
  // ================================
  const detectCommand = useCallback((text) => {
    const normalizedText = text.trim().toLowerCase()
      .replace(/أ|إ|آ/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');
    
    // البحث المباشر في الخريطة (O(1))
    if (COMMANDS_MAP[normalizedText]) {
      return {
        action: COMMANDS_MAP[normalizedText],
        displayName: COMMAND_DISPLAY_NAMES[COMMANDS_MAP[normalizedText]] || normalizedText,
        textBefore: '',
        textAfter: ''
      };
    }
    
    // البحث عن أوامر داخل النص - مرتب حسب الطول
    const sortedPatterns = Object.keys(COMMANDS_MAP)
      .sort((a, b) => b.length - a.length);
    
    for (const pattern of sortedPatterns) {
      const normalizedPattern = pattern.toLowerCase()
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه');
      
      const index = normalizedText.indexOf(normalizedPattern);
      if (index !== -1) {
        const action = COMMANDS_MAP[pattern];
        return {
          action,
          displayName: COMMAND_DISPLAY_NAMES[action] || pattern,
          textBefore: normalizedText.substring(0, index).trim(),
          textAfter: normalizedText.substring(index + normalizedPattern.length).trim()
        };
      }
    }
    
    return null;
  }, []);

  // ================================
  // معالجة الأوامر
  // ================================
  const processCommand = useCallback((commandInfo) => {
    if (!commandInfo) return;
    
    const { action, displayName, textBefore, textAfter } = commandInfo;
    
    // عرض الأمر
    setLastCommand(displayName);
    setShowCommandPopup(true);
    
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }
    commandTimeoutRef.current = setTimeout(() => {
      setShowCommandPopup(false);
    }, 1500);
    
    // النص قبل الأمر
    if (textBefore && onTextReceived) {
      onTextReceived(textBefore);
    }
    
    // تنفيذ الأمر
    if (onCommand) {
      onCommand(action);
    }
    
    // أوامر خاصة
    switch (action) {
      case 'save':
        if (onSave) onSave();
        break;
      case 'print':
        if (onPrint) onPrint();
        break;
      case 'exportWord':
        if (onExport) onExport();
        break;
      case 'fullscreen':
        if (onFullscreen) onFullscreen();
        break;
      case 'stop':
        stopListening();
        if (onStop) onStop();
        break;
    }
    
    // النص بعد الأمر
    if (textAfter && onTextReceived) {
      onTextReceived(textAfter);
    }
  }, [onTextReceived, onCommand, onSave, onStop, onPrint, onExport, onFullscreen]);

  // ================================
  // معالجة النتائج
  // ================================
  const handleResult = useCallback((transcript) => {
    if (!transcript.trim()) return;
    
    // منع المعالجة المكررة
    if (transcript === lastProcessedRef.current) return;
    lastProcessedRef.current = transcript;
    
    // مسح بعد ثانية
    setTimeout(() => {
      lastProcessedRef.current = '';
    }, 1000);
    
    const commandInfo = detectCommand(transcript);
    
    if (commandInfo) {
      processCommand(commandInfo);
    } else {
      if (onTextReceived) {
        onTextReceived(transcript.trim());
      }
    }
  }, [detectCommand, processCommand, onTextReceived]);

  // ================================
  // إيقاف الاستماع
  // ================================
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
  }, []);

  // ================================
  // بدء الاستماع
  // ================================
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setError(null);
    
    try {
      // إيقاف أي استماع سابق
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      
      // انتظار قليل ثم البدء
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          isListeningRef.current = true;
        } catch (e) {
          if (e.name !== 'InvalidStateError') {
            setError('مش قادر أبدأ. جرب تاني.');
          }
        }
      }, 100);
    } catch (e) {
      console.error('خطأ:', e);
    }
  }, []);

  // ================================
  // تبديل الاستماع
  // ================================
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // ================================
  // API للمكون الأب
  // ================================
  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
    toggleListening,
    isListening: () => isListeningRef.current
  }), [startListening, stopListening, toggleListening]);

  // ================================
  // إعداد التعرف على الكلام
  // ================================
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // إعدادات مُحسّنة
    recognition.lang = 'ar-EG';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // النتائج
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) {
            handleResult(transcript);
          }
        }
      }
    };
    
    // الأخطاء
    recognition.onerror = (event) => {
      console.log('خطأ:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError('اسمح للميكروفون');
          stopListening();
          break;
        case 'network':
          setError('في مشكلة في النت');
          break;
        case 'audio-capture':
          setError('وصل ميكروفون');
          stopListening();
          break;
        case 'no-speech':
        case 'aborted':
          // تجاهل
          break;
      }
    };
    
    // عند الانتهاء - إعادة تشغيل تلقائية
    recognition.onend = () => {
      if (isListeningRef.current) {
        // إعادة تشغيل بعد تأخير بسيط
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // تجاهل
            }
          }
        }, 100);
      }
    };
    
    recognitionRef.current = recognition;
    
    // تنظيف
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [handleResult, stopListening]);

  // ================================
  // واجهة المستخدم
  // ================================
  const buttonClass = !isSupported || disabled 
    ? 'voice-dictation-btn disabled'
    : isListening 
      ? 'voice-dictation-btn listening'
      : 'voice-dictation-btn';
  
  const tooltip = !isSupported 
    ? 'استخدم Chrome'
    : isListening 
      ? 'قول "خلاص" للإيقاف'
      : 'إملاء صوتي 🎤';
  
  return (
    <div className="voice-dictation-container">
      <button
        type="button"
        className={buttonClass}
        onClick={toggleListening}
        disabled={!isSupported || disabled}
        title={tooltip}
      >
        {isSupported ? <FaMicrophone /> : <FaMicrophoneSlash />}
        {isListening && (
          <span className="listening-indicator">
            <span className="pulse-ring"></span>
          </span>
        )}
      </button>
      
      {showCommandPopup && lastCommand && (
        <div className="voice-command-popup">
          <span className="command-icon">✓</span>
          <span className="command-text">{lastCommand}</span>
        </div>
      )}
      
      {error && (
        <div className="voice-dictation-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {isListening && (
        <div className="voice-dictation-status">
          <span className="status-dot"></span>
          بسمعك...
        </div>
      )}
    </div>
  );
});

VoiceDictation.displayName = 'VoiceDictation';

export default VoiceDictation;
