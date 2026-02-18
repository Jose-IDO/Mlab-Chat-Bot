const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ========================
// MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());

// ========================
// AI CONFIGURATION
// ========================
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant';
const HF_MODEL = 'meta-llama/Llama-3.2-3B-Instruct';

// Enhanced system prompt for mLab support
const SYSTEM_PROMPT = `You are the mLab Smart Assistant. Help youth with CodeTribe Academy (6-month coding bootcamp), locations (Tshwane, Polokwane, Galeshewe), eligibility (18-35, unemployed, SA citizens), applications (via mlab.co.za), and events. Be professional, encouraging, concise (under 250 words). All programmes are FREE. Contact: info@mlab.co.za, +27 11 123 4567.`;

// Comprehensive mLab Knowledge Base
const MLAB_KNOWLEDGE_BASE = `
=== ORGANISATION OVERVIEW ===

Organisation Name: mLab (Mobile Applications Laboratory NPC)

Type:
- Non-Profit Company (NPC) with Public Benefit Organisation (PBO) status
- Level 1 B-BBEE Skills Development and Enterprise Supplier Development Provider

Mission:
mLab prepares innovators and entrepreneurs to maximise opportunities in the digital economy through skills training, startup support, and technology development.

Founded: 2011

Founding Partners:
- World Bank (infoDev)
- Department of Science and Innovation (DSI)
- Council for Scientific and Industrial Research (CSIR)
- The Innovation Hub

Focus Areas:
- Digital skills development
- Youth empowerment
- Startup incubation and acceleration
- Social impact technology solutions

Locations:
Primary Location: South Africa

Main Office (Headquarters):
- U8, Enterprise Building, The Innovation Hub
- Mark Shuttleworth Street, Tshwane (Pretoria), 0087
- Gauteng, South Africa

Additional Offices/Labs:
- Limpopo
- Northern Cape

CodeTribe Academy Campuses (Training Centres):
- Tshwane
- Polokwane
- Galeshewe

Target Beneficiaries:
Youth, graduates, entrepreneurs, startups, and previously disadvantaged communities.

=== CODETRIBE ACADEMY (SKILLS DEVELOPMENT PROGRAMME) ===

Programme Name: CodeTribe Academy

Purpose:
Train young South Africans to become software developers and technology professionals.

Programme Duration: 6 months

Training Includes:
- Web development
- Android development
- iOS development
- Cloud computing
- Agile/Scrum project management
- Portfolio development
- Workplace readiness
- 4IR technologies

Outcome:
Participants gain practical experience and build a portfolio of real software solutions to improve employment or self-employment opportunities.

Accreditation:
Aligned with industry needs and supported by business partners.

=== CODETRIBE ACADEMY ELIGIBILITY REQUIREMENTS ===

Applicants must:
- Be a South African citizen with a valid ID
- Be unemployed youth or graduate
- Be between 18 and 35 years old
- Live near a CodeTribe campus (Tshwane, Polokwane, or Galeshewe)
- Have no criminal record
- Have an IT qualification (minimum NQF Level 5)

Acceptable Qualifications:
- Diploma in IT
- Degree or BTech in IT
- BCom Informatics / Information Systems
- Mathematics, Statistics, or related field

Additional Notes:
- Final-year students doing work-integrated learning may apply
- Females and persons with disabilities are encouraged to apply
- Applicants with only Grade 12 are rarely accepted unless they have a strong development portfolio

Application Result:
If you do not receive feedback within 1 month after applying, consider the application unsuccessful.

=== ENTERPRISE DEVELOPMENT AND STARTUP SUPPORT ===

Programme: Enterprise Development and Startup Support

Purpose:
Support early-stage tech startups to grow sustainable businesses.

Support Provided:
- Mentorship
- Business gap analysis
- Go-to-market strategy
- Networking opportunities
- Grant seed funding
- MVP (Minimum Viable Product) development assistance
- Access to office space and equipment

Startup Eligibility:
- Business registered with CIPC
- Business younger than 5 years
- Demonstrated market validation or research
- Annual turnover below R1 million (pre-VAT)

Preference Given To:
- Youth-owned businesses
- Female-owned businesses
- B-BBEE Level 1 to Level 4 businesses
- Startups with more than one team member

Application Process:
Applications are competitive. Only shortlisted applicants are contacted.
If no response is received within 2 months after closing date, the application was unsuccessful.

=== TECH ECOSYSTEM WORKSHOPS AND TRAINING ===

Programme: Tech Ecosystem Workshops and Training

Purpose:
Stimulate youth innovation ecosystems and digital literacy.

Activities:
- Digital literacy training
- Introduction to computers and internet
- Website development workshops
- No-code development platforms
- STEM engagement activities
- 4IR awareness workshops

Target Groups:
- School learners
- Youth not in education, employment, or training (NEETs)
- Community groups

=== TECH SOLUTIONS / INNOVATION LAB ===

Programme: Tech Solutions / Innovation Lab

Purpose:
Co-create technology solutions addressing social and economic challenges.

Activities:
mLab collaborates with partners and startups to develop digital systems with social impact.

Example Projects:
- Cancer awareness solutions
- Water quality monitoring systems
- Agriculture technology platforms
- Gender-based violence reporting solutions
- Youth employment support applications

Benefit:
Startups and graduates gain real project experience and exposure to clients while being mentored by mLab.

=== FREQUENTLY ASKED QUESTIONS ===

Q: Do I need coding experience before applying?
A: No. You do not need prior programming knowledge. However, you must meet the qualification and eligibility requirements.

Q: Is the programme free?
A: Yes! All mLab programmes are completely FREE. Availability depends on open application calls and partner sponsorship.

Q: How do I apply?
A: Applications open periodically. When applications are open, candidates must apply through the official mLab application call. If applications are closed, you should register to be notified when they open.

Q: How long does the programme last?
A: The CodeTribe Academy programme lasts 6 months.

Q: Where are the campuses located?
A: CodeTribe campuses are located in Tshwane, Polokwane, and Galeshewe.

Q: What happens after completing the programme?
A: Graduates leave with a development portfolio, practical experience, and improved employment or self-employment opportunities.

Q: Can startups apply?
A: Yes. mLab provides startup incubation and accelerator support for early-stage tech businesses.

Q: Does mLab guarantee a job?
A: No. mLab provides skills, experience, and support, but employment is not guaranteed.

=== CONTACT INFORMATION ===

Main Office (Headquarters):
Address: U8, Enterprise Building, The Innovation Hub, Mark Shuttleworth Street, Tshwane (Pretoria), 0087, Gauteng, South Africa
Phone: +27 11 123 4567
Email: info@mlab.co.za
Website: https://mlab.co.za/

Training Centres:
- Tshwane
- Polokwane
- Galeshewe

Note: All programmes are FREE.
`;

// ========================
// EMAIL CONFIGURATION
// ========================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: true,
  port: 465
});

// ========================
// HELPER: Parse multiple recipients from .env
// Supports comma-separated list, e.g.:
//   SUPPORT_EMAIL=support@mlab.co.za,manager@mlab.co.za,admin@mlab.co.za
//   CC_EMAIL=director@mlab.co.za,lead@mlab.co.za        (optional)
//   BCC_EMAIL=archive@mlab.co.za                         (optional)
// ========================
function parseRecipients(envValue, fallback = '') {
  const raw = envValue || fallback;
  if (!raw.trim()) return '';
  return raw
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0)
    .join(', ');
}

// ========================
// DATABASE CONFIGURATION
// ========================
const DB_FILE = path.join(__dirname, 'escalations.json');

async function initDatabase() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ escalations: [] }, null, 2));
    console.log('📄 Created escalations database file');
  }
}

async function getEscalations() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data).escalations;
  } catch (error) {
    console.error('Error reading database:', error);
    return [];
  }
}

async function saveEscalation(escalationData) {
  try {
    const escalations = await getEscalations();

    const newEscalation = {
      id: Date.now().toString(),
      ...escalationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    escalations.push(newEscalation);

    await fs.writeFile(DB_FILE, JSON.stringify({ escalations }, null, 2));

    console.log('💾 Escalation saved to database:', newEscalation.id);
    return newEscalation;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

// ========================
// AI FUNCTIONS
// ========================
async function callGroqAPI(prompt, context) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set in environment variables');
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  const knowledgeContext = context && context.trim() ? context : MLAB_KNOWLEDGE_BASE;

  messages.push({
    role: 'system',
    content: `KNOWLEDGE BASE:\n${knowledgeContext}\n\nUse this information to answer the user's question.`
  });

  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 500,
      top_p: 0.9,
      stream: false
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function callHuggingFaceAPI(prompt, context) {
  if (!HF_API_KEY) {
    throw new Error('HF_API_KEY not set. Add HF_API_KEY to .env file and restart the server.');
  }

  const knowledgeContext = context && context.trim() ? context : MLAB_KNOWLEDGE_BASE;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `KNOWLEDGE BASE:\n${knowledgeContext}\n\nUse this information to answer the user's question.` },
    { role: 'user', content: prompt }
  ];

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.3,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 403) {
      throw new Error(`Hugging Face requires PRO subscription with "Inference Providers" permission. Error: ${errorText}`);
    }
    throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  } else {
    throw new Error('Unexpected response format from Hugging Face API');
  }
}

function generateSmartFallback(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('programme') || lowerPrompt.includes('program') || lowerPrompt.includes('codetribe')) {
    return "mLab offers CodeTribe Academy, a FREE 6-month coding bootcamp in Tshwane, Polokwane, and Galeshewe. Which programme interests you?";
  } else if (lowerPrompt.includes('contact') || lowerPrompt.includes('reach') || lowerPrompt.includes('email') || lowerPrompt.includes('phone')) {
    return "Contact mLab at +27 11 123 4567 or email info@mlab.co.za. Visit mlab.co.za to apply!";
  } else if (lowerPrompt.includes('apply') || lowerPrompt.includes('join') || lowerPrompt.includes('eligib')) {
    return "CodeTribe requires SA citizens aged 18-35, unemployed, with IT qualification (NQF Level 5+). Must live near Tshwane, Polokwane, or Galeshewe campus.";
  } else if (lowerPrompt.includes('location') || lowerPrompt.includes('campus') || lowerPrompt.includes('where')) {
    return "CodeTribe Academy has campuses in Tshwane, Polokwane, and Galeshewe. All programmes are FREE!";
  } else if (lowerPrompt.includes('free') || lowerPrompt.includes('cost') || lowerPrompt.includes('price')) {
    return "Yes! All mLab programmes are completely FREE. Apply at mlab.co.za or call +27 11 123 4567.";
  } else if (lowerPrompt.includes('startup') || lowerPrompt.includes('business') || lowerPrompt.includes('entrepreneur')) {
    return "mLab supports startups under 5 years old with mentorship, funding, and MVP development. Contact info@mlab.co.za for details.";
  } else {
    return "I'm here to help with mLab programmes, applications, and startup support. What would you like to know?";
  }
}

// ========================
// EMAIL FUNCTIONS
// ========================
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email service connected successfully');
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message);
    console.log('⚠️  Server will run but emails may not send');
    console.log('💡 This is often a network/firewall issue, emails may still work when you try to send them');
  }
}

async function sendEscalationEmail(escalationData) {
  const { fullName, email, phone, message, category, id } = escalationData;

  // ── Multi-recipient support ──────────────────────────────────────────────
  // Set in .env as comma-separated lists:
  //   SUPPORT_EMAIL=support@mlab.co.za,manager@mlab.co.za,admin@mlab.co.za
  //   CC_EMAIL=director@mlab.co.za         (optional)
  //   BCC_EMAIL=archive@mlab.co.za         (optional)
  const toRecipients  = parseRecipients(process.env.SUPPORT_EMAIL, 'support@mlab.co.za');
  const ccRecipients  = parseRecipients(process.env.CC_EMAIL);
  const bccRecipients = parseRecipients(process.env.BCC_EMAIL);
  // ────────────────────────────────────────────────────────────────────────

  const mailOptions = {
    from: `"mLab AI Support" <${process.env.EMAIL_USER}>`,
    to: toRecipients,
    ...(ccRecipients  && { cc: ccRecipients }),
    ...(bccRecipients && { bcc: bccRecipients }),
    subject: `🚨 New Escalation Request - ${category} [ID: ${id}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #A5CD39 0%, #94b833 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .info-row {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          .label {
            font-weight: bold;
            color: #4A6D76;
            margin-bottom: 5px;
          }
          .value {
            color: #333;
          }
          .priority-badge {
            display: inline-block;
            padding: 5px 15px;
            background-color: #ff6b6b;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .ticket-id {
            display: inline-block;
            padding: 8px 15px;
            background-color: #4A6D76;
            color: white;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🆘 New Support Escalation</h1>
            <p style="margin: 10px 0 0 0;">A customer needs immediate assistance</p>
          </div>

          <div class="content">
            <div class="info-row">
              <div class="label">🎫 Ticket ID:</div>
              <div class="value"><span class="ticket-id">${id}</span></div>
            </div>

            <div class="info-row">
              <div class="label">📋 Category:</div>
              <div class="value"><span class="priority-badge">${category}</span></div>
            </div>

            <div class="info-row">
              <div class="label">👤 Full Name:</div>
              <div class="value">${fullName}</div>
            </div>

            <div class="info-row">
              <div class="label">📧 Email Address:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>

            ${phone ? `
            <div class="info-row">
              <div class="label">📱 Phone Number:</div>
              <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            ` : ''}

            <div class="info-row">
              <div class="label">💬 Customer Message:</div>
              <div class="value" style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
                ${message}
              </div>
            </div>

            <div class="info-row" style="border-bottom: none;">
              <div class="label">⏰ Submitted At:</div>
              <div class="value">${new Date().toLocaleString('en-ZA', {
                timeZone: 'Africa/Johannesburg',
                dateStyle: 'full',
                timeStyle: 'long'
              })}</div>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated notification from mLab AI Support System</p>
            <p>Please respond to the customer within 24 hours</p>
            <p style="margin-top: 10px; font-size: 10px;">Ticket ID: ${id}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Escalation email sent successfully:', info.messageId);
    console.log(`   ➡ To:  ${toRecipients}`);
    if (ccRecipients)  console.log(`   ➡ CC:  ${ccRecipients}`);
    if (bccRecipients) console.log(`   ➡ BCC: ${bccRecipients}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending escalation email:', error);
    throw error;
  }
}

async function sendConfirmationEmail(escalationData) {
  const { fullName, email, id } = escalationData;

  const mailOptions = {
    from: `"mLab AI Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Your Support Request Has Been Received',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #A5CD39 0%, #94b833 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .ticket-id {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4A6D76;
            color: white;
            border-radius: 5px;
            font-family: monospace;
            font-size: 16px;
            margin: 15px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Request Received</h1>
            <p style="margin: 10px 0 0 0;">We're on it!</p>
          </div>

          <div class="content">
            <p>Dear ${fullName},</p>

            <p>Thank you for contacting mLab Support. We have received your escalation request and our team will review it shortly.</p>

            <p><strong>Your Ticket ID:</strong></p>
            <div style="text-align: center;">
              <span class="ticket-id">${id}</span>
            </div>

            <p>Please keep this ticket ID for your records. You can reference it in any follow-up communications.</p>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review your request</li>
              <li>You will receive a response within 24 hours</li>
              <li>We will contact you via email or phone</li>
            </ul>

            <p>If you have any urgent questions, please don't hesitate to reach out to us at
            <a href="mailto:info@mlab.co.za">info@mlab.co.za</a> or call
            <a href="tel:+27111234567">+27 11 123 4567</a>.</p>

            <p>Best regards,<br><strong>mLab Support Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated confirmation from mLab AI Support System</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Confirmation email sent to user:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️  Could not send confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}

// ========================
// API ENDPOINTS - AI CHAT
// ========================
app.post('/api/generate', async (req, res) => {
  const start = Date.now();

  try {
    const { prompt, context = '', provider = 'auto' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('\n🚀 New request:', prompt.substring(0, 80) + '...');
    console.log('🎯 Provider preference:', provider);

    let text = '';
    let usedProvider = '';

    if (provider === 'huggingface') {
      text = await callHuggingFaceAPI(prompt, context);
      usedProvider = `Hugging Face (${HF_MODEL})`;
      console.log('✅ Hugging Face succeeded!');
    } else if (provider === 'groq') {
      text = await callGroqAPI(prompt, context);
      usedProvider = `Groq (${GROQ_MODEL})`;
      console.log('✅ Groq succeeded!');
    } else {
      // Auto mode: try HF first, fall back to Groq
      try {
        if (HF_API_KEY) {
          console.log('📤 Trying Hugging Face Router API...');
          text = await callHuggingFaceAPI(prompt, context);
          usedProvider = `Hugging Face (${HF_MODEL})`;
          console.log('✅ Hugging Face succeeded!');
        } else {
          throw new Error('HF_API_KEY not configured, falling back to Groq');
        }
      } catch (hfError) {
        console.log('❌ Hugging Face failed:', hfError.message);
        console.log('🔄 Falling back to Groq...');
        text = await callGroqAPI(prompt, context);
        usedProvider = `Groq (${GROQ_MODEL}) - Fallback`;
        console.log('✅ Groq fallback succeeded!');
      }
    }

    const latency = Date.now() - start;

    res.json({ text, latency, provider: usedProvider, success: true });

    console.log(`✅ Response sent in ${latency}ms`);
    console.log(`📝 Preview: ${text.substring(0, 100)}...\n`);

  } catch (error) {
    console.error('❌ All providers failed:', error.message);

    const fallbackText = generateSmartFallback(req.body.prompt);

    res.json({
      text: fallbackText,
      latency: Date.now() - start,
      provider: 'Smart Fallback',
      success: true,
      warning: 'API providers unavailable, using fallback response'
    });
  }
});

// Welcome message endpoint
app.get('/api/welcome', (req, res) => {
  res.json({
    message: "👋 Welcome to mLab! I'm here to help with CodeTribe Academy, our FREE 6-month coding bootcamp. How can I assist you today?",
    quickActions: [
      "Tell me about CodeTribe Academy",
      "Where are the campuses?",
      "Am I eligible to apply?",
      "How do I apply?"
    ]
  });
});

// ========================
// API ENDPOINTS - ESCALATION
// ========================
app.post('/api/escalate', async (req, res) => {
  try {
    const escalationData = req.body;

    if (!escalationData.fullName || !escalationData.email || !escalationData.message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const savedEscalation = await saveEscalation(escalationData);

    let emailResult;
    try {
      emailResult = await sendEscalationEmail(savedEscalation);
    } catch (emailError) {
      console.error('Email sending failed, but escalation is saved:', emailError);
    }

    // Fire-and-forget confirmation to the user
    sendConfirmationEmail(savedEscalation).catch(err => {
      console.log('Confirmation email failed:', err.message);
    });

    res.json({
      success: true,
      message: 'Escalation submitted successfully',
      ticketId: savedEscalation.id,
      emailSent: emailResult?.success || false
    });

  } catch (error) {
    console.error('❌ Escalation error:', error);
    res.status(500).json({ success: false, error: 'Failed to process escalation request' });
  }
});

// Get all escalations
app.get('/api/escalations', async (req, res) => {
  try {
    const escalations = await getEscalations();
    res.json({ success: true, count: escalations.length, escalations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve escalations' });
  }
});

// Get single escalation by ID
app.get('/api/escalations/:id', async (req, res) => {
  try {
    const escalations = await getEscalations();
    const escalation = escalations.find(e => e.id === req.params.id);

    if (!escalation) {
      return res.status(404).json({ success: false, error: 'Escalation not found' });
    }

    res.json({ success: true, escalation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve escalation' });
  }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const escalations = await getEscalations();

    const stats = {
      total: escalations.length,
      pending: escalations.filter(e => e.status === 'pending').length,
      resolved: escalations.filter(e => e.status === 'resolved').length,
      today: escalations.filter(e => {
        const today = new Date().toDateString();
        return new Date(e.createdAt).toDateString() === today;
      }).length
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to calculate statistics' });
  }
});

// ========================
// GENERAL ENDPOINTS
// ========================
app.get('/api/health', (req, res) => {
  const toRecipients  = parseRecipients(process.env.SUPPORT_EMAIL, 'support@mlab.co.za');
  const ccRecipients  = parseRecipients(process.env.CC_EMAIL);
  const bccRecipients = parseRecipients(process.env.BCC_EMAIL);

  res.json({
    status: 'OK',
    message: 'mLab AI Support Backend - Dual Provider Ready',
    timestamp: new Date().toISOString(),
    providers: {
      groq: {
        model: GROQ_MODEL,
        status: GROQ_API_KEY ? 'active' : 'not configured',
        cost: 'FREE'
      },
      huggingface: {
        model: HF_MODEL,
        status: HF_API_KEY ? 'active' : 'not configured',
        endpoint: 'router.huggingface.co (requires PRO)',
        cost: 'FREE'
      }
    },
    knowledgeBase: 'Comprehensive mLab Information Loaded',
    emailConfigured: !!process.env.EMAIL_USER,
    emailRecipients: {
      to:  toRecipients  || '(none)',
      cc:  ccRecipients  || '(none)',
      bcc: bccRecipients || '(none)'
    },
    recommendation: GROQ_API_KEY
      ? 'Groq is configured and recommended (free)'
      : 'Configure GROQ_API_KEY for best experience'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    emailConfigured: !!process.env.EMAIL_USER
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'mLab AI Chatbot Backend - Complete System',
    status: 'Running',
    features: [
      'AI Chat with Groq & Hugging Face',
      'Email Escalation System (multi-recipient support)',
      'Ticket Management',
      'Comprehensive Knowledge Base',
      'Auto-fallback between providers'
    ],
    aiProviders: [
      'Groq (Llama 3.1 8B) - FREE',
      'Hugging Face Router (Llama 3.2 3B) - Requires PRO'
    ],
    endpoints: {
      ai: {
        generate: 'POST /api/generate',
        welcome: 'GET /api/welcome'
      },
      escalation: {
        create: 'POST /api/escalate',
        getAll: 'GET /api/escalations',
        getOne: 'GET /api/escalations/:id',
        stats: 'GET /api/stats'
      },
      system: {
        health: 'GET /api/health',
        healthAlt: 'GET /health'
      }
    }
  });
});

// ========================
// START SERVER
// ========================
async function startServer() {
  await initDatabase();
  await verifyEmailConfig();

  app.listen(PORT, () => {
    const toRecipients  = parseRecipients(process.env.SUPPORT_EMAIL, 'support@mlab.co.za');
    const ccRecipients  = parseRecipients(process.env.CC_EMAIL);
    const bccRecipients = parseRecipients(process.env.BCC_EMAIL);

    console.log('\n' + '='.repeat(80));
    console.log('🚀 mLab AI Support Backend - COMPLETE SYSTEM READY!');
    console.log('='.repeat(80));
    console.log(`🌐 Server URL:       http://localhost:${PORT}`);
    console.log('='.repeat(80));

    console.log('\n🤖 AI CHAT ENDPOINTS:');
    console.log(`   📡 Generate:      POST http://localhost:${PORT}/api/generate`);
    console.log(`   👋 Welcome:       GET  http://localhost:${PORT}/api/welcome`);

    console.log('\n📧 ESCALATION ENDPOINTS:');
    console.log(`   ✉️  Create:        POST http://localhost:${PORT}/api/escalate`);
    console.log(`   📋 Get All:       GET  http://localhost:${PORT}/api/escalations`);
    console.log(`   🎫 Get One:       GET  http://localhost:${PORT}/api/escalations/:id`);
    console.log(`   📊 Statistics:    GET  http://localhost:${PORT}/api/stats`);

    console.log('\n🏥 SYSTEM ENDPOINTS:');
    console.log(`   ✅ Health:        GET  http://localhost:${PORT}/api/health`);
    console.log(`   ✅ Health Alt:    GET  http://localhost:${PORT}/health`);

    console.log('\n' + '='.repeat(80));
    console.log('🤖 AI PROVIDERS:');
    if (GROQ_API_KEY) {
      console.log(`   ✅ Groq:          ${GROQ_MODEL} (FREE)`);
    } else {
      console.log('   ❌ Groq:          Not configured - add GROQ_API_KEY to .env');
    }

    if (HF_API_KEY) {
      console.log(`   ✅ Hugging Face:  ${HF_MODEL} (PRO required)`);
    } else {
      console.log('   ⚠️  Hugging Face:  Not configured (optional)');
    }

    console.log('\n📧 EMAIL SERVICE:');
    if (process.env.EMAIL_USER) {
      console.log(`   ✅ Sender:        ${process.env.EMAIL_USER}`);
      console.log(`   📬 To:            ${toRecipients}`);
      if (ccRecipients)  console.log(`   📬 CC:            ${ccRecipients}`);
      if (bccRecipients) console.log(`   📬 BCC:           ${bccRecipients}`);
    } else {
      console.log('   ❌ Not configured - add EMAIL_USER and EMAIL_PASSWORD to .env');
    }

    console.log('\n💾 DATABASE:');
    console.log(`   📄 File:          ${DB_FILE}`);

    console.log('\n📚 FEATURES:');
    console.log('   ✅ AI-powered chat responses');
    console.log('   ✅ Email escalation system (multi-recipient: To / CC / BCC)');
    console.log('   ✅ Ticket tracking & management');
    console.log('   ✅ Comprehensive mLab knowledge base');
    console.log('   ✅ Auto-fallback between AI providers');
    console.log('   ✅ Smart responses when APIs unavailable');
    console.log('   ✅ SSL certificate handling for email');

    console.log('\n' + '='.repeat(80));

    if (!GROQ_API_KEY && !HF_API_KEY) {
      console.log('\n⚠️  WARNING: No AI API keys configured!');
      console.log('   Add at least GROQ_API_KEY to .env file');
      console.log('   Get Groq key: https://console.groq.com (FREE)');
    }

    if (!process.env.EMAIL_USER) {
      console.log('\n⚠️  WARNING: Email not configured!');
      console.log('   Add EMAIL_USER and EMAIL_PASSWORD to .env file');
    }

    console.log('\n⏳ System ready - Waiting for requests...\n');
  });
}

startServer();