import { useState, useEffect, useCallback, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

/**
 * مكون الإملاء الصوتي - Voice Dictation Component
 * يحول الكلام المنطوق بالعربية المصرية إلى نص
 * Uses Web Speech API with Egyptian Arabic (ar-EG)
 */
const VoiceDictation = ({ onTextReceived, disabled = false }) => {
  // حالة المكون
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  
  // مرجع للمعرف الصوتي
  const recognitionRef = useRef(null);
  
  // التحقق من دعم المتصفح
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('المتصفح لا يدعم التعرف على الكلام. يرجى استخدام Google Chrome.');
      return;
    }
    
    // إنشاء كائن التعرف على الكلام
    const recognition = new SpeechRecognition();
    
    // إعدادات التعرف على الكلام
    recognition.lang = 'ar-EG'; // اللهجة المصرية
    recognition.continuous = true; // الاستمرار في الاستماع
    recognition.interimResults = false; // النتائج النهائية فقط
    
    // معالجة النتائج
    recognition.onresult = (event) => {
      // جمع النص من جميع النتائج الجديدة
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (transcript.trim() && onTextReceived) {
        onTextReceived(transcript.trim());
      }
    };
    
    // معالجة الأخطاء
    recognition.onerror = (event) => {
      console.error('خطأ في التعرف على الكلام:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError('تم رفض إذن الميكروفون. يرجى السماح بالوصول للميكروفون.');
          break;
        case 'no-speech':
          // لا نعرض خطأ هنا - طبيعي عند الصمت
          break;
        case 'network':
          setError('خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت.');
          break;
        case 'audio-capture':
          setError('لم يتم العثور على ميكروفون. يرجى توصيل ميكروفون.');
          break;
        case 'aborted':
          // تم إيقاف الاستماع - لا حاجة لعرض خطأ
          break;
        default:
          setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
      
      setIsListening(false);
    };
    
    // عند انتهاء الاستماع
    recognition.onend = () => {
      // إعادة تشغيل الاستماع إذا كان المستخدم لا يزال يريد ذلك
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // تجاهل خطأ إذا كان قيد التشغيل بالفعل
        }
      }
    };
    
    // حفظ المرجع
    recognitionRef.current = recognition;
    
    // تنظيف عند إزالة المكون
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // تجاهل أي خطأ
        }
        recognitionRef.current = null;
      }
    };
  }, [onTextReceived]);
  
  // تحديث حالة الاستماع في recognition
  useEffect(() => {
    // هذا التأثير يضمن إعادة تشغيل الاستماع عند تغيير الحالة
  }, [isListening]);
  
  // بدء/إيقاف الاستماع
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    // مسح الخطأ السابق
    setError(null);
    
    if (isListening) {
      // إيقاف الاستماع
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('خطأ في إيقاف الاستماع:', e);
      }
      setIsListening(false);
    } else {
      // بدء الاستماع
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('خطأ في بدء الاستماع:', e);
        setError('لا يمكن بدء الاستماع. يرجى المحاولة مرة أخرى.');
      }
    }
  }, [isListening]);
  
  // إيقاف الاستماع عند إزالة المكون
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // تجاهل
        }
      }
    };
  }, [isListening]);
  
  // تحديد الحالة المعروضة
  const getButtonState = () => {
    if (!isSupported || disabled) {
      return {
        className: 'voice-dictation-btn disabled',
        icon: <FaMicrophoneSlash />,
        tooltip: !isSupported 
          ? 'المتصفح لا يدعم الإملاء الصوتي' 
          : 'الإملاء الصوتي غير متاح حالياً',
      };
    }
    
    if (isListening) {
      return {
        className: 'voice-dictation-btn listening',
        icon: <FaMicrophone />,
        tooltip: 'إيقاف الإملاء الصوتي',
      };
    }
    
    return {
      className: 'voice-dictation-btn',
      icon: <FaMicrophone />,
      tooltip: 'إملاء صوتي',
    };
  };
  
  const buttonState = getButtonState();
  
  return (
    <div className="voice-dictation-container">
      <button
        type="button"
        className={buttonState.className}
        onClick={toggleListening}
        disabled={!isSupported || disabled}
        title={buttonState.tooltip}
        aria-label={buttonState.tooltip}
      >
        {buttonState.icon}
        {isListening && (
          <span className="listening-indicator">
            <span className="pulse-ring"></span>
            <span className="pulse-ring delay"></span>
          </span>
        )}
      </button>
      
      {/* رسالة الخطأ */}
      {error && (
        <div className="voice-dictation-error" role="alert">
          {error}
          <button 
            type="button" 
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="إغلاق الرسالة"
          >
            ×
          </button>
        </div>
      )}
      
      {/* مؤشر الاستماع */}
      {isListening && (
        <div className="voice-dictation-status">
          <span className="status-dot"></span>
          جاري الاستماع...
        </div>
      )}
    </div>
  );
};

export default VoiceDictation;
