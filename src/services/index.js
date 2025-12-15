import api from './api';

/**
 * خدمات القضايا
 * Cases API Service
 */
export const casesService = {
  // الحصول على جميع القضايا
  getAll: async (params = {}) => {
    const response = await api.get('/cases', { params });
    return response.data;
  },

  // الحصول على قضية واحدة
  getById: async (id) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  // إنشاء قضية جديدة
  create: async (data) => {
    const response = await api.post('/cases', data);
    return response.data;
  },

  // تحديث قضية
  update: async (id, data) => {
    const response = await api.put(`/cases/${id}`, data);
    return response.data;
  },

  // حذف قضية
  delete: async (id) => {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  },

  // الحصول على الإحصائيات
  getStats: async () => {
    const response = await api.get('/cases/stats');
    return response.data;
  },

  // الحصول على القضايا القادمة
  getUpcoming: async (days = 7) => {
    const response = await api.get('/cases/upcoming', { params: { days } });
    return response.data;
  },
};

/**
 * خدمات العملاء
 * Clients API Service
 */
export const clientsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/clients/stats');
    return response.data;
  },
};

/**
 * خدمات الجلسات
 * Sessions API Service
 */
export const sessionsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/sessions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/sessions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/sessions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  },

  getUpcoming: async (days = 7) => {
    const response = await api.get('/sessions/upcoming', { params: { days } });
    return response.data;
  },

  getToday: async () => {
    const response = await api.get('/sessions/today');
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.put(`/sessions/${id}/status`, data);
    return response.data;
  },
};

/**
 * خدمات المستندات
 * Documents API Service
 */
export const documentsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  upload: async (formData) => {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  download: async (id) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  getStats: async () => {
    const response = await api.get('/documents/stats');
    return response.data;
  },
};

/**
 * خدمات المستخدمين
 * Users API Service
 */
export const usersService = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  getLawyers: async () => {
    const response = await api.get('/users/lawyers');
    return response.data;
  },
};

/**
 * خدمات لوحة التحكم
 * Dashboard API Service
 */
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getUpcomingSessions: async (limit = 5) => {
    const response = await api.get('/dashboard/upcoming-sessions', { params: { limit } });
    return response.data;
  },

  getRecentCases: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-cases', { params: { limit } });
    return response.data;
  },

  getRecentClients: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-clients', { params: { limit } });
    return response.data;
  },

  getFeesStats: async () => {
    const response = await api.get('/dashboard/fees-stats');
    return response.data;
  },
};

/**
 * خدمات الإشعارات
 * Notifications API Service
 */
export const notificationsService = {
  // جلب الإشعارات
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // عدد غير المقروءة
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // تحديد إشعار كمقروء
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // تحديد الكل كمقروء
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // حذف إشعار
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

/**
 * خدمات المكتبة
 * Library API Service
 */
export const libraryService = {
  // جلب محتويات مجلد
  getItems: async (parentId = null, params = {}) => {
    const queryParams = { ...params };
    if (parentId) {
      queryParams.parentId = parentId;
    }
    const response = await api.get('/library', { params: queryParams });
    return response.data;
  },

  // إنشاء مجلد جديد
  createFolder: async (data) => {
    const response = await api.post('/library/folder', data);
    return response.data;
  },

  // رفع ملف
  uploadFile: async (formData) => {
    const response = await api.post('/library/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // إنشاء مستند نصي جديد
  createEditorFile: async (data) => {
    const response = await api.post('/library/editor-file', data);
    return response.data;
  },

  // جلب محتوى مستند نصي
  getEditorFile: async (id) => {
    const response = await api.get(`/library/editor-file/${id}`);
    return response.data;
  },

  // حفظ محتوى مستند نصي
  updateEditorFile: async (id, data) => {
    const response = await api.put(`/library/editor-file/${id}`, data);
    return response.data;
  },

  // تصدير مستند نصي كـ Word
  exportEditorFile: async (id) => {
    const response = await api.get(`/library/editor-file/${id}/export`, {
      responseType: 'blob',
    });
    return response;
  },

  // تحديث عنصر (إعادة تسمية أو نقل)
  updateItem: async (id, data) => {
    const response = await api.put(`/library/${id}`, data);
    return response.data;
  },

  // حذف عنصر
  deleteItem: async (id) => {
    const response = await api.delete(`/library/${id}`);
    return response.data;
  },
};

/**
 * خدمات القوالب القانونية
 * Templates Service
 */
export const templatesService = {
  // جلب جميع القوالب
  getAll: async (params = {}) => {
    const response = await api.get('/templates', { params });
    return response.data;
  },

  // جلب قالب واحد
  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // استخدام قالب (إنشاء مستند جديد)
  useTemplate: async (id, data = {}) => {
    const response = await api.post(`/templates/use/${id}`, data);
    return response.data;
  },

  // تهيئة القوالب الافتراضية
  seedTemplates: async () => {
    const response = await api.post('/templates/seed');
    return response.data;
  },
};
