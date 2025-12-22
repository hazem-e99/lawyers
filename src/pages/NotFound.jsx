import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaExclamationTriangle, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useEffect, useState } from 'react';

/**
 * صفحة غير موجودة
 * 404 Not Found Page
 */
const NotFound = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{
      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)'
    }}>
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* محتوى الصفحة */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* أيقونة */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md bg-white/20 border-4 border-white/30 shadow-2xl animate-bounce" style={{ animationDuration: '2s' }}>
            <FaExclamationTriangle className="text-6xl text-white drop-shadow-lg" />
          </div>
          
          {/* دوائر زخرفية */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>

        {/* رقم الخطأ */}
        <h1 className="text-9xl font-black text-white mb-4 drop-shadow-2xl" style={{
          textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.2)'
        }}>
          404
        </h1>

        {/* العنوان */}
        <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
          الصفحة غير موجودة
        </h2>

        {/* الوصف */}
        <p className="text-xl text-white/90 mb-10 max-w-md mx-auto leading-relaxed backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
        </p>

        {/* الأزرار */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/" 
            className="group flex items-center gap-3 px-8 py-4 bg-white text-[var(--color-primary)] rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:bg-opacity-95"
          >
            <FaHome className="text-xl group-hover:rotate-12 transition-transform duration-300" />
            <span>العودة للرئيسية</span>
          </Link>

          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 shadow-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
          >
            <FaArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
            <span>العودة للخلف</span>
          </button>
        </div>

        {/* رابط البحث */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 group"
          >
            <FaSearch className="group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">أو ابحث في لوحة التحكم</span>
          </Link>
        </div>
      </div>

      {/* CSS إضافي للأنيميشن */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
