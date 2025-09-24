import { useState, useRef } from "react";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  const send = async (text) => {
    if (!text) return;
    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat", { message: text });
      const answer = res.data.answer || "No answer.";
      setMessages((m) => [...m, { sender: "bot", text: answer }]);
      // speak
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

  const startVoice = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      send(txt);
    };
    recognition.onerror = (e) => {
      console.error("Speech error", e);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold">Humanized RAG — Chat</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 container mx-auto">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-xl ${m.sender === "user" ? "ml-auto bg-blue-600 text-white" : "mr-auto bg-gray-200 text-black"} p-3 rounded-lg`}>
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-4 bg-white shadow">
        <div className="container mx-auto flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Type or press the mic..."
          />
          <button onClick={() => send(input)} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
          <button onClick={startVoice} className="bg-green-600 text-white px-4 py-2 rounded">🎤</button>
        </div>
        {loading && <div className="text-sm text-gray-500 mt-1 text-center">Thinking…</div>}
      </div>
    </div>
  );
}
