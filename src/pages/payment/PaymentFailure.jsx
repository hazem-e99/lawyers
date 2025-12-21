import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';

/**
 * صفحة فشل الدفع
 * Payment Failure Page
 */
const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="card bg-white dark:bg-slate-800 text-center">
          {/* أيقونة الفشل */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* العنوان */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            فشل الدفع
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            عذراً، لم تتم عملية الدفع بنجاح.
          </p>

          {/* الأسباب المحتملة */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 text-right">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              الأسباب المحتملة:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• رصيد غير كافٍ في البطاقة</li>
              <li>• بيانات البطاقة غير صحيحة</li>
              <li>• تم إلغاء العملية</li>
              <li>• مشكلة في الاتصال بالبنك</li>
            </ul>
          </div>

          {/* معلومات الدعم */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              💡 <strong>نصيحة:</strong> تأكد من صحة بيانات بطاقتك ووجود رصيد كافٍ قبل إعادة المحاولة
            </p>
          </div>

          {/* أزرار */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/subscription')}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              حاول مرة أخرى
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للوحة التحكم
            </button>
          </div>

          {/* معلومات الدعم الفني */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
