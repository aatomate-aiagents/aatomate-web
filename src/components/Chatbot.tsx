"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

// ─── Knowledge Base ────────────────────────────────────────
const knowledgeBase = [
  {
    keywords: ["hello", "hi", "hey", "hola", "greetings", "good morning", "good evening"],
    response: "Hey there! 👋 I'm Aatomate AI — your personal AI automation consultant. I can help you with:\n\n• **Our Products** (Doctor Bot, Hotel Bot & more)\n• **Services** (AI Consulting, Custom Bots, Workflow Automation)\n• **Pricing** & Booking a Demo\n• **FAQs**\n\nWhat would you like to know?",
  },
  {
    keywords: ["service", "services", "what do you do", "what you do", "offer", "offerings"],
    response: "We offer **9 core services** to supercharge your business:\n\n🧠 **AI Consulting** — Strategic AI roadmap for your business\n⚙️ **Business Process Automation** — End-to-end ops automation\n👥 **HR AI Solutions** — Smart recruitment & onboarding\n💬 **Custom AI Chatbots** — Intelligent WhatsApp & web bots\n📄 **Document Automation** — Invoice, contract & report automation\n🔄 **Workflow Automation** — CRM, ERP & tool integrations\n🎓 **AI Training** — Upskill your team on AI tools\n📊 **Data Analytics** — Actionable insights from your data\n🏢 **Enterprise AI Integration** — Full-scale AI deployment\n\nWant details on any specific service?",
  },
  {
    keywords: ["product", "products", "doctor bot", "hotel bot", "bot", "bots", "ready-made"],
    response: "We have **ready-to-deploy AI products**:\n\n🩺 **Doctor Bot** — Automates patient bookings, reminders & FAQs on WhatsApp. Deployed in 2 weeks.\n\n🏨 **Hotel Bot** — Handles room reservations, payments & concierge requests. Zero-commission direct bookings.\n\nBoth run on WhatsApp and integrate with your existing systems. Want to see a live demo?",
  },
  {
    keywords: ["price", "pricing", "cost", "how much", "budget", "rate", "rates", "fee", "fees", "affordable"],
    response: "Our pricing is **transparent and project-based**:\n\n💡 **Products** (Doctor Bot / Hotel Bot):\n• Starting from ₹15,000/month\n• Custom enterprise plans available\n\n🛠️ **Custom AI Projects**:\n• Starts at ₹50,000 for small automations\n• Enterprise projects: Custom quote based on scope\n\n📞 **Free Consultation** — We'll scope your project and give you an exact quote within 24 hours.\n\nWant to book a free consultation?",
  },
  {
    keywords: ["book", "booking", "demo", "schedule", "call", "consultation", "meet", "meeting", "appointment", "talk", "contact"],
    response: "Let's get you booked! 🗓️\n\nYou can:\n\n1️⃣ **Book a Free Demo** — [Click here to schedule](/contact)\n2️⃣ **WhatsApp Us** — [Chat on WhatsApp](https://wa.me/919000272248)\n3️⃣ **Email** — info@aatomate.com\n\nOur team typically responds within 2 hours during business hours (Mon-Sat, 10 AM - 7 PM IST).",
  },
  {
    keywords: ["faq", "faqs", "question", "questions", "frequently asked"],
    response: "Here are our most asked questions:\n\n**⏱ How long does implementation take?**\nMost AI agents deploy in 2-4 weeks. Enterprise integrations: 6-8 weeks.\n\n**🔒 How secure is your AI?**\nEnterprise-grade encryption, HIPAA-compliant for healthcare. We never train public models on your data.\n\n**🔗 Can AI integrate with ERP?**\nYes! SAP, Salesforce, Oracle, QuickBooks, HubSpot & more.\n\n**🛠️ Do you build custom AI?**\nAbsolutely — bespoke agents tailored to your exact workflows.\n\n**🏭 What industries do you support?**\nHealthcare, Manufacturing, Retail, IT, Education, Finance, Logistics, Hospitality & Government.\n\nAnything else you'd like to know?",
  },
  {
    keywords: ["industry", "industries", "healthcare", "manufacturing", "retail", "education", "finance", "logistics", "hospitality", "government", "sector"],
    response: "We serve **9 major industries**:\n\n🏥 Healthcare — Patient booking, EHR integration\n🏭 Manufacturing — Supply chain AI, QC automation\n🛍️ Retail — Customer support bots, inventory AI\n💻 IT — DevOps automation, code review agents\n🎓 Education — Student engagement, admin automation\n💰 Finance — Fraud detection, compliance AI\n🚚 Logistics — Route optimization, tracking bots\n🏨 Hospitality — Guest services, booking automation\n🏛️ Government — Citizen services, document processing\n\nWant to explore a specific industry?",
  },
  {
    keywords: ["security", "secure", "hipaa", "soc2", "encryption", "privacy", "data protection", "compliant", "compliance"],
    response: "Security is built into our DNA 🔐\n\n• **SOC2 & HIPAA** compliant architecture\n• **End-to-end encryption** at rest and in transit\n• **Zero data sharing** — we never train public models on your private data\n• **Role-based access control** for enterprise deployments\n• **Regular security audits** and penetration testing\n\nYour data stays yours. Always.",
  },
  {
    keywords: ["integration", "integrate", "erp", "crm", "salesforce", "sap", "hubspot", "api"],
    response: "Our AI integrates seamlessly with your existing stack:\n\n🔗 **CRMs** — Salesforce, HubSpot, Zoho\n📊 **ERPs** — SAP, Oracle, Odoo\n💳 **Payments** — Razorpay, Stripe, PayU\n📅 **Calendars** — Google Calendar, Calendly\n📱 **Messaging** — WhatsApp, Telegram, Slack\n🗄️ **Databases** — PostgreSQL, MongoDB, Firebase\n\nDon't see your tool? We build custom API connectors too!",
  },
  {
    keywords: ["about", "company", "who are you", "aatomate", "team", "founded"],
    response: "**Aatomate** is India's leading AI Automation Agency 🇮🇳\n\n• 🏢 **MSME Registered** (Govt. of India)\n• 📋 **LLP Registered** (Ministry of Corporate Affairs)\n• 🚀 **Startup India** (DPIIT Recognized)\n• ⭐ **5.0/5.0** Google Reviews\n\nWe build intelligent agentic systems that replace fragile human workflows with robust, 24/7 AI-powered automation.\n\nOur mission: Make world-class AI automation accessible to every business.",
  },
  {
    keywords: ["custom", "bespoke", "tailor", "tailored", "unique", "specific"],
    response: "Yes, we specialize in **custom AI solutions**! 🛠️\n\nOur process:\n1️⃣ **Discovery** — We deep-dive into your workflows\n2️⃣ **Architecture** — Design AI agents for your exact needs\n3️⃣ **Build & Test** — Develop with rigorous QA\n4️⃣ **Deploy & Iterate** — Launch + continuous optimization\n\nEvery solution is unique to your business logic. No cookie-cutter templates.\n\nWant to discuss your use case?",
  },
  {
    keywords: ["whatsapp", "chat", "messenger", "messaging"],
    response: "WhatsApp is our specialty! 💬\n\nOur WhatsApp AI agents can:\n• 📅 Book appointments & reservations\n• 🤖 Answer FAQs intelligently\n• 💳 Process payments in-chat\n• 📊 Qualify and nurture leads\n• 🔔 Send automated reminders\n\n**78% of customers buy from the first responder** — our bots respond in under 2 seconds.\n\nWant to see a live WhatsApp demo?",
  },
  {
    keywords: ["roi", "result", "results", "outcome", "benefit", "benefits", "save", "savings"],
    response: "Our clients see measurable results 📈\n\n• **500+ hours** saved per month\n• **95% automation accuracy**\n• **60% faster** operations\n• **40% lower** admin costs\n• **78% reduction** in customer response time\n\nEvery workflow we build is mapped directly to ROI. We guarantee it.\n\nWant to calculate your potential savings?",
  },
];

const quickReplies = [
  "What services do you offer?",
  "Tell me about your products",
  "How much does it cost?",
  "Book a demo",
  "FAQs",
];

type Message = {
  id: number;
  type: "user" | "bot";
  text: string;
  timestamp: string;
};

function getTimeString() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function findResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.response;
      }
    }
  }

  // Default fallback
  return "I appreciate your question! 🤔 I'm best at answering questions about:\n\n• **Services** — What we offer\n• **Products** — Doctor Bot, Hotel Bot\n• **Pricing** — Costs & plans\n• **Booking** — Schedule a demo\n• **FAQs** — Common questions\n\nCould you rephrase or pick one of these topics? Or you can always [talk to our team directly](/contact).";
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      type: "bot",
      text: "Hi! I'm **Aatomate AI** 🤖\n\nI can help you learn about our products, services, pricing, and more. How can I assist you today?",
      timestamp: getTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: messages.length,
      type: "user",
      text: messageText,
      timestamp: getTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const botResponse = findResponse(messageText);
      const botMsg: Message = {
        id: messages.length + 1,
        type: "bot",
        text: botResponse,
        timestamp: getTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  // Render markdown-like formatting
  const renderText = (text: string) => {
    // Convert markdown links [text](url) to JSX
    const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|\n)/g);
    return parts.map((part, i) => {
      // Bold
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Links
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <Link
            key={i}
            href={linkMatch[2]}
            target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
            rel={linkMatch[2].startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-[#25D366] underline underline-offset-2 hover:text-[#20bd5a] transition-colors"
          >
            {linkMatch[1]}
          </Link>
        );
      }
      // Newlines
      if (part === "\n") return <br key={i} />;
      return <span key={i}>{part}</span>;
    });
  };

  // Hide on certificate verify pages and admin certificate view
  if (pathname?.startsWith('/verify') || pathname?.startsWith('/certificate')) {
    return null;
  }

  return (
    <>
      {/* Floating Chatbot Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[112px] md:bottom-[104px] right-6 z-50 w-[60px] h-[60px] bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_48px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110 group"
            aria-label="Open AI Chatbot"
          >
            <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
            {/* Pulse Ring */}
            <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-30" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-48px)] sm:w-[420px] h-[600px] max-h-[80vh] flex flex-col rounded-[28px] overflow-hidden border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(37,211,102,0.1)]"
            style={{
              background: "linear-gradient(180deg, rgba(10,10,10,0.98) 0%, rgba(5,5,5,0.99) 100%)",
              backdropFilter: "blur(40px)",
            }}
          >
            {/* Header */}
            <div className="relative flex items-center gap-4 px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#25D366]/10 to-transparent">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#25D366] rounded-full border-2 border-[#0A0A0A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-[16px] tracking-tight">Aatomate AI</h3>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#25D366]" />
                  <span className="text-[12px] text-[#25D366] font-medium">Online • Typically replies instantly</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chatbot"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.type === "bot"
                      ? "bg-gradient-to-br from-[#25D366] to-[#128C7E]"
                      : "bg-white/20"
                  }`}>
                    {msg.type === "bot" ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-[14px] leading-relaxed rounded-[20px] ${
                      msg.type === "bot"
                        ? "bg-white/8 text-white/90 rounded-bl-[4px] border border-white/10"
                        : "bg-[#25D366] text-black font-medium rounded-br-[4px]"
                    }`}
                  >
                    {renderText(msg.text)}
                    <div className={`text-[10px] mt-2 ${msg.type === "bot" ? "text-white/30" : "text-black/50"}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/8 border border-white/10 rounded-[20px] rounded-bl-[4px] px-5 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              {/* Quick Replies — shown only after last bot message */}
              {!isTyping && messages[messages.length - 1]?.type === "bot" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSend(reply)}
                      className="px-4 py-2 bg-white/5 border border-white/15 rounded-full text-[12px] text-white/70 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 hover:text-[#25D366] transition-all duration-200 flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {reply}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-4 border-t border-white/10 bg-black/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/8 border border-white/10 rounded-full px-5 py-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#25D366]/50 focus:bg-white/10 transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
              <p className="text-center text-[10px] text-white/20 mt-3 font-medium">
                Powered by Aatomate AI • Responses are AI-generated
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
