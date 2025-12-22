import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, Eye, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * صفحة إدارة طلبات الدفع - Super Admin فقط
 * Payment Requests Management Page - Super Admin Only
 */
const AdminPaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchPayments();
    }
  }, [user, filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'pending' 
        ? '/payments/admin/pending' 
        : `/payments/admin/all?status=${filter}`;
      const response = await api.get(endpoint);
      setPayments(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب طلبات الدفع:', error);
      toast.error('حدث خطأ في جلب طلبات الدفع');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      setProcessing(true);
      const response = await api.post(`/payments/admin/${paymentId}/approve`, {
        adminNote,
      });
      
      if (response.data.success) {
        toast.success('تم الموافقة على الدفع وتفعيل الاشتراك بنجاح');
        setShowModal(false);
        setAdminNote('');
        fetchPayments();
      }
    } catch (error) {
      console.error('خطأ في الموافقة:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في الموافقة على الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (paymentId) => {
    if (!adminNote.trim()) {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post(`/payments/admin/${paymentId}/reject`, {
        adminNote,
      });
      
      if (response.data.success) {
        toast.success('تم رفض طلب الدفع');
        setShowModal(false);
        setAdminNote('');
        fetchPayments();
      }
    } catch (error) {
      console.error('خطأ في الرفض:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ في رفض الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (payment) => {
    setSelectedPayment(payment);
    setAdminNote('');
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { text: 'تم القبول', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { text: 'مرفوض', className: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        <Icon size={16} />
        {badge.text}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.userId?.name?.toLowerCase().includes(searchLower) ||
      payment.userId?.email?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-bold text-gray-600">غير مصرح</h2>
        <p className="text-gray-500 mt-2">هذه الصفحة متاحة للمسؤولين فقط</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">إدارة طلبات الدفع</h1>
        <p className="text-gray-500 mt-1">مراجعة والموافقة على طلبات الدفع عبر InstaPay</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Eye className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">قيد المراجعة</p>
              <p className="text-3xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Clock className="text-4xl text-yellow-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">تم القبول</p>
              <p className="text-3xl font-bold mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">مرفوض</p>
              <p className="text-3xl font-bold mt-1">{stats.rejected}</p>
            </div>
            <XCircle className="text-4xl text-red-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pr-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
            >
              <option value="pending">قيد المراجعة</option>
              <option value="approved">تم القبول</option>
              <option value="rejected">مرفوض</option>
              <option value="">الكل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredPayments.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>المبلغ</th>
                  <th>الخطة</th>
                  <th>الحالة</th>
                  <th>تاريخ الطلب</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div>
                        <p className="font-medium text-[var(--color-text)]">
                          {payment.userId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.userId?.email}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-green-600">
                        {payment.amount} ج.م
                      </span>
                    </td>
                    <td>
                      <span className="status-badge info">
                        {payment.planDuration === 'monthly' ? 'شهري' : 'سنوي'}
                      </span>
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => openModal(payment)}
                        className="btn-sm bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Eye size={16} className="inline ml-1" />
                        مراجعة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Clock className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-500">جرب تغيير معايير البحث</p>
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">مراجعة طلب الدفع</h2>
              
              {/* User Info */}
              <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold mb-2">معلومات المستخدم</h3>
                <p><strong>الاسم:</strong> {selectedPayment.userId?.name}</p>
                <p><strong>البريد:</strong> {selectedPayment.userId?.email}</p>
                <p><strong>الهاتف:</strong> {selectedPayment.userId?.phone || 'غير متوفر'}</p>
              </div>

              {/* Payment Info */}
              <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold mb-2">معلومات الدفع</h3>
                <p><strong>المبلغ:</strong> {selectedPayment.amount} ج.م</p>
                <p><strong>الخطة:</strong> {selectedPayment.planDuration === 'monthly' ? 'شهري (30 يوم)' : 'سنوي (365 يوم)'}</p>
                <p><strong>رقم مرجع العملية:</strong> <span className="font-mono text-blue-600 dark:text-blue-400">{selectedPayment.referenceNumber}</span></p>
                <p><strong>تاريخ الطلب:</strong> {new Date(selectedPayment.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
              </div>

              {/* Screenshot */}
              <div className="mb-4">
                <h3 className="font-bold mb-2">صورة إثبات الدفع</h3>
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedPayment.screenshotUrl}`}
                    alt="إثبات الدفع"
                    className="w-full max-h-96 object-contain bg-slate-50 dark:bg-slate-900"
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>

              {/* Admin Note */}
              {selectedPayment.status === 'pending' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ملاحظة الإدارة {selectedPayment.status === 'pending' && '(اختياري للموافقة، إلزامي للرفض)'}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="input w-full"
                    rows="3"
                    placeholder="أضف ملاحظة..."
                  ></textarea>
                </div>
              )}

              {/* Existing Note */}
              {selectedPayment.adminNote && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-bold mb-2">ملاحظة سابقة</h3>
                  <p>{selectedPayment.adminNote}</p>
                  {selectedPayment.reviewedBy && (
                    <p className="text-sm text-gray-500 mt-2">
                      بواسطة: {selectedPayment.reviewedBy.name} - {new Date(selectedPayment.reviewedAt).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {selectedPayment.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApprove(selectedPayment._id)}
                      disabled={processing}
                      className="flex-1 btn-primary bg-green-500 hover:bg-green-600 disabled:opacity-50"
                    >
                      {processing ? 'جاري المعالجة...' : '✓ الموافقة وتفعيل الاشتراك'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedPayment._id)}
                      disabled={processing}
                      className="flex-1 btn-primary bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    >
                      {processing ? 'جاري المعالجة...' : '✕ رفض الطلب'}
                    </button>
                  </>
                ) : (
                  <div className="flex-1 text-center p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <p className="font-medium">
                      {selectedPayment.status === 'approved' ? '✓ تمت الموافقة على هذا الطلب' : '✕ تم رفض هذا الطلب'}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
