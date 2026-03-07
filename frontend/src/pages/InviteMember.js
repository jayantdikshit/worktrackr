import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

const InviteMember = () => {
    const [formData, setFormData] = useState({
        taskId: '', 
        userEmail: ''
    });
    const [tasks, setTasks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [taskRes, userRes] = await Promise.all([
                    API.get('/task'), 
                    API.get('/users') 
                ]);
                
                const userList = Array.isArray(userRes.data) ? userRes.data : (userRes.data.users || []);
                const taskList = Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data.tasks || []);

                setTasks(taskList);
                setAllUsers(userList);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.taskId || !formData.userEmail) {
            alert("Please select both a task and a member.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                taskId: Number(formData.taskId),
                userEmail: formData.userEmail.trim()
            };

            const response = await API.post('/task/assign', payload);
            alert(response.data.message || "Task Assigned Successfully! 🚀");
            navigate('/'); 
        } catch (err) {
            alert(err.response?.data?.message || "User not found or connection error.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] mb-8 uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-[2rem] mb-4 shadow-xl">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic">Assign Task</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Task</label>
                        <select 
                            required
                            className="block w-full px-4 py-4 mt-2 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-900"
                            value={formData.taskId}
                            onChange={(e) => setFormData({...formData, taskId: e.target.value})}
                        >
                            <option value="">Choose a task</option>
                            {tasks.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Member</label>
                        <select 
                            required
                            className="block w-full px-4 py-4 mt-2 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-900"
                            value={formData.userEmail}
                            onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                        >
                            <option value="">Choose a collaborator</option>
                            {allUsers.map(u => (
                                <option key={u.id} value={u.email}>
                                    {u.name} ({u.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Confirm Assignment</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InviteMember;