import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, BarChart2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jntuLogo from '../assets/jntu.png';
import apLogo from '../assets/ap.png';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col">
            {/* Header */}
            <header className="absolute top-0 w-full z-10">
                <div className="container mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        {/* JNTU Logo */}
                        <img src={jntuLogo} alt="JNTU Logo" className="h-20 w-auto object-contain" />

                        <div className="hidden md:flex items-center space-x-2">
                            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-800">
                                FileTrack<span className="font-light text-slate-500">System</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <nav>
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="px-6 py-2.5 bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center group"
                                >
                                    <LayoutDashboard className="mr-2 w-4 h-4" />
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-6 py-2.5 bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center group"
                                >
                                    Login
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </nav>

                        {/* AP Logo */}
                        <img src={apLogo} alt="AP Logo" className="h-20 w-auto object-contain hidden sm:block" />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 pt-32 pb-20 flex flex-col md:flex-row items-center flex-grow">
                <div className="md:w-1/2 lg:pr-12 animate-fade-in-up">
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
                        Seamless File Tracking & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Intelligent Analytics
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                        Empower your governance with real-time file monitoring, AI-driven insights, and secure archival. The modern solution for efficient administration.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/dashboard"
                            className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex justify-center items-center hover:-translate-y-0.5"
                        >
                            {user ? 'Go to Dashboard' : 'Get Started'}
                        </Link>
                    </div>
                </div>

                {/* Visual / Illustration Area */}
                <div className="md:w-1/2 mt-12 md:mt-0 relative">
                    <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 ring-1 ring-slate-900/5">
                        {/* Mock Dashboard UI Snippet */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="h-3 w-24 bg-slate-200 rounded-full"></div>
                            <div className="flex space-x-2">
                                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                <div className="p-2 bg-blue-100 rounded-md mr-4"><FileText className="text-blue-600" /></div>
                                <div className="flex-1">
                                    <div className="h-2 w-32 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-2 w-20 bg-slate-100 rounded"></div>
                                </div>
                                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</div>
                            </div>
                            <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                                <div className="p-2 bg-purple-100 rounded-md mr-4"><BarChart2 className="text-purple-600" /></div>
                                <div className="flex-1">
                                    <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-slate-100 rounded"></div>
                                </div>
                                <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="container mx-auto px-6 py-20 relative">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Secure Access</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Role-based permissions ensure that sensitive files are only accessible to authorized personnel.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Smart Tracking</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Monitor file movement across departments with real-time status updates and SLA monitoring.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                            <BarChart2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Deep Insights</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Visualize data with interactive charts to identify bottlenecks and improve efficiency.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white mx-auto w-full px-6 py-8">
                <div className="container mx-auto text-center">
                    <p className="text-slate-700 font-medium text-base mb-1">
                        Developed by JNTU-Gurajada Vizianagaram
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
