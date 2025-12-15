import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaMicrophone, FaTimes, FaExpand, FaCompress, FaMagic, FaFileAlt } from 'react-icons/fa';
import { aiService } from '../services/aiService';
import '../styles/ai-chat.scss';

const LegalAIChat = ({ onInsertContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'أهلاً يا متر! ⚖️ أنا مساعدك القانوني الذكي.\nازاي أقدر أساعدك النهاردة في الشغل؟', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
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
      // Call AI Service
      const response = await aiService.sendMessage(userMsg.text);
      
      const botMsg = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        template: response.template, // If AI provided a template
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

  const insertTemplate = (template) => {
    if (onInsertContent) {
      onInsertContent(template);
      
      // Add system message confirming insertion
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: '✅ تم إدراج الصيغة في المحرر بنجاح.',
        sender: 'system',
        timestamp: new Date()
      }]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="ai-chat-trigger"
        onClick={() => setIsOpen(true)}
        title="المساعد القانوني الذكي"
      >
        <FaRobot />
      </button>
    );
  }

  return (
    <div className="ai-chat-container">
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <div className="bot-avatar"><FaRobot /></div>
            <div>
              <h3>المساعد القانوني</h3>
              <span className="status-badge">متاح (مجاني)</span>
            </div>
          </div>
          <div className="header-controls">
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
              
              {msg.template && (
                <div className="message-actions">
                  <button onClick={() => insertTemplate(msg.template)}>
                    <FaFileAlt /> إدراج في المحرر
                  </button>
                </div>
              )}
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
          <button onClick={() => { setInputText('صيغة عقد إيجار'); handleSend(); }}>📜 عقد إيجار</button>
          <button onClick={() => { setInputText('صيغة صحيفة دعوى'); handleSend(); }}>⚖️ صحيفة دعوى</button>
          <button onClick={() => { setInputText('إجراءات رفع دعوى خلع'); handleSend(); }}>💔 إجراءات خلع</button>
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
              placeholder="اكتب استشارتك القانونية هنا..."
              rows={1}
            />
            
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={!inputText.trim()}
            >
              <FaMagic />
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

export default LegalAIChat;
