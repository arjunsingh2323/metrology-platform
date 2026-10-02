import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  ShieldCheck, 
  HelpCircle,
  RotateCcw,
  CornerDownLeft
} from 'lucide-react';
import { 
  askMetrologyAssistant, 
  SUGGESTED_QUESTIONS 
} from '../lib/ai/metrologyAi.service';

const MetrologyAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Welcome to the **Metrik Legal Metrology AI Assistant**. 

I am authorized to assist you with:
- **Maximum Permissible Error (MPE)** calculations for Class I, II, III, and IIII weighing instruments.
- **Measurement Uncertainty Evaluation** per ISO/IEC Guide 98-3 (GUM).
- **Statutory Provisions & Penalties** under the Legal Metrology Act, 2009 & General Rules, 2011.
- **Platform Navigation & Inspection Workflows** for inspectors, merchants, and citizens.

Select a suggested prompt below or type your technical or legal metrology query.`,
      source: '[Ministry of Consumer Affairs - Legal Metrology Reference Archive]',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query || !query.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askMetrologyAssistant(query.trim());
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        source: response.source,
        sourceType: response.sourceType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: 'An error occurred while consulting the Legal Metrology Knowledge Service. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: 'Conversation history reset. How may I assist you with Legal Metrology today?',
        source: '[Ministry of Consumer Affairs]',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={26} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Metrology AI Assistant</h1>
            <span className="badge badge-success" style={{ fontSize: '0.75rem', gap: '0.25rem' }}>
              <ShieldCheck size={12} /> Grounded Reference
            </span>
          </div>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
            AI-powered advisory for Legal Metrology Act 2009, MPE limits, and GUM measurement uncertainty.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="btn"
          style={{ fontSize: '0.8125rem', border: '1px solid var(--border-color)', gap: '0.375rem' }}
        >
          <RotateCcw size={14} /> Clear Chat
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q.prompt)}
            disabled={loading}
            style={{
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={12} color="var(--accent-primary)" />
            <span>{q.title}</span>
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div 
        className="glass-panel" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          background: 'var(--bg-secondary)'
        }}
      >
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Bubble */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {msg.content}
            </div>

            {/* Bubble Metadata & Citation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>{msg.timestamp}</span>
              {msg.source && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BookOpen size={10} /> {msg.source}
                  </span>
                </>
              )}
              {msg.role === 'assistant' && (
                <button
                  type="button"
                  onClick={() => handleCopy(msg.id, msg.content)}
                  title="Copy response"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  {copiedId === msg.id ? <Check size={12} color="var(--accent-success)" /> : <Copy size={12} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '0.5rem' }}>
            <Bot size={16} className="animate-spin" color="var(--accent-primary)" />
            <span>Consulting Legal Metrology Knowledge System...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about MPE tolerances, measurement uncertainty, statutory sections, or platform workflow..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '0 1.25rem', borderRadius: 'var(--radius-lg)', gap: '0.375rem' }}
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>

    </div>
  );
};

export default MetrologyAssistant;
