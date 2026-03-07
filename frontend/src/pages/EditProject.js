import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { 
    Loader2, Save, ArrowLeft, Briefcase, 
    AlertCircle, CheckCircle2, ChevronDown, Trash2
} from 'lucide-react';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [project, setProject] = useState({
        name: '',
        description: '',
        status: 'PENDING' 
    });
    const [error, setError] = useState(null);

    // 1. Fetch Existing Details
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/project/${id}`);
                if (response.data) {
                    setProject({
                        name: response.data.name || '',
                        description: response.data.description || '',
                        status: response.data.status || 'PENDING'
                    });
                }
            } catch (err) {
                setError("Project details fetch karne mein dikat hui.");
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
    }, [id]);

    // 2. Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!project.name.trim()) {
            alert("Name is required!");
            return;
        }

        try {
            setSaving(true);
            await API.put(`/project/${id}`, {
                name: project.name,
                description: project.description,
                status: project.status 
            });

            // SUCCESS: Yahan state pass karna zaroori hai refresh ke liye
            navigate('/', { state: { refresh: true }, replace: true }); 
        } catch (err) {
            alert(err.response?.data?.error || "Update failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // 3. Delete Logic
    const handleDelete = async () => {
        if (window.confirm("🚨 Kya aap sach mein isse delete karna chahte hain?")) {
            try {
                await API.delete(`/project/${id}`);
                // Delete ke baad bhi refresh state bhejein
                navigate('/', { state: { refresh: true }, replace: true });
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
            <p className="font-black text-blue-600 uppercase tracking-widest text-xs italic">Fetching Details...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md border border-red-50">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-gray-900 mb-2">Oops!</h2>
                <p className="text-gray-500 italic mb-6">{error}</p>
                <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans p-4 lg:p-12">
            <div className="max-w-3xl mx-auto">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-gray-400 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-[0.2em]">
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        Back to List
                    </button>
                    <button onClick={handleDelete} className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-all font-black text-[10px] uppercase italic">
                        <Trash2 size={14} /> Delete Entry
                    </button>
                </div>

                <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 lg:p-14">
                        {/* Title Section */}
                        <div className="flex items-center gap-6 mb-12">
                            <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl ring-4 transition-all duration-500 ${
                                project.status === 'COMPLETED' ? 'bg-emerald-500 ring-emerald-50 shadow-emerald-100' : 
                                project.status === 'IN_PROGRESS' ? 'bg-blue-500 ring-blue-50 shadow-blue-100' : 
                                'bg-amber-500 ring-amber-50 shadow-amber-100'
                            }`}>
                                <Briefcase size={36} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Edit Project</h1>
                                <p className="text-gray-400 font-medium italic text-sm">Update title, status and description</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Project Name */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">
                                    Project Name <CheckCircle2 size={12} className="text-emerald-500" />
                                </label>
                                <input 
                                    type="text"
                                    value={project.name}
                                    onChange={(e) => setProject({...project, name: e.target.value})}
                                    className="w-full p-6 bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-gray-800 transition-all text-lg"
                                    placeholder="e.g. Website Redesign"
                                    required
                                />
                            </div>

                            {/* Status Selector */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">
                                    Current Status
                                </label>
                                <div className="relative">
                                    <select 
                                        value={project.status}
                                        onChange={(e) => setProject({...project, status: e.target.value})}
                                        className={`w-full p-6 border-2 rounded-[2rem] outline-none font-black uppercase tracking-widest text-sm appearance-none cursor-pointer focus:border-blue-500 transition-all shadow-sm ${
                                            project.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                            project.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                            'bg-amber-50 border-amber-100 text-amber-600'
                                        }`}
                                    >
                                        <option value="PENDING">🕒 Pending / To Do</option>
                                        <option value="IN_PROGRESS">🚀 In Progress</option>
                                        <option value="COMPLETED">✅ Completed</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                        <ChevronDown size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2 block">
                                    Project Description
                                </label>
                                <textarea 
                                    rows="4"
                                    value={project.description}
                                    onChange={(e) => setProject({...project, description: e.target.value})}
                                    className="w-full p-6 bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] focus:bg-white focus:border-blue-500 outline-none font-medium text-gray-600 transition-all resize-none"
                                    placeholder="Enter details about the project..."
                                />
                            </div>

                            {/* Submit Section */}
                            <div className="pt-6">
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:bg-gray-200"
                                >
                                    {saving ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <><Save size={24} /><span>Save Changes</span></>
                                    )}
                                </button>
                                <p className="text-center mt-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">
                                    Last Updated Trace ID: {id.substring(0,8)}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProject;