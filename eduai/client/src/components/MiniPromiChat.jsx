import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { promiChat } from "../utils/api.js";

const starterMessages = [
  {
    role: "assistant",
    text: "Hey, I am Promi. Ask me to draft feedback, explain a concept, or plan the next study move."
  }
];

export default function MiniPromiChat({ role = "student" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [promiMode, setPromiMode] = useState("normal");

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setLoading(true);

    try {
      const response = await promiChat({
        message: text,
        role,
        context: {
          role,
          promiMode,
          surface: "mini-promi"
        }
      });
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text: response.reply || response.message || "I am here. Tell me what you want to work on next.",
          meta: response.modelMode ? `${response.modelMode}: ${response.model}` : response.source
        }
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text: "Promi's local model is not responding right now, but I can still help with the app flow. Try again after the server reconnects."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mini-promi ${open ? "open" : ""}`}>
      {open && (
        <section className="mini-promi-panel" aria-label="Mini Promi chat">
          <header>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#7f7cff] via-[#4ca7ff] to-[#52d6a7] text-white">
              <Bot size={22} />
            </span>
            <div>
              <strong>Promi</strong>
              <small>{role === "teacher" ? "Teaching co-pilot" : role === "admin" ? "Insight co-pilot" : "Study co-pilot"}</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Promi chat">
              <X size={18} />
            </button>
          </header>

          <div className="mini-promi-mode" aria-label="Promi model mode">
            {["normal", "fast"].map((mode) => (
              <button key={mode} type="button" className={promiMode === mode ? "active" : ""} onClick={() => setPromiMode(mode)}>
                {mode}
              </button>
            ))}
          </div>

          <div className="mini-promi-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`mini-promi-bubble ${message.role}`}>
                {message.text}
                {message.meta && <span>{message.meta}</span>}
              </div>
            ))}
            {loading && <div className="mini-promi-bubble assistant">Thinking...</div>}
          </div>

          <form onSubmit={sendMessage} className="mini-promi-input">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask Promi..." />
            <button type="submit" aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      <button type="button" className="mini-promi-button" onClick={() => setOpen((current) => !current)} aria-label="Open Promi chat">
        <Bot size={26} />
        <span>
          <Sparkles size={13} />
        </span>
      </button>
    </div>
  );
}
