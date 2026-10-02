/**
 * api/assistant.js - Vercel Serverless Function for Metrology AI Assistant
 * 
 * Secure server-side endpoint. Keeps GEMINI_API_KEY strictly on the server.
 * Never exposes credentials to client bundles.
 */

export default async function handler(req, res) {
  // Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { prompt, conversationHistory = [] } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Valid prompt string is required.' });
    }

    // Input sanitization and bounds check
    const sanitizedPrompt = prompt.trim().slice(0, 2000);

    // Read server-side secret (Never prefixed with VITE_)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        configured: false,
        source: 'INTERNAL_METROLOGY_ENGINE',
        message: 'GEMINI_API_KEY is not configured in server environment variables. Please provide your query to the internal Legal Metrology Reference Engine.',
        prompt: sanitizedPrompt
      });
    }

    // Call official Gemini REST API from server side
    const systemPrompt = `You are the Official Legal Metrology AI Assistant for the Metrik Platform (Ministry of Consumer Affairs).
Your task is to provide accurate, grounded, authoritative information regarding:
1. Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011.
2. Verification schedules, Maximum Permissible Error (MPE) thresholds, and accuracy classes (Class I, II, III, IIII) per OIML R 76-1 / IS 14320.
3. Measurement uncertainty evaluation per ISO/IEC Guide 98-3 (GUM).
4. Practical guidance on using the Metrik platform (registering instruments, conducting field inspections, generating e-Certificates, filing citizen complaints).

STRICT RULES:
- Always cite the relevant legal section or technical standard (e.g. [Legal Metrology Act 2009, Sec 24] or [OIML R 76-1 Table 6]).
- Never invent citations, standards, or penal amounts.
- If a question cannot be verified from legal metrology standards, explicitly state: "This question cannot be verified against current Legal Metrology reference statutes."
- Keep your answers structured, professional, and concise.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Question:\n${sanitizedPrompt}` }]
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API server error:', errorText);
      return res.status(200).json({
        configured: true,
        source: 'FALLBACK_DUE_TO_API_LIMIT',
        error: `AI provider error (${response.status}). Activating verified metrology knowledge engine.`,
        prompt: sanitizedPrompt
      });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return res.status(200).json({
        configured: true,
        source: 'FALLBACK_DUE_TO_EMPTY_RESPONSE',
        prompt: sanitizedPrompt
      });
    }

    return res.status(200).json({
      configured: true,
      source: 'GEMINI_AI',
      reply: candidateText
    });
  } catch (error) {
    console.error('Assistant serverless exception:', error);
    return res.status(500).json({
      error: 'Internal assistant service error.',
      details: error.message
    });
  }
}
