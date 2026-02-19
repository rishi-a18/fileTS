import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, AlertTriangle, CheckCircle, FileText, SquareCheck, Trash2, X } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'Completed':
            return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
        case 'Overdue':
            return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full flex items-center w-fit"><AlertTriangle className="w-3 h-3 mr-1" /> Overdue</span>;
        case 'Pending':
            return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        default:
            return <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">{status}</span>;
    }
}

const PriorityBadge = ({ priority }) => {
    let color = 'bg-gray-100 text-gray-800';
    if (priority === 'Critical') color = 'bg-red-200 text-red-800';
    if (priority === 'High') color = 'bg-orange-200 text-orange-800';
    if (priority === 'Medium') color = 'bg-blue-200 text-blue-800';
    if (priority === 'Low') color = 'bg-green-200 text-green-800';

    return <span className={`px-2 py-1 text-xs font-semibold rounded ${color}`}>{priority}</span>;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!remarks.trim()) {
            setError('Remarks are mandatory for deletion.');
            return;
        }
        onConfirm(remarks);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Delete File</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <p className="text-slate-600 mb-4">
                    Are you sure you want to delete this file? This action will move the file to the "Deleted Files" archive.
                    <br/><span className="text-xs text-slate-500 mt-1 block">Remarks are mandatory.</span>
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Deletion Remarks</label>
                    <textarea
                        value={remarks}
                        onChange={(e) => {
                            setRemarks(e.target.value);
                            setError('');
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${error ? 'border-red-500' : 'border-slate-300'}`}
                        rows="3"
                        placeholder="Why is this file being deleted?"
                    ></textarea>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center"
                    >
                        {loading ? 'Deleting...' : 'Delete File'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [actionLoading, setActionLoading] = useState(null);
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchFiles = async () => {
        try {
            const response = await api.get('/file/');
            setFiles(response.data.files);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleMarkComplete = async (fileId) => {
        if (!window.confirm("Are you sure you want to mark this file as completed?")) return;

        setActionLoading(fileId);
        try {
            await api.put(`/file/${fileId}/complete`);
            // Refresh list locally
            setFiles(files.map(f => f.id === fileId ? { ...f, status: 'Completed', completion_date: new Date().toISOString() } : f));
        } catch (error) {
            console.error("Error completing file", error);
            alert("Failed to complete file. Permission denied?");
        } finally {
            setActionLoading(null);
        }
    };

    const initiateDelete = (file) => {
        setFileToDelete(file);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async (remarks) => {
        if (!fileToDelete) return;
        
        setDeleteLoading(true);
        try {
            await api.post(`/file/${fileToDelete.id}/delete`, { remarks });
            
            // Remove from list locally
            setFiles(files.filter(f => f.id !== fileToDelete.id));
            setIsDeleteModalOpen(false);
            setFileToDelete(null);
        } catch (error) {
            console.error("Error deleting file", error);
            alert("Failed to delete file. Permission denied?");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleView = async (fileId) => {
        try {
            const response = await api.get(`/file/${fileId}/view`, {
                responseType: 'blob'
            });

            // Create Blob with correct type
            const contentType = response.headers['content-type'];
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            // Open in new tab
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            // link.download = 'filename'; // Don't match filename if we want to view
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error("Error viewing file", error);
            alert("Failed to view file. It might be blocked by a popup blocker.");
        }
    };

    const canComplete = (file) => {
        if (file.status === 'Completed') return false;
        if (user.role === 'Admin' || user.role === 'Collector') return true;
        if (user.role === 'Section Officer' && user.section === file.section) return true;
        return false;
    };

    const canDelete = (file) => {
        if (user.role === 'Admin' || user.role === 'Collector') return true;
        if (user.role === 'Section Officer' && user.section === file.section) return true;
        return false;
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Tracked Files</h2>
                {/* Potential filter or action buttons here */}
            </div>

            <div className="bg-white shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {['File Name', 'Section', 'Priority', 'Status', 'App Date', 'Upload Date', 'Deadline', 'Actions'].map((header) => (
                                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {files.length > 0 ? (
                                files.map((file) => (
                                    <tr key={file.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center group">
                                                <div className="p-2 bg-blue-50 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
                                                    <FileText className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div className="text-sm font-semibold text-slate-700">{file.filename}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            <span className="px-2 py-1 bg-slate-100 rounded-md text-slate-600 text-xs">
                                                {file.section}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4"><PriorityBadge priority={file.priority} /></td>
                                        <td className="px-6 py-4"><StatusBadge status={file.status} /></td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {file.extracted_date ? new Date(file.extracted_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {file.upload_date ? new Date(file.upload_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {file.sla_deadline ? (
                                                <span className={`${new Date(file.sla_deadline) < new Date() && file.status !== 'Completed' ? 'text-red-500 font-medium' : ''}`}>
                                                    {new Date(file.sla_deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleView(file.id)}
                                                    className="flex items-center px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-xs font-semibold"
                                                >
                                                    <FileText className="w-3.5 h-3.5 mr-1.5" /> View
                                                </button>

                                                {canComplete(file) && (
                                                    <button
                                                        onClick={() => handleMarkComplete(file.id)}
                                                        disabled={actionLoading === file.id}
                                                        className="flex items-center px-3 py-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-xs font-semibold disabled:opacity-50"
                                                    >
                                                        {actionLoading === file.id ? '...' : <><SquareCheck className="w-3.5 h-3.5 mr-1.5" /> Mark Done</>}
                                                    </button>
                                                )}

                                                {canDelete(file) && (
                                                    <button
                                                        onClick={() => initiateDelete(file)}
                                                        className="flex items-center px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-xs font-semibold"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 mb-3 text-slate-200" />
                                            <p>No files found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-right text-xs text-slate-400 mt-4">
                Showing {files.length} records
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                loading={deleteLoading}
            />
        </div>
    );
};

export default FileList;
