import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2, AlertCircle, Briefcase, User, ListPlus } from 'lucide-react';

const EditTask = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: '',
        projectId: '',
        assignedToId: ''
    });
    
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAndAutoFill = async () => {
            try {
                setLoading(true);
                
                const [taskRes, projectsRes, usersRes] = await Promise.all([
                    API.get(`/task/${id}`),
                    API.get('/project'),
                    API.get('/users') 
                ]);

                const task = taskRes.data;

                
                const projectsData = projectsRes.data.projects || projectsRes.data || [];
                const membersData = usersRes.data.users || usersRes.data || [];

                setProjects(projectsData);
                setMembers(membersData);

                if (task) {
                    setFormData({
                        title: task.title || '',
                        description: task.description || '',
                        priority: task.priority || 'MEDIUM',
                        status: task.status || 'TODO',
                        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                        projectId: task.projectId?.toString() || '',
                        assignedToId: task.assignedToId?.toString() || ''
                    });
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Data sync fail ho gaya. Backend connectivity check karein.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAndAutoFill();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                status: formData.status,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                projectId: parseInt(formData.projectId),
                assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : null
            };

            await API.patch(`/task/update/${id}`, payload);
            navigate(-1); 
        } catch (err) {
            console.error("Submit error:", err.response?.data);
            setError(err.response?.data?.details || err.response?.data?.error || "Update fail ho gaya.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Parameters...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12 transition-colors">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-10">
                
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-8 font-bold text-xs uppercase tracking-widest transition-all">
                    <ArrowLeft size={16} /> GO BACK
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="h-14 w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <ListPlus size={28} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Modify Task</h2>
                        <p className="text-slate-400 font-bold text-xs italic tracking-tight">Updating operational data</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center gap-2">
                        <AlertCircle size={18}/> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Task Title</label>
                        <input 
                            id="title"
                            name="title"
                            type="text" 
                            required 
                            className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white font-bold focus:ring-2 focus:ring-blue-600 outline-none" 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Description</label>
                        <textarea 
                            id="description"
                            name="description"
                            rows="3" 
                            className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl dark:text-white font-medium resize-none focus:ring-2 focus:ring-blue-600 outline-none" 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="projectId" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2"><Briefcase size={12}/> Project</label>
                            <select 
                                id="projectId"
                                name="projectId"
                                required 
                                className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white font-bold cursor-pointer outline-none" 
                                value={formData.projectId} 
                                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="assignedToId" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2"><User size={12}/> Assigned To</label>
                            <select 
                                id="assignedToId"
                                name="assignedToId"
                                required 
                                className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white font-bold cursor-pointer outline-none" 
                                value={formData.assignedToId} 
                                onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                            >
                                <option value="">Choose Member</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="priority" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Priority</label>
                            <select 
                                id="priority"
                                name="priority"
                                className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white font-black text-[10px] outline-none" 
                                value={formData.priority} 
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="HIGH">🔴 HIGH</option>
                                <option value="MEDIUM">🟡 MEDIUM</option>
                                <option value="LOW">🔵 LOW</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Status</label>
                            <select 
                                id="status"
                                name="status"
                                className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white font-black text-[10px] outline-none" 
                                value={formData.status} 
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Due Date</label>
                            <input 
                                id="dueDate"
                                name="dueDate"
                                type="date" 
                                className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl dark:text-white font-bold text-xs outline-none" 
                                value={formData.dueDate} 
                                onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={saving} 
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'UPDATING...' : 'SAVE MODIFICATIONS'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default EditTask;