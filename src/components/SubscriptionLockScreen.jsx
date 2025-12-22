import { motion } from 'framer-motion';
import { Lock, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';

/**
 * شاشة قفل الاشتراك - تصميم احترافي
 * Subscription Lock Screen
 * 
 * تظهر عندما يكون الاشتراك غير نشط أو منتهي
 */
const SubscriptionLockScreen = ({ subscription, onRenew }) => {
  const isExpired = subscription && subscription.isExpired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a] overflow-hidden">
      {/* خلفية احترافية مع تأثيرات ضوئية */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950">
        {/* شبكة خلفية ناعمة */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
        
        {/* توهجات ضوئية */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* محتوى الشاشة */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        {/* البطاقة الزجاجية */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 shadow-2xl">
          {/* شريط علوي ملون */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-slate-500" />
          
          <div className="p-10 text-center">
            {/* أيقونة القفل بتصميم فخم */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 shadow-xl">
                <Lock className="h-10 w-10 text-blue-400" />
              </div>
            </motion.div>

            {/* العنوان */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-3xl font-bold text-white tracking-tight"
            >
               الوصول مقيد
            </motion.h1>

            {/* الوصف */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-lg text-slate-400 leading-relaxed"
            >
              {isExpired 
                ? 'انتهت صلاحية اشتراكك الحالي. يرجى التجديد لاستعادة الوصول الفوري لكافة المميزات.' 
                : 'حسابك غير نشط حالياً. يرجى تفعيل الاشتراك للبدء في استخدام النظام.'}
            </motion.p>

            {/* تفاصيل الحالة */}
            {(subscription?.expiresAt || subscription?.isTrial) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8 flex flex-col items-center gap-3"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">الخدمة متوقفة مؤقتاً</span>
                </div>
                
                {subscription.expiresAt && (
                  <p className="text-sm text-slate-500">
                    تاريخ الانتهاء: <span className="text-slate-300 font-mono">{new Date(subscription.expiresAt).toLocaleDateString('ar-EG')}</span>
                  </p>
                )}
              </motion.div>
            )}

            {/* أزرار الإجراءات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <button
                onClick={onRenew}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[1px] shadow-lg transition-all hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.98]"
              >
                <div className="relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 transition-all group-hover:bg-opacity-90">
                  <ShieldCheck className="h-5 w-5 text-white/90" />
                  <span className="text-lg font-bold text-white">تجديد الاشتراك الآن</span>
                </div>
              </button>
              
              <button className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                هل تواجه مشكلة؟ تواصل مع الدعم الفني
              </button>
            </motion.div>
          </div>
          
          {/* تذييل البطاقة */}
          <div className="bg-slate-900/50 p-4 text-center border-t border-slate-700/50">
             <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span>نظام آمن ومشفر 100%</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionLockScreen;
