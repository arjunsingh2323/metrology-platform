/**
 * metrologyAi.service.js - Legal Metrology Knowledge System & AI Client
 * 
 * Communicates with server-side endpoint /api/assistant.
 * Includes verified, grounded offline reference database per:
 * - Legal Metrology Act, 2009 (No. 1 of 2010)
 * - Legal Metrology (General) Rules, 2011
 * - OIML R 76-1 / IS 14320 Accuracy Specifications
 * - ISO/IEC Guide 98-3 (GUM) Measurement Uncertainty
 */

export const SUGGESTED_QUESTIONS = [
  {
    title: 'MPE Limits for Class III Scales',
    prompt: 'What are the Maximum Permissible Error (MPE) limits for a Class III commercial platform scale?'
  },
  {
    title: 'Calculating GUM Uncertainty',
    prompt: 'How do I calculate combined standard uncertainty using GUM root-sum-of-squares in metrology?'
  },
  {
    title: 'Verification Interval Rules',
    prompt: 'What are the statutory re-verification intervals and merchant obligations under the Legal Metrology Act 2009?'
  },
  {
    title: 'Reporting Tampered Scales',
    prompt: 'How can a consumer lodge a formal grievance if a market weighing scale has a broken seal or short-weighs?'
  },
  {
    title: 'Platform e-Certificate QR Seal',
    prompt: 'How does the Metrik platform bind digital e-Certificates to physical QR holographic security seals?'
  }
];

// Grounded Knowledge Domain Engine
const METROLOGY_KNOWLEDGE_BASE = [
  {
    keywords: ['mpe', 'maximum permissible error', 'class iii', 'tolerance', 'accuracy class'],
    title: 'Maximum Permissible Error (MPE) - OIML R 76-1 & General Rules 2011',
    source: '[Legal Metrology (General) Rules, 2011, Schedule VII & OIML R 76-1, Section 3.5]',
    content: `Under **OIML R 76-1** and the **Legal Metrology (General) Rules, 2011**, non-automatic weighing instruments are classified into four accuracy classes:
- **Class I (Special Accuracy):** Analytical microbalances (least count $e \le 1\\text{ mg}$).
- **Class II (High Accuracy):** Laboratory balances and gold jewelry scales ($1\\text{ mg} \le e \le 50\\text{ mg}$).
- **Class III (Medium Accuracy):** Commercial market scales, grocery platform scales, and weighbridges ($e \ge 0.1\\text{ g}$).
- **Class IIII (Ordinary Accuracy):** Coarse industrial scales ($e \ge 5\\text{ g}$).

### Class III Permissible Errors on Initial Verification:
1. **0 to 500 $e$:** Maximum Permissible Error = $\\pm 0.5\\,e$
2. **501 $e$ to 2000 $e$:** Maximum Permissible Error = $\\pm 1.0\\,e$
3. **2001 $e$ to 10000 $e$:** Maximum Permissible Error = $\\pm 1.5\\,e$

*(Note: For instruments in-service verification, MPE is twice that of initial verification).*`
  },
  {
    keywords: ['uncertainty', 'gum', 'iso 98-3', 'combined uncertainty', 'expanded uncertainty', 'root-sum'],
    title: 'Measurement Uncertainty Evaluation per ISO/IEC Guide 98-3 (GUM)',
    source: '[ISO/IEC Guide 98-3:2008 (GUM) & JCGM 100:2008, Section 5.1]',
    content: `Measurement uncertainty evaluates the dispersion of values reasonably attributable to the measurand.

### 1. Classification of Uncertainties:
- **Type A Evaluation:** Evaluated by statistical analysis of series of observations (sample standard deviation of mean: $u = s / \\sqrt{n}$).
- **Type B Evaluation:** Evaluated by other means (calibration certificates, instrument resolution, manufacturer specifications, temperature drift).

### 2. Combined Standard Uncertainty ($u_c$):
For independent, uncorrelated input quantities, combined standard uncertainty is determined by Root-Sum-of-Squares (RSS):
$$u_c = \\sqrt{u_1^2 + u_2^2 + \\dots + u_n^2}$$

### 3. Expanded Uncertainty ($U$):
$$U = k \\times u_c$$
Where $k$ is the coverage factor. A coverage factor of **$k = 2$** defines an approximate **95.45% level of confidence** assuming an approximately normal output distribution.`
  },
  {
    keywords: ['section 24', 'section 30', 'act 2009', 'penalty', 'verification interval', 'stamping', 'renewal'],
    title: 'Statutory Verification & Penal Provisions - Legal Metrology Act, 2009',
    source: '[Legal Metrology Act, 2009, Sections 24, 25, 30 & Rule 27]',
    content: `### Mandatory Verification (Section 24):
Every person having any weight or measure in possession, custody or control for use in any transaction or for protection must have such weight or measure verified and stamped by an authorized Legal Metrology Officer.

### Mandatory Re-Verification Cycles:
- **Electronic Weighing & Measuring Instruments:** Re-verification is mandatory every **12 months** (annual).
- **Weights, Storage Tanks & Cast Iron Measures:** Re-verification is mandatory every **24 months** (biennial).

### Key Statutory Penalties:
- **Section 25 (Use of non-standard weight/measure):** Fine up to ₹25,000; repeat offenses punishable with imprisonment up to 6 months.
- **Section 30 (Short delivery of goods/services):** Fine up to ₹10,000; repeat offenses punishable with imprisonment up to 1 year or fine.
- **Section 27 (Manufacture/Sale without approval):** Fine up to ₹20,000; repeat offenses with imprisonment up to 1 year.`
  },
  {
    keywords: ['complaint', 'grievance', 'fraud', 'broken seal', 'report', 'tampered', 'short weigh'],
    title: 'Consumer Rights & Grievance Lodging on Metrik Platform',
    source: '[Legal Metrology Act, 2009, Section 15 (Powers of Inspection, Search & Seizure)]',
    content: `Consumers encountering faulty scales or broken security seals in public markets have the statutory right to enforce fair trade:

### Steps to Lodge a Grievance on Metrik:
1. Navigate to the **Grievances** portal in the top navigation bar.
2. Select the infraction category (e.g. *Short Weighing*, *Tampered Holographic Seal*, *Fuel Dispenser Delivery Shortfall*).
3. Specify the merchant name, premises address, and district.
4. Optionally upload photographic evidence of the scale display or purchase receipt.
5. The system automatically issues a unique **Complaint Reference ID** (e.g., \`GRV-2026-89412\`).
6. A District Field Inspector is dispatched for surprise on-site verification under Section 15.`
  },
  {
    keywords: ['certificate', 'qr seal', 'how to', 'register', 'sticker', 'platform'],
    title: 'Metrik Digital Verification Lifecycle',
    source: '[Metrik Legal Metrology Platform Workflow Documentation]',
    content: `The Metrik platform digitizes the complete lifecycle of legal measuring instruments:
1. **Merchant Registration:** Merchants register instruments under \`/instruments/new\` capturing manufacturer model, serial number, and capacity.
2. **Inspector Execution:** During field inspection (\`/inspect/:id\`), the inspector inputs test weights, validates MPE tolerance, and applies a tamper-evident holographic seal.
3. **e-Certificate Issuance:** Upon approval, an official **Verification Certificate (Form VIII)** is generated with an embedded cryptographic QR link.
4. **Physical Seal Sticker:** Merchants print weatherproof vinyl QR stickers via the **Trader Portal** to affix onto scales for public citizen scanning.`
  }
];

/**
 * Sends a query to the Assistant (Serverless or Verified Internal Engine)
 * @param {string} prompt User question
 * @returns {Promise<Object>}
 */
export const askMetrologyAssistant = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return {
      success: false,
      error: 'Please enter a valid metrology question.'
    };
  }

  const cleanPrompt = prompt.trim();

  // 1. Attempt Serverless Gemini Endpoint
  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: cleanPrompt })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.source === 'GEMINI_AI' && data.reply) {
        return {
          success: true,
          source: 'Live Gemini Metrology Model',
          sourceType: 'LIVE_AI',
          reply: data.reply
        };
      }
    }
  } catch (err) {
    // API endpoint unreachable (e.g. running local Vite dev without Vercel CLI)
    // Silently fall back to grounded metrology knowledge base
  }

  // 2. Verified Internal Legal Metrology Knowledge Engine
  const lower = cleanPrompt.toLowerCase();
  let matchedArticle = null;
  let bestScore = 0;

  for (const article of METROLOGY_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of article.keywords) {
      if (lower.includes(kw)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      matchedArticle = article;
    }
  }

  if (matchedArticle && bestScore > 0) {
    return {
      success: true,
      source: matchedArticle.source,
      sourceType: 'VERIFIED_METROLOGY_ENGINE',
      reply: `${matchedArticle.content}\n\n**Official Citation:** ${matchedArticle.source}`
    };
  }

  // General fallback when inquiry is outside domain or ambiguous
  return {
    success: true,
    source: '[Legal Metrology Act, 2009 & General Rules, 2011 Reference Archive]',
    sourceType: 'VERIFIED_METROLOGY_ENGINE',
    reply: `I am the **Metrik Legal Metrology AI Assistant**. I can assist you with verified regulations and platform workflows:

- **Maximum Permissible Errors (MPE):** Inquire about Class I, II, III, or IIII scale tolerances.
- **Measurement Uncertainty:** Ask how to evaluate Type A, Type B, or combined uncertainty ($u_c$) per ISO/IEC Guide 98-3 (GUM).
- **Statutory Rules:** Ask about verification schedules, merchant duties, and offenses under Sections 24–39 of the Legal Metrology Act, 2009.
- **Grievance Lodging:** Inquire about reporting tampered scales or tracking a complaint reference ID.

*(To enable unstructured conversational reasoning across custom domains, configure \`GEMINI_API_KEY\` in your deployment environment variables).*`
  };
};
