import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import axios from "axios";
import "./Chat.css";
import sendIcon from "../../public/icons/send.png";
import micIcon from "../../public/icons/mic.png";
import reloadIcon from "../../public/icons/reload.png";
import copyIcon from "../../public/icons/copy.png";
import speakIcon from "../../public/icons/speak.png";
import toast, { Toaster } from "react-hot-toast";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [recording, setRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const bottomRef = useRef();
  const textareaRef = useRef(null);

  const send = async (text) => {
    if (!text) return;
    setLastQuestion(text);
    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat", { message: text });
      const answer = res.data.answer || "No answer.";
      setMessages((m) => [...m, { sender: "bot", text: answer }]);
      const u = new SpeechSynthesisUtterance(answer);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    } catch (err) {
      setMessages((m) => [...m, { sender: "bot", text: "Error: could not reach backend." }]);
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Voice input unchanged
  const startVoice = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    setRecording(true);

    recognition.onresult = (e) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = 0; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      setInput(finalTranscript + interimTranscript);
    };

    recognition.onerror = (e) => {
      console.error("Speech error", e);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      if (input.trim() !== "") {
        send(input);
      }
    };

    recognition.start();
  };

  const reloadQuestion = () => send(lastQuestion);

  const copyMessage = (msg) => {
    navigator.clipboard.writeText(msg);
    toast.success("Copied message!", {
      position: "bottom-center",
      style: {
        background: "#2a2a2a",
        color: "#fff",
        fontSize: "14px",
      },
    });
  };

  const speakMessage = (msg, i) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = "en-US";
    const words = msg.split(" ");
    utterance.onboundary = (event) => {
      if (event.name === "word" || event.charIndex !== undefined) {
        let charIndex = event.charIndex;
        let beforeText = msg.slice(0, charIndex);
        let wordIndex = beforeText.trim().split(/\s+/).length - 1;
        setSpeakingIndex({ msgIndex: i, wordIndex });
      }
    };
    utterance.onend = () => setSpeakingIndex(null);
    speechSynthesis.speak(utterance);
  };

  // Auto-resize logic
  const adjustTextareaHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    // Reset height to measure correctly
    ta.style.height = "auto";

    // Computed styles
    const cs = window.getComputedStyle(ta);
    let lineHeight = parseFloat(cs.lineHeight);
    if (Number.isNaN(lineHeight) || lineHeight === 0) {
      // fallback
      lineHeight = parseFloat(cs.fontSize) * 1.2 || 20;
    }

    const paddingTop = parseFloat(cs.paddingTop) || 0;
    const paddingBottom = parseFloat(cs.paddingBottom) || 0;
    const borderTop = parseFloat(cs.borderTopWidth) || 0;
    const borderBottom = parseFloat(cs.borderBottomWidth) || 0;

    // Breakpoints for max lines (user request)
    const width = window.innerWidth;
    const maxLines = width < 768 ? 6 : width < 1024 ? 9 : 12;

    // Max height in px
    const maxHeight = Math.round(maxLines * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom);

    // Minimum height = one line
    const minHeight = Math.round(lineHeight + paddingTop + paddingBottom + borderTop + borderBottom);

    // New height is content's scrollHeight clamped to maxHeight, but never below minHeight
    const contentHeight = ta.scrollHeight;
    const newHeight = Math.max(Math.min(contentHeight, maxHeight), minHeight);

    ta.style.height = `${newHeight}px`;

    // toggle scrollbar
    if (contentHeight > maxHeight) {
      ta.style.overflowY = "auto";
    } else {
      ta.style.overflowY = "hidden";
    }
  }, []);

  // run on input change and mount
  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // update on resize
  useEffect(() => {
    window.addEventListener("resize", adjustTextareaHeight);
    return () => window.removeEventListener("resize", adjustTextareaHeight);
  }, [adjustTextareaHeight]);

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
          <div key={i} className="message-wrapper">
            <div className={`message ${m.sender}`}>
              {m.sender === "bot"
                ? m.text.split(" ").map((word, wIdx) => (
                    <span
                      key={wIdx}
                      className={
                        speakingIndex &&
                        speakingIndex.msgIndex === i &&
                        speakingIndex.wordIndex === wIdx
                          ? "highlighted-word"
                          : ""
                      }
                    >
                      {word}{" "}
                    </span>
                  ))
                : m.text}
            </div>

            {m.sender === "bot" && (
              <div className="bot-actions">
                <img src={reloadIcon} alt="reload" onClick={reloadQuestion} />
                <img src={copyIcon} alt="copy" onClick={() => copyMessage(m.text)} />
                <img src={speakIcon} alt="speak" onClick={() => speakMessage(m.text, i)} />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-container">
        {/* wrapper keeps border-radius intact while textarea scrolls inside */}
        <div className={`textarea-wrapper ${input ? "has-text" : ""}`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter = send, Shift+Enter = newline
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

      {loading && <div className="loading-text">Thinking…</div>}
    </div>
  );
}