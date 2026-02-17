import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Upload, LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import jntuLogo from '../assets/jntu.png';
import apLogo from '../assets/ap.png';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 text-slate-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl shadow-slate-200/50`;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            <div className={sidebarClasses}>
                <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100/50">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">FTS Dashboard</span>
                    <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-800 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6">
                    <nav className="px-4 space-y-2">
                        <Link
                            to="/dashboard"
                            onClick={() => window.innerWidth < 768 && onClose()}
                            className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group font-medium hover:shadow-sm"
                        >
                            <LayoutDashboard className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            Overview
                        </Link>
                        {user?.role === 'Operator' && (
                            <Link
                                to="/dashboard/upload"
                                onClick={() => window.innerWidth < 768 && onClose()}
                                className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group font-medium hover:shadow-sm"
                            >
                                <Upload className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                Upload File
                            </Link>
                        )}
                        <Link
                            to="/dashboard/files"
                            onClick={() => window.innerWidth < 768 && onClose()}
                            className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group font-medium hover:shadow-sm"
                        >
                            <FileText className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            Files
                        </Link>
                        <Link
                            to="/dashboard/alerts"
                            onClick={() => window.innerWidth < 768 && onClose()}
                            className="flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group font-medium hover:shadow-sm"
                        >
                            <AlertTriangle className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            Alerts
                        </Link>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100/50 bg-slate-50/50">
                    <div className="mb-4 px-2">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Logged in as</p>
                        <p className="font-semibold text-slate-900 truncate">{user?.username}</p>
                        <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">{user?.role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 font-bold shadow-sm hover:shadow"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 overflow-hidden font-sans selection:bg-blue-200 selection:text-blue-900">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : ''}`}>

                {/* Header */}
                <header className="bg-white/70 backdrop-blur-md shadow-sm z-30 h-24 flex items-center justify-between px-8 sticky top-0 border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-white/50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        {/* JNTU Logo (Left) */}
                        <img src={jntuLogo} alt="JNTU Logo" className="h-16 object-contain hover:scale-105 transition-transform duration-300" />
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* AP Logo (Right) */}
                        <img src={apLogo} alt="AP Logo" className="h-16 object-contain hover:scale-105 transition-transform duration-300" />

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm ring-2 ring-white hover:ring-blue-100 transition-all cursor-pointer"
                            >
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-fade-in-up z-50">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.username}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col scroll-smooth">
                    <div className="p-8 flex-1">
                        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 min-h-[calc(100vh-12rem)]">
                            <Outlet />
                        </div>
                    </div>

                    {/* Footer - Sticky to bottom of content area */}
                    <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200/60 py-6 mt-auto">
                        <div className="max-w-7xl mx-auto px-6 text-center">
                            <p className="text-slate-600 font-medium text-sm">
                                Developed by JNTU-Gurajada Vizianagaram
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
