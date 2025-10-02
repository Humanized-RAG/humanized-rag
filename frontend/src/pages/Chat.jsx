import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import axios from "axios";
import "./Chat.css";
import sendIcon from "../../public/icons/send.png";
import micIcon from "../../public/icons/mic.png";
import reloadIcon from "../../public/icons/reload.png";
import copyIcon from "../../public/icons/copy.png";
import speakIcon from "../../public/icons/speak.png";
import tickIcon from "../../public/icons/tick.png";
import toast, { Toaster } from "react-hot-toast";

export default function Chat() {
  const [messages, setMessages] = useState([]); // messages now have optional id and pending
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // kept for other UI uses (mic etc.)
  const [lastQuestion, setLastQuestion] = useState("");
  const [recording, setRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null); 
  const bottomRef = useRef();
  const textareaRef = useRef(null);

  const send = async (text) => {
    if (!text || !text.trim()) return;
    setLastQuestion(text);

    // create unique ids for messages
    const userId = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const placeholderId = `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const userMessage = { id: userId, sender: "user", text };
    const botPlaceholder = { id: placeholderId, sender: "bot", text: "Thinking…", pending: true };

    // append both user message and placeholder
    setMessages((m) => [...m, userMessage, botPlaceholder]);
    setInput("");
    setLoading(true);

    // ensure scrolled to placeholder
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await axios.post("http://localhost:8000/chat", { message: text });
      const answer = res.data.answer || "No answer.";

      // replace the placeholder with the answer (turn off pending)
      setMessages((m) =>
        m.map((msg) =>
          msg.id === placeholderId ? { ...msg, text: answer, pending: false } : msg
        )
      );

      // speak the answer
      // const u = new SpeechSynthesisUtterance(answer);
      // u.lang = "en-US";
      // speechSynthesis.speak(u);
    } catch (err) {
      // replace placeholder with error
      setMessages((m) =>
        m.map((msg) =>
          msg.id === placeholderId
            ? { ...msg, text: "Error: could not reach backend.", pending: false }
            : msg
        )
      );
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  // Voice input unchanged (only small fix to use the final transcript)
  const startVoice = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    setRecording(true);

    let finalTranscript = "";

    recognition.onresult = (e) => {
      let interimTranscript = "";
      for (let i = 0; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      setInput((finalTranscript + interimTranscript).trimStart());
    };

    recognition.onerror = (e) => {
      console.error("Speech error", e);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      // use the latest input state (it was updated in onresult)
      if (input.trim() !== "") {
        send(input);
      }
    };

    recognition.start();
  };

  const reloadQuestion = () => {
    if (lastQuestion) send(lastQuestion);
  };

  const copyMessage = (msg, i) => {
    navigator.clipboard.writeText(msg);
    toast.success("Copied message!", {
      position: "bottom-center",
      style: {
        background: "#2a2a2a",
        color: "#fff",
        fontSize: "14px",
      },
    });
    setCopiedIndex(i); // set current message index to show tick
    setTimeout(() => setCopiedIndex(null), 3000); // reset after 3 seconds
  };

const speakMessage = (msg, msgIndex) => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    setSpeakingIndex(null);
    if (speakingIndex?.msgIndex === msgIndex) return; // stop if same message
  }

  const utterance = new SpeechSynthesisUtterance(msg);
  utterance.lang = "en-US";

  utterance.onboundary = (event) => {
    if (event.name === "word" || event.charIndex !== undefined) {
      const charIndex = event.charIndex;
      const beforeText = msg.slice(0, charIndex);

      // Split lines
      const lines = msg.split("\n");
      let lineIdx = 0;
      let wordIdx = 0;
      let count = 0;

      for (let li = 0; li < lines.length; li++) {
        const words = lines[li].split(/\s+/);
        if (beforeText.split(/\s+/).length - 1 < count + words.length) {
          lineIdx = li;
          wordIdx = beforeText.split(/\s+/).length - 1 - count;
          break;
        }
        count += words.length;
      }

      setSpeakingIndex({ msgIndex, lineIdx, wordIdx });
    }
  };

  utterance.onend = () => setSpeakingIndex(null);

  speechSynthesis.speak(utterance);
};


  // Auto-resize logic (unchanged)
  const adjustTextareaHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const cs = window.getComputedStyle(ta);
    let lineHeight = parseFloat(cs.lineHeight);
    if (Number.isNaN(lineHeight) || lineHeight === 0) {
      lineHeight = parseFloat(cs.fontSize) * 1.2 || 20;
    }
    const paddingTop = parseFloat(cs.paddingTop) || 0;
    const paddingBottom = parseFloat(cs.paddingBottom) || 0;
    const borderTop = parseFloat(cs.borderTopWidth) || 0;
    const borderBottom = parseFloat(cs.borderBottomWidth) || 0;
    const width = window.innerWidth;
    const maxLines = width < 768 ? 6 : width < 1024 ? 9 : 12;
    const maxHeight = Math.round(maxLines * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom);
    const minHeight = Math.round(lineHeight + paddingTop + paddingBottom + borderTop + borderBottom);
    const contentHeight = ta.scrollHeight;
    const newHeight = Math.max(Math.min(contentHeight, maxHeight), minHeight);
    ta.style.height = `${newHeight}px`;
    if (contentHeight > maxHeight) ta.style.overflowY = "auto";
    else ta.style.overflowY = "hidden";
  }, []);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  useEffect(() => {
    window.addEventListener("resize", adjustTextareaHeight);
    return () => window.removeEventListener("resize", adjustTextareaHeight);
  }, [adjustTextareaHeight]);

  useEffect(() => {
  const handleBeforeUnload = () => {
    speechSynthesis.cancel();
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, []);


  return (
    <div className="chat-container">
      <Toaster
        toastOptions={{
          success: { style: { background: "#2a2a2a", color: "#fff" } },
          error: { style: { background: "#b00020", color: "#fff" } },
        }}
      />

      <header className="chat-header">Humanized RAG — Chat</header>

     <div className="chat-messages">
      {messages.map((m, i) => (
        <div key={m.id ?? i} className="message-wrapper">
          <div className={`message ${m.sender} ${m.pending ? "pending" : ""}`}>
            {m.sender === "bot" ? (
              m.pending ? (
                <div className="bot-thinking" aria-live="polite">
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
m.text.split("\n").map((line, lineIdx) => (
  <div key={lineIdx} className="bot-line">
    {line.split(" ").map((word, wIdx) => (
      <span
        key={wIdx}
        className={
          speakingIndex &&
          speakingIndex.msgIndex === i &&
          speakingIndex.lineIdx === lineIdx &&
          speakingIndex.wordIdx === wIdx
            ? "highlighted-word"
            : ""
        }
      >
        {word}{" "}
      </span>
    ))}
  </div>
))

              )
            ) : (
              <pre className="user-message">{m.text}</pre>
            )}
          </div>

          {m.sender === "bot" && !m.pending && (
            <div className="bot-actions">
              <img src={reloadIcon} alt="reload" onClick={reloadQuestion} />
              <img
                src={copiedIndex === i ? tickIcon : copyIcon} // <-- swap icon here
                alt="copy"
                onClick={() => copyMessage(m.text, i)}
              />
              <img src={speakIcon} alt="speak" onClick={() => speakMessage(m.text, i)} />
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>


      <div className="chat-input-container">
        <div className={`textarea-wrapper ${input ? "has-text" : ""}`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Type a message..."
          />
        </div>

        <div className="chat-input-icons">
          <img
            src={sendIcon}
            alt="send"
            className={input ? "active" : "disabled"}
            onClick={() => send(input)}
          />
          <img
            src={micIcon}
            alt="mic"
            onClick={startVoice}
            className={recording ? "recording active" : ""}
          />
        </div>
      </div>

      {/* removed global loading-text; thinking is now shown inline as a placeholder message */}
    </div>
  );
}