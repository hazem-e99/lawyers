import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import confetti from 'canvas-confetti';

/**
 * صفحة نجاح الدفع
 * Payment Success Page
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchSubscriptionStatus } = useSubscription();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // احتفال بالنجاح 🎉
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // تحديث حالة الاشتراك
    setTimeout(() => {
      fetchSubscriptionStatus();
    }, 2000);

    // عد تنازلي للتوجيه التلقائي
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="card bg-white dark:bg-slate-800 text-center">
          {/* أيقونة النجاح */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* العنوان */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            تم الدفع بنجاح! 🎉
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            تم تفعيل اشتراكك بنجاح. مرحباً بك في النظام!
          </p>

          {/* معلومات إضافية */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              ✅ اشترك الآن نشط
              <br />
              ✅ يمكنك الوصول لجميع الميزات
              <br />
              ✅ تم إرسال إيصال الدفع للبريد الإلكتروني
            </p>
          </div>

          {/* عد تنازلي */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            سيتم توجيهك تلقائياً خلال {countdown} ثوان...
          </p>

          {/* أزرار */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              انتقل للوحة التحكم
            </button>

            <button
              onClick={() => navigate('/subscription')}
              className="btn-secondary"
            >
              عرض تفاصيل الاشتراك
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
