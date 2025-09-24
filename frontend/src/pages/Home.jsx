import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">Humanized RAG</div>
          <nav>
            <button
              onClick={() => nav("/chat")}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >Try the Chatbot</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-extrabold mb-6">Practice Interviews — but human</h1>
        <p className="max-w-2xl mx-auto mb-8 text-gray-600">Get humanized answers with up-to-date context.</p>
        <button
          onClick={() => nav("/chat")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg"
        >
          Try the Chatbot
        </button>
      </main>

      <footer className="bg-gray-50 py-6">
        <div className="container mx-auto text-center text-sm text-gray-500">
          Built with ❤️ — local LLM + web search (RAG)
        </div>
      </footer>
    </div>
  );
}
