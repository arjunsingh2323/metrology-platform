import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { 
  askMetrologyAssistant, 
  SUGGESTED_QUESTIONS 
} from '../lib/ai/metrologyAi.service';

const MetrologyAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      role: 'assistant',
      content: 'Hello! I am your Legal Metrology AI assistant. Ask me anything about MPE tolerances, GUM measurement uncertainty, or platform workflows.',
      source: '[Legal Metrology Reference]'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (text) => {
    const query = typeof text === 'string' ? text : input;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askMetrologyAssistant(query.trim());
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          source: response.source
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to connect to the assistant service at this moment.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="metrology-floating-ai-container"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 99998,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Floating Popover Window */}
      {isOpen && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            width: '380px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            marginBottom: '0.75rem',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.875rem 1rem',
              background: 'var(--text-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Bot size={16} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>
                  Metrology AI Assistant
                </h4>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                  Grounded in OIML & Act 2009
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '0.375rem', padding: '0.5rem 0.75rem', overflowX: 'auto', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q.prompt)}
                disabled={loading}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                {q.title}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <div
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    lineHeight: '1.45',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.content}
                </div>
                {m.source && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', paddingLeft: '0.25rem' }}>
                    {m.source}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Bot size={14} className="animate-spin" color="var(--accent-primary)" />
                <span>Consulting Legal Metrology database...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              gap: '0.375rem'
            }}
          >
            <input
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask metrology question..."
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--accent-primary)',
          color: '#ffffff',
          padding: '0.625rem 1rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.8125rem',
          border: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <Bot size={18} />
        <span>Metrology AI</span>
      </button>
    </div>
  );
};

export default MetrologyAiAssistant;
