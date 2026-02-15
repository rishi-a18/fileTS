import React, { useState } from 'react';
import api from '../services/api';
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [section, setSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage(null);
        setUploadProgress(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !section) {
            setMessage({ type: 'error', text: 'Please select a file and a section.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('section_id', section);

        setLoading(true);
        setUploadProgress(0);

        try {
            await api.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            setMessage({ type: 'success', text: 'File uploaded successfully!' });
            setFile(null);
            setSection('');
            // Reset progress after a short delay to keep the success state visible or reset for next
            setTimeout(() => setUploadProgress(0), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    // Mock sections for dropdown (IDs 1-8 for A-H)
    const sections = [
        { id: 1, name: 'Section A' },
        { id: 2, name: 'Section B' },
        { id: 3, name: 'Section C' },
        { id: 4, name: 'Section D' },
        { id: 5, name: 'Section E' },
        { id: 6, name: 'Section F' },
        { id: 7, name: 'Section G' },
        { id: 8, name: 'Section H' },
    ];

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <Upload className="mr-3 text-blue-600" /> Upload New File
            </h2>

            {message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center border ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                    {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {loading && (
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-blue-700">Uploading...</span>
                        <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    {uploadProgress === 100 && (
                        <p className="text-center text-green-600 text-sm mt-2 font-semibold">Processing complete!</p>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Select Section</label>
                    <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                    >
                        <option value="">-- Select Section --</option>
                        {sections.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Choose File</label>
                    <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {file ? (
                                    <>
                                        <FileText className="w-10 h-10 text-blue-500 mb-2" />
                                        <p className="text-sm text-blue-700 font-semibold">{file.name}</p>
                                        <p className="text-xs text-blue-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-bold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">PDF, DOCX, Images (MAX. 10MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.98] ${loading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30'}`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Uploading...
                        </span>
                    ) : 'Upload File'}
                </button>
            </form>
        </div>
    );
};

export default FileUpload;
