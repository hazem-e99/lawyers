import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

/**
 * صفحة غير موجودة
 * 404 Not Found Page
 */
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-4xl text-amber-500" />
        </div>
        <h1 className="text-6xl font-bold text-dark-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-600 mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <FaHome />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
