import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertTriangle, Clock, FileText, ArrowRight } from 'lucide-react';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await api.get('/dashboard/alerts');
                setAlerts(response.data);
            } catch (error) {
                console.error("Error fetching alerts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 tracking-tight flex items-center">
                        <AlertTriangle className="w-10 h-10 mr-3 text-red-500" />
                        SLA Alerts
                    </h1>
                    <p className="text-slate-500 mt-2">Files pending for more than 50% of SLA time</p>
                </div>
            </div>

            {alerts.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <div className="bg-green-50 rounded-full p-4 mb-4 inline-block">
                        <Clock className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No Active Alerts</h3>
                    <p className="text-slate-500 mt-2">All files are within safe SLA limits. Great job!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {alerts.map((file) => (
                        <div key={file.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${file.time_left === 'Overdue' ? 'bg-red-600' : 'bg-orange-500'}`}></div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${file.priority === 'High' || file.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {file.priority}
                                        </span>
                                        <span className="text-slate-400 text-xs font-medium">ID: #{file.id}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-slate-400" />
                                        {file.filename}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Section <span className="font-semibold text-slate-700">{file.section}</span> • Uploaded: {file.upload_date}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="flex-1 md:flex-none">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Elapsed</span>
                                            <span className={`text-sm font-bold ${file.percentage >= 100 ? 'text-red-600' : 'text-orange-600'}`}>{file.percentage}%</span>
                                        </div>
                                        <div className="w-full md:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${file.percentage >= 100 ? 'bg-red-600' : 'bg-orange-500'}`}
                                                style={{ width: `${Math.min(file.percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="text-right min-w-[100px]">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Time Left</p>
                                        <p className={`text-xl font-extrabold ${file.time_left === 'Overdue' ? 'text-red-600' : 'text-slate-700'}`}>
                                            {file.time_left}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Alerts;
