import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';

const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState('pending');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleDownloadReport = async () => {
        setDownloading(true);
        try {
            const response = await api.get('/reports/daily', {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'daily_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report", error);
            alert("Failed to download report.");
        } finally {
            setDownloading(false);
        }
    };

    const handleViewReport = () => {
        // Open the report in a new tab
        // Construct URL based on API base URL
        const baseURL = api.defaults.baseURL || 'http://localhost:5000/api';
        const reportURL = `${baseURL}/reports/daily?view=true&token=${localStorage.getItem('token')}`;
        window.open(reportURL, '_blank');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!stats) return <div className="text-red-500 text-center mt-10">Error loading data</div>;

    const { overview, sections } = stats;

    const metrics = {
        'pending': { label: 'Pending Files', color: '#f59e0b', icon: Clock },
        'overdue': { label: 'Overdue Files', color: '#ef4444', icon: AlertTriangle },
        'completed': { label: 'Completed Files', color: '#10b981', icon: CheckCircle },
        'total': { label: 'Total Files', color: '#3b82f6', icon: FileText }
    };

    const pieData = [
        { name: 'Pending', value: overview.pending, color: '#f59e0b' },
        { name: 'Completed', value: overview.completed, color: '#10b981' },
        { name: 'Overdue', value: overview.overdue, color: '#ef4444' }
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-8 animate-fade-in-up pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-2">Real-time insights and file tracking metrics</p>
                </div>
                <div className="flex space-x-3 mt-6 md:mt-0">
                    <button
                        onClick={handleViewReport}
                        className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 font-bold py-2 px-4 rounded-xl shadow-sm flex items-center transition-all duration-300 transform hover:-translate-y-0.5 group"
                    >
                        <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        View Report
                    </button>
                    <button
                        onClick={handleDownloadReport}
                        disabled={downloading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {downloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        ) : (
                            <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        )}
                        {downloading ? 'Downloading...' : 'Download Report'}
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(metrics).map(([key, { label, color, icon: Icon }]) => (
                    <div key={key} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1.5 h-full`} style={{ backgroundColor: color }}></div>
                        <div className="flex justify-between items-start z-10 relative">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
                                <p className="text-4xl font-extrabold text-slate-800">{overview[key]}</p>
                            </div>
                            <div className={`p-3.5 rounded-2xl bg-opacity-10 transition-colors duration-300 shadow-sm ring-1 ring-inset`} style={{ backgroundColor: `${color}15`, color: color, ringColor: `${color}30` }}>
                                <Icon className="w-7 h-7" />
                            </div>
                        </div>
                        {/* Decorative Background Icon */}
                        <Icon className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none" style={{ color }} />
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section Performance Chart */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Section Performance</h2>
                            <p className="text-sm text-slate-500 mt-1">Breakdown by department</p>
                        </div>
                        <div className="relative">
                            <select
                                value={metric}
                                onChange={(e) => setMetric(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium transition-all cursor-pointer hover:bg-white"
                            >
                                {Object.entries(metrics).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                    itemStyle={{ color: '#1E293B', fontWeight: 600 }}
                                />
                                <Bar dataKey={metric} fill={metrics[metric].color} radius={[6, 6, 0, 0]} barSize={48} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* File Distribution Pie Chart */}
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">File Distribution</h2>
                        <p className="text-sm text-slate-500 mt-1">Status overview</p>
                    </div>
                    <div className="flex-1 min-h-[350px] flex flex-col justify-center items-center mt-4">
                        {pieData.length > 0 ? (
                            <div className="w-full h-80 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={6}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                            itemStyle={{ color: '#1E293B', fontWeight: 600 }}
                                        />
                                        <Legend verticalAlign="bottom" iconType="circle" height={36} wrapperStyle={{ bottom: 0, fontWeight: 500, color: '#64748B' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                                    <span className="text-5xl font-extrabold text-slate-800">{overview.total}</span>
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Total Files</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="bg-slate-50 rounded-full p-4 mb-3 inline-block">
                                    <FileText className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-medium">No files available yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats / Mini Cards Row (Optional - Add later if needed) */}

        </div>
    );
};

export default DashboardHome;
