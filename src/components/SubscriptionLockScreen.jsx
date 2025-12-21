import { motion } from 'framer-motion';
import { Lock, Calendar, AlertCircle } from 'lucide-react';

/**
 * شاشة قفل الاشتراك
 * Subscription Lock Screen
 * 
 * تظهر عندما يكون الاشتراك غير نشط أو منتهي
 */
const SubscriptionLockScreen = ({ subscription, onRenew }) => {
  const isExpired = subscription && subscription.isExpired;
  const daysRemaining = subscription?.daysRemaining || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* محتوى الشاشة */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* البطاقة */}
        <div className="overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-8 text-center">
            {/* أيقونة القفل */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-lg"
            >
              <Lock className="h-12 w-12 text-white" />
            </motion.div>

            {/* العنوان */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-3xl font-bold text-white"
            >
              الاشتراك {isExpired ? 'منتهي' : 'غير مفعل'}
            </motion.h1>

            {/* الوصف */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 text-lg text-white/80"
            >
              من فضلك قم بتجديد الاشتراك للاستمرار في استخدام النظام
            </motion.p>

            {/* معلومات إضافية */}
            {subscription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8 space-y-3"
              >
                {subscription.isTrial && (
                  <div className="flex items-center justify-center gap-2 text-yellow-300">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">الفترة التجريبية منتهية</span>
                  </div>
                )}

                {subscription.expiresAt && (
                  <div className="flex items-center justify-center gap-2 text-white/70">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">
                      انتهى في: {new Date(subscription.expiresAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* زر التجديد */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRenew}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              اشترك الآن - جدد اشتراكك
            </motion.button>

            {/* معلومات التواصل */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-sm text-white/60"
            >
              للمساعدة، يرجى التواصل مع الدعم الفني
            </motion.p>
          </div>
        </div>

        {/* شعار الخطة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <div className="inline-block rounded-full bg-white/10 px-6 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-white/80">الخطة Professional</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SubscriptionLockScreen;
