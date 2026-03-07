import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Loader2, LayoutGrid } from 'lucide-react';

const CreateProject = () => {
    const [projectData, setProjectData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Pura URL: http://localhost:5000/api/project/create
            await API.post('/project/create', projectData);
            alert("Project Created Successfully!");
            navigate('/');
        } catch (err) {
            console.error("Project Creation Error:", err.response?.data);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error creating project";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center">
            <div className="w-full max-w-xl">
                <button 
                    onClick={() => navigate('/')} 
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 font-bold transition-all"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-3xl mb-4">
                            <Briefcase className="text-blue-600" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Initialize Project</h2>
                        <p className="text-gray-500 font-medium mt-2">Create a new container for your team's tasks</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Project Name</label>
                            <div className="relative">
                                <LayoutGrid className="absolute left-4 top-4 text-gray-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Mobile App Development" 
                                    className="w-full pl-12 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700" 
                                    value={projectData.name}
                                    onChange={e => setProjectData({...projectData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description</label>
                            <textarea 
                                placeholder="What is this project about?" 
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32 font-medium text-gray-600" 
                                value={projectData.description}
                                onChange={e => setProjectData({...projectData, description: e.target.value})} 
                            />
                        </div>

                        <button 
                            disabled={loading}
                            type="submit" 
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-100 disabled:bg-blue-300 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Create Project Container"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProject;