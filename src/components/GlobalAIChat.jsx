import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaMicrophone, FaTimes, FaExpand, FaCompress, FaMagic, FaTrash } from 'react-icons/fa';
import { generalAiService } from '../services/generalAiService'; // تأكد من المسار
import '../styles/ai-chat.scss';

const GlobalAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load History
  useEffect(() => {
    const history = generalAiService.loadHistory();
    if (history && history.length > 0) {
      setMessages(history);
    } else {
      setMessages([{ 
        id: 1, 
        text: 'أهلاً يا متر! 🎓\nأنا مساعدك الذكي المفتوح المصدر.\nجاهز أجاوبك على أي سؤال عام أو قانوني.\nمعاك 24/7!', 
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, []);

  // Save History
  useEffect(() => {
    if (messages.length > 0) {
      generalAiService.saveHistory(messages);
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ar-EG';
      recognitionRef.current.continuous = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // إرسال سياق المحادثة بالكامل للموديل
      // Send message to General AI Service
      const updatedMessages = [...messages, userMsg];
      const response = await generalAiService.sendMessage(updatedMessages);
      
      const botMsg = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm('هل أنت متأكد من مسح المحادثة؟')) {
      generalAiService.clearHistory();
      setMessages([{ 
        id: Date.now(), 
        text: 'تم مسح المحادثة. ابدأ من جديد!', 
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  if (!isOpen) {
    return (
      <div className="ai-chat-container global-chat">
        <button 
          className="ai-chat-trigger"
          onClick={() => setIsOpen(true)}
          title="مساعد الذكاء الاصطناعي العام"
        >
          <FaRobot />
        </button>
      </div>
    );
  }

  return (
    <div className="ai-chat-container global-chat">
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <div className="bot-avatar"><FaRobot /></div>
            <div>
              <h3>المساعد العام</h3>
              <span className="status-badge">متصل</span>
            </div>
          </div>
          <div className="header-controls">
            <button onClick={clearChat} title="مسح المحادثة"><FaTrash /></button>
            <button onClick={() => setIsOpen(false)}><FaTimes /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {msg.text.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="quick-prompts">
          <button onClick={() => { setInputText('لخص لي قانون العمل الجديد'); handleSend(); }}>📜 ملخص قوانين</button>
          <button onClick={() => { setInputText('اكتب إيميل اعتذار لعميل'); handleSend(); }}>📧 كتابة إيميل</button>
          <button onClick={() => { setInputText('نظم لي جدول اليوم'); handleSend(); }}>📅 تنظيم وقت</button>
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="input-wrapper">
            <button 
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleVoice}
              title="تحدث"
            >
              <FaMicrophone />
            </button>
            
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="اكتب أي سؤال عام..."
              rows={1}
            />
            
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={!inputText.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
      
      {/* Trigger Button (Visible when open too, to minimize) */}
      <button 
        className="ai-chat-trigger active"
        onClick={() => setIsOpen(false)}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default GlobalAIChat;
