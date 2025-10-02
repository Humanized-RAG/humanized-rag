import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const sections = ["home", "contact", "help"];

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2;
      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          if (
            scrollPos >= section.offsetTop &&
            scrollPos < section.offsetTop + section.offsetHeight
          ) {
            setActiveSection(id);
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container">
      <header className="custom-header">
        <div className="header-logo">
          <div className="header-circle-logo"></div>
          <span className="header-name">BLOB.</span>
        </div>

        <div className="burger" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`line ${menuOpen ? "rotate1" : ""}`}></div>
          <div className={`line ${menuOpen ? "fade" : ""}`}></div>
          <div className={`line ${menuOpen ? "rotate2" : ""}`}></div>
        </div>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {sections.map((id) => (
            <span
              key={id}
              onClick={() => scrollToSection(id)}
              className={`nav-link ${activeSection === id ? "active" : ""}`}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </span>
          ))}
          <button className="login-btn">Login</button>
        </nav>
      </header>

      <main className="main-content">
        <section id="home" className="section">
          <div className="logo-circle">
            <video
              className="logo-video"
              src="/Voice.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          <h1 className="main-title">Web3 AI Chatbot</h1>
          <p className="subtitle">Shaping Tomorrow</p>
          <button
            className="main-btn"
            onClick={() => navigate("/chat")}
          >
            Try the Chatbot
          </button>
        </section>

        <section id="contact" className="section">
          <h2>Contact Section</h2>
          <p>Put your contact details here.</p>
        </section>

        <section id="help" className="section">
          <h2>Help Section</h2>
          <p>Put your help information here.</p>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 BLOB. All rights reserved.</p>
          <div className="footer-links">
            <span onClick={() => scrollToSection("home")}>Home</span>
            <span onClick={() => scrollToSection("contact")}>Contact</span>
            <span onClick={() => scrollToSection("help")}>Help</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
