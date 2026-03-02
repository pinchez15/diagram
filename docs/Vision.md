# Diagram — Product Vision

## The 60-Second Promise

Today, a small business owner describes how their company works — and 60 seconds later, they're looking at a beautiful, editable diagram of their entire operation. No design skills. No enterprise software license. No consultant required to make updates.

This should feel **near-magical.** A user drops in text — maybe raw notes from a meeting, maybe structured output from an AI agent — and their workflow comes alive on the canvas. Boxes, arrows, lanes, tool labels, all of it. Not just rendered, but *readable.* Readable by someone with a high school education or an associate's degree. The picture should make data flow *obvious* — you look at the diagram and understand how information moves behind the scenes, who touches it, what tools it passes through. If the diagram requires explanation to understand, we've failed.

That's V1. Here's where we're going.

---

## Year 1: The Best Way to Diagram for Small Business

### V1 — AI-Powered Diagramming (Now)

Diagram launches as the fastest way to go from "I need a diagram" to "I have a diagram I can actually use." The wedge is clear: consultants (like CappaWork) create diagrams for their clients, but hand them off in tools the client can't afford or can't use. Diagram is the tool that lives on both sides — powerful enough for the consultant to create in, cheap and simple enough for the client to maintain.

**What wins in V1:**
- AI generation that actually works (Claude-powered, structured output, instant render)
- Drop in *any* text — agent output, meeting notes, a rambling description — and get a real diagram. The magic is in the parsing, not the prompting.
- A canvas editor that feels like a polished product, not a developer tool
- Text-labeled tool nodes with smart color-coding — you look at a diagram and immediately understand what systems are involved
- Readability for non-technical users. Every diagram should be self-explanatory. Clear labels, logical flow direction, no jargon without context. If your warehouse manager can't read the diagram, it's not done.
- Open data: export to anything. Your diagrams are yours. JSON, Mermaid, PNG, SVG, PDF.
- $8/month. Not $45/seat/month.

### V1.5 — Templates and Polish

After launch, fill the gap between "blank canvas" and "AI-generated." A library of starter templates for common small business workflows: employee onboarding, customer order fulfillment, sales pipeline, support ticket flow. Users browse, pick one, customize. This also feeds the AI — templates become few-shot examples for better generation.

---

## Year 2: From Diagrams to Living Documentation

### V2 — Real-Time Collaboration + Living Diagrams

The diagram stops being a static artifact and becomes a living document.

**Real-time collaboration:** Two people editing the same diagram simultaneously. This is table stakes for any SaaS tool in 2026, and Supabase Realtime makes it achievable without building a sync engine from scratch.

**Living diagram connections:** A workflow diagram that shows "Stripe" as a payment node could link to the real Stripe dashboard. A "Supabase" database node could show live row counts. This isn't a full integration — it's lightweight deep links and optional metadata that make diagrams more than pictures.

**Presentation mode:** Animated data flow. Click "present" and watch a dot trace the path of a customer order through your entire operation. This is the killer demo moment for consultants presenting to clients.

**Custom branding:** Upload your company logo, set brand colors. The diagram becomes something you put in your investor deck, your employee handbook, your client proposals.

### V2.5 — The Consultant Platform

CappaWork and consultants like them don't just make one diagram — they make dozens for different clients. Build the workflow for this:

- **Consultant workspace:** Manage multiple client accounts from one login. Create diagrams in the client's account directly.
- **White-label export:** Export diagrams with the client's branding, not Diagram's.
- **Template marketplace:** Consultants publish templates for specific industries (restaurants, e-commerce, healthcare clinics). Free or paid.
- **Bulk operations:** Generate 5 variations of a diagram from one prompt and let the client pick.

---

## Year 3: The Operational Intelligence Layer

### V3 — Beyond Diagrams

The diagram is a map. But maps are most valuable when they show you what's happening right now.

**Operational overlays:** Connect real data sources and overlay metrics onto your workflow diagram. The "Customer Support" lane shows ticket volume. The "Shipping" lane shows average fulfillment time. The "Payments" node glows red when Stripe reports elevated error rates. This isn't a BI tool — it's your workflow diagram with a pulse.

**Change tracking:** When you restructure a workflow, Diagram tracks what changed and when. "On March 15, you moved QA review from the Engineering lane to the Product lane. Since then, cycle time has decreased by 2 days." This requires optional metric connections but creates enormous value.

**AI workflow analysis:** Upload your diagram and ask: "Where are the bottlenecks?" "Which handoffs create the most delays?" "What happens if I remove this approval step?" The AI understands your workflow topology and gives advice grounded in your actual process, not generic consulting frameworks.

### V3.5 — The API Platform

Diagram becomes a platform that other tools build on.

- **Diagram API:** CRUD operations on diagrams programmatically. CI/CD tools generate architecture diagrams. HR tools push org chart updates. Project management tools export process flows.
- **Embed anywhere:** `<iframe>` or `<script>` embed that renders a live, interactive diagram in any webpage. Notion, Confluence, internal wikis.
- **Webhook triggers:** "When this diagram changes, notify Slack." "When a new node is added to the Engineering lane, create a Jira ticket."
- **AI agent input:** External AI agents (Cursor, Claude Code, custom agents) produce diagrams as output. Diagram becomes the visualization layer for any AI-generated process or architecture.

---

## Year 5: The Long Game

### The Diagram Graph

Every Diagram user has created a map of how their business works. Anonymized and aggregated, this is an extraordinary dataset:

- **Industry benchmarks:** "Here's how the average e-commerce company with 15 employees structures their fulfillment workflow."
- **Best practice suggestions:** "Companies similar to yours that added a QA step between design and shipping saw 30% fewer returns."
- **Hiring recommendations:** "Your workflow has 3 handoff points that typically require a dedicated operations coordinator at your stage."

This is opt-in, privacy-first, and aggregated. But it transforms Diagram from a drawing tool into an operational advisor.

### Diagram for Everything

The core technology — AI-generated, visually editable, data-connected diagrams — applies far beyond business workflows:

- **Software architecture:** Generate system architecture diagrams from codebase analysis
- **Product flows:** Map user journeys with real analytics data overlaid
- **Compliance:** Visualize data flows for GDPR/SOC2 compliance documentation
- **Education:** Students diagram processes, systems, and concepts interactively

---

## What We Won't Do

Staying focused is as important as ambition. Diagram will NOT:

- **Become a general-purpose design tool.** We're not Figma. We diagram processes, organizations, and workflows. That's it.
- **Chase enterprise procurement.** Our pricing stays simple, our sales motion stays self-serve. If Fortune 500 companies want to use us, great — but we don't build for their buying process.
- **Build our own AI model.** We use the best foundation models (Claude, GPT) and focus on prompt engineering and schema design. The model layer is a commodity; the UX layer is the moat.
- **Lock in user data.** Open export formats, always. If a user wants to leave, they take everything with them. This is a feature, not a risk — it builds trust.

---

## The Readability Standard

A diagram built in Diagram should pass this test: **hand it to someone with no context about the business and a high school education. Can they trace how a piece of data moves from start to finish?** Can they point to where the bottleneck probably is? Can they name the tools involved?

This isn't about dumbing things down. It's about clarity of visual communication. The diagram does the explaining so nobody else has to. Every design decision — node shapes, color categories, label language, flow direction, lane organization — serves this standard.

---

## The North Star

A small business owner opens Diagram, describes their business in plain English, and has a professional workflow diagram in 60 seconds. They edit it when things change. They share it with their team. They present it to their bank, their investors, their new hires. Their consultant uses it to advise them. Their tools connect to it. Their diagram becomes the living blueprint of how their business actually works.

It feels like magic. It reads like a picture book. It works like a professional tool.

That's Diagram.
