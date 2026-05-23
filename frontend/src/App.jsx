import { useState } from "react";
import { askQuestion } from "./api";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const extractSection = (label) => {
    const regex = new RegExp(`###\\s*${label}\\s*([\\s\\S]*?)(?=###|$)`, "i");
    const match = answer.match(regex);
    return match ? match[1].trim() : "Not available";
  };

  const cleanAnswer = () => {
    return answer
      .replace(/###\s*Sentiment[\s\S]*?(?=###|$)/i, "")
      .replace(/###\s*Confidence[\s\S]*?(?=###|$)/i, "")
      .replace(/###/g, "")
      .trim();
  };

  const handleAsk = async () => {
    setLoading(true);
    setAnswer("");
    setSources([]);

    try {
      const data = await askQuestion(question);
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch {
      setAnswer("Backend error. Check FastAPI and Ollama are running.");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <section className="hero">
        <p className="badge">AI-POWERED MARKET INTELLIGENCE</p>
        <h1>Trustworthy Finance RAG</h1>
        <p className="subtitle">
          Ask financial market questions and get source-backed, grounded answers.
        </p>
      </section>

      <main className="dashboard">
        <div className="ask-card">
          <textarea
            placeholder="Example: Why is Nvidia stock moving this week?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button onClick={handleAsk} disabled={loading || !question}>
            {loading ? "Analyzing..." : "Ask AI →"}
          </button>
        </div>

        <div className="result-grid">
          <section className="panel answer-panel">
            <h2>Answer</h2>
            <pre>{answer ? cleanAnswer() : "Your answer will appear here."}</pre>
          </section>

          <section className="panel">
            <h2>Sources</h2>
            {sources.length === 0 && <p className="muted">Sources will appear here.</p>}
            {sources.map((source, index) => (
              <a key={index} href={source.url} target="_blank" rel="noreferrer">
                🔗 {source.title}
              </a>
            ))}
          </section>
        </div>

        <div className="insight-grid">
          <div className="insight-card sentiment">
            <h3>Sentiment</h3>
            <p>{answer ? extractSection("Sentiment") : "Not available"}</p>
          </div>

          <div className="insight-card confidence">
            <h3>Confidence</h3>
            <p>{answer ? extractSection("Confidence") : "Not available"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;