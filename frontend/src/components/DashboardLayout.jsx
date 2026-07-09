import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useSessionState from '../hooks/useSessionState';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useSessionState('appTheme', 'light');
    const [toasts, setToasts] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="dashboard-wrapper">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>ReportLoP</h2>
                    <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        ☰
                    </button>
                </div>
                
                <nav className={`sidebar-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                    <NavLink to="/dashboard/stats" className={({ isActive }) => isActive ? "side-link active" : "side-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="icon"></span> <span className="link-text">Main Dashboard</span>
                    </NavLink>
                    <NavLink to="/dashboard/horas" className={({ isActive }) => isActive ? "side-link active" : "side-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="icon"></span> <span className="link-text">Data Horas</span>
                    </NavLink>
                    <NavLink to="/dashboard/manual" className={({ isActive }) => isActive ? "side-link active" : "side-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="icon"></span> <span className="link-text">Data Manual</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button className="theme-toggle-sidebar" onClick={toggleTheme}>
                        <span className="icon">{theme === 'light'}</span>
                        <span className="link-text">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="content-area">
                    <Outlet context={{ showToast }} />
                </div>
            </main>

            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast ${toast.type}`}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardLayout;