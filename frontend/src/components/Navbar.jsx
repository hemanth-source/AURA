import { Link, useLocation } from "react-router-dom";

function Navbar() {
    const location = useLocation();

    const links = [
        { path: "/", icon: "🏠", label: "Upload" },
        { path: "/quiz", icon: "🧠", label: "Knowledge Check" },
        { path: "/flashcards", icon: "🃏", label: "Flashcards" },
        { path: "/progress", icon: "📈", label: "Progress" },
        { path: "/chat", icon: "💬", label: "Ask AURA" }
    ];

    return (
        <nav className="navbar">
            <div className="nav-links icon-links">
                {links.map((link) => (
                    <Link 
                        key={link.path}
                        to={link.path} 
                        className={`nav-link icon-link ${location.pathname === link.path ? 'active' : ''}`}
                        title={link.label}
                    >
                        <span className="nav-icon">{link.icon}</span>
                        <span className="nav-label">{link.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}

export default Navbar;