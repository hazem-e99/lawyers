/**
 * AI Service for Legal Assistance
 * Supports Mock Mode (Rule-based) and Local LLM (Ollama)
 */

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

// Rule-based responses for Egyptian Legal Context (Fallback/Mock)
const LEGAL_KNOWLEDGE_BASE = [
  {
    keywords: ['عقد', 'ايجار', 'إيجار'],
    response: 'لصياغة عقد إيجار صحيح، يجب أن يتضمن: \n1. أسماء الطرفين (المؤجر والمستأجر) \n2. وصف العين المؤجرة بدقة \n3. مدة الإيجار وقيمته \n4. الغرض من الإيجار. \n\nهل تريد أن أقوم بإدراج نموذج عقد إيجار لك؟',
    template: `
      <h2 style="text-align: center;">عقد إيجار</h2>
      <p>أنه في يوم ............ الموافق .../.../20...</p>
      <p><strong>أولاً:</strong> السيد/ .......................... المقيم في ....................... (طرف أول - مؤجر)</p>
      <p><strong>ثانياً:</strong> السيد/ .......................... المقيم في ....................... (طرف ثاني - مستأجر)</p>
      <p>تم الاتفاق على ما يلي:</p>
      <p>1. أججر الطرف الأول للطرف الثاني الشقة رقم (...) بـ...</p>
    `
  },
  {
    keywords: ['طلاق', 'خلع', 'أسرة'],
    response: 'في قضايا الأسرة (الطلاق/الخلع) بمصر، يجب تقديم طلب لكتسوية المنازعات الأسرية أولاً. المستندات المطلوبة عادة: \n1. وثيقة الزواج \n2. شهادات ميلاد الأطفال \n3. انذار بالطاعة (في حالات معينة).',
    action: 'suggest_documents'
  },
  {
    keywords: ['صيغة', 'دعوى', 'صحيفة'],
    response: 'يمكنني مساعدتك في صياغة صحيفة دعوى. ما هو نوع الدعوى؟ (مدني، جنائي، عمالي؟)',
    template: `
      <h2 style="text-align: center;">صحيفة دعوى</h2>
      <p>إلى السيد رئيس محكمة .......................</p>
      <p>مقدمه لسيادتكم ...................................</p>
      <p>ضـــــــد ...........................................</p>
      <p><strong>الموضوع:</strong></p>
      <p>....................................................</p>
    `
  },
  {
    keywords: ['شكرا', 'متشكر', 'تمام'],
    response: 'العفو! أنا هنا لمساعدتك دائماً يا أستاذ. هل لديك أي استفسارات قانونية أخرى؟'
  },
  {
    keywords: ['مرحبا', 'اهلا', 'السلام'],
    response: 'أهلاً بك يا متر! ⚖️ أنا مساعدك القانوني الذكي. \nأقدر أساعدك في: \n1. صياغة العقود والمذكرات \n2. معلومات قانونية مصرية \n3. تنسيق المستندات.\n\nبم تحب نبدأ؟'
  }
];

export const aiService = {
  /**
   * Send message to AI (Try Local LLM first, fallback to Mock)
   */
  sendMessage: async (text, useLocalModel = false) => {
    // 1. Try Local LLM (Ollama) if enabled
    if (useLocalModel) {
      try {
        const response = await fetch(OLLAMA_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "llama2", // or whatever user has
            prompt: `You are an expert Egyptian Lawyer assistant. Answer in Arabic. User: ${text}`,
            stream: false
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            text: data.response,
            source: 'Open Source Model (Local)'
          };
        }
      } catch (error) {
        console.warn('Local LLM not available, switching to Rule-Based Engine.');
      }
    }

    // 2. Fallback to Rule-Based Knowledge Base
    // Artificial delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedText = text.toLowerCase();
    
    // Find matching rule
    const match = LEGAL_KNOWLEDGE_BASE.find(rule => 
      rule.keywords.some(k => normalizedText.includes(k))
    );

    if (match) {
      return {
        text: match.response,
        template: match.template || null,
        source: 'Legal Rule Engine'
      };
    }

    // Default response
    return {
      text: 'أنا لسة بتعلم يا متر. ممكن توضح أكتر؟ أو تطلب مني "صيغة عقد" أو "معلومة قانونية".',
      source: 'Legal Rule Engine'
    };
  }
};
