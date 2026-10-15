# CloseCraft Product Specification & Strategy Document

## 1. The Problem

CloseCraft addresses the critical gap between receiving an enquiry and turning it into a properly followed-up sales opportunity.

A prospective customer asks about a service, receives a price, and says, *“I’ll get back to you.”* The conversation then stalls. The business owner may forget to follow up, send a generic reminder, or struggle to identify what is preventing the customer from buying.

The specific problem is that interested prospects often have no assigned salesperson or agreed next action. Owners also lack a reliable view of which enquiries need attention right now.

### Customer Hypothesis & Validation
- **Target Segments:** Nigerian training providers and professional service businesses with clear offers and a regular flow of enquiries. Examples include:
  - Training academies & bootcamps (e.g. Digital Sales School / DSS)
  - Consulting and advisory practices
  - High-ticket digital marketing and design agencies
- **Prioritization:** Businesses that are already attracting consistent interest but struggle to manage, qualify, and close the conversations that follow.
- **Validation:** Customer interviews and paid pilot programs validate which specific segment experiences this revenue leakage most severely.

---

## 2. The Application Architecture

CloseCraft is engineered as a responsive, mobile-first web app:
- **Mobile Browser for Owners:** Business owners can triage hot deals, approve high-value follow-ups, and review health metrics from their mobile phone browser.
- **Desktop for Sales Teams:** Closers and sales reps work efficiently from laptops with lead lists, queue management, and deep conversation history.

### Lead Journey & Basic Workflow
1. **Enquiry Capture:** An enquiry from a website form, inbound email, or connected WhatsApp business channel automatically creates or updates a lead record.
2. **AI Assistance & Progressive Qualification:** The AI assistant answers approved questions and prompts the prospect with relevant qualification questions.
3. **Structured Need & Gap Detection:** CloseCraft records the customer’s stated requirements and explicitly flags missing details (such as unconfirmed budget, timeline, or decision-making authority) as `unknown`.
4. **Deterministic Next Action Assignment:** The system assigns an explicit next action (e.g. arranging a discovery call, sending an approved follow-up sequence, or escalating to a human).
5. **Human Takeover:** A human closer takes over immediately when the conversation requires judgement, complex objections, or pricing negotiation.
6. **Unified Sales Command Centre:** The dashboard displays each lead’s assigned owner, complete conversation history, and Next Best Action so owners know exactly who needs attention without switching apps.

### WhatsApp Business Integration
- Leverages the official Meta WhatsApp Business Platform API.
- Strict recipient opt-in and permission handling.
- Uses Meta-approved message templates for outbound outreach with clear, instant human escalation paths.

---

## 3. Teaching & Configuring the AI

Each business configures an approved information pack that acts as the single source of truth for the AI assistant:
- **Services & Pricing:** Canonical service tiers and verified prices. The assistant operates under strict guardrails and will never invent discounts or unauthorized promises.
- **Ideal Customer Profile (ICP) & Qualification Criteria:** Explicit criteria covering Need, Budget (e.g., minimum thresholds like ₦500k+ for enterprise vs ₦80k+ for academies), Authority, and Timing. Missing attributes remain explicitly marked as `unknown`.
- **Delivery Terms & FAQs:** Indexed in an isolated knowledge base via Retrieval-Augmented Generation (RAG) to ensure accurate, business-specific context.
- **Tone & Authorization Boundaries:** Owners declare the assistant's voice and explicit operating boundaries.
- **Escalation Rules:** If a prospect asks an unapproved question or requests custom concessions, the assistant gracefully transfers the lead to a human operator.
- **Follow-up Governance:** Automated follow-up sequences pause immediately upon customer reply, opt-out, or manual human intervention.
- **Multi-Tenant Security:** Strict isolation guarantees that no business can ever access another tenant's prompts, knowledge, leads, or records.

---

## 4. Key Business Owner Capabilities

A business owner using CloseCraft can:
1. **Create a Business Profile & Enter Approved Offers:** Define services, standard prices, and delivery terms.
2. **Import Leads via CSV or Capture Live Web Enquiries:** Ingest bulk prospect lists or connect lead forms.
3. **Observe Grounded AI Interactions:** Watch the AI answer enquiries using verified business information.
4. **Inspect Qualification Records:** See qualification answers populate with missing data visibly flagged.
5. **Set Custom Qualification Rules:** Define tenant-specific ICP rules with instant re-evaluation of all existing leads.
6. **Assign Leads & Schedule Actions:** Designate lead owners and enforce SLA-driven Next Best Actions.
7. **Review & Approve Follow-Ups:** Maintain human oversight on outbound messaging before sending.
8. **Seamlessly Take Over Conversations:** Step into any active dialogue with full context and transcripts preserved.
9. **Record Confirmed Commercial Outcomes:** Track deals won, revenue earned, and lead source attribution.
