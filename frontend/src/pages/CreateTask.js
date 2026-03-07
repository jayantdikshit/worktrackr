import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ListPlus, Loader2, ArrowLeft, Calendar, Flag, User, Briefcase, Activity, Save } from 'lucide-react';

const CreateTask = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { taskId } = useParams(); 
    
    // Check if we are in Edit Mode  
    const editTaskData = location.state?.task;
    
    const [taskData, setTaskData] = useState({
        title: editTaskData?.title || '',
        description: editTaskData?.description || '',
        priority: editTaskData?.priority || 'MEDIUM', // Fixed typo: editTskData -> editTaskData
        status: editTaskData?.status || 'TODO', 
        projectId: editTaskData?.projectId || location.state?.projectId || '',
        assignedToId: editTaskData?.assignedToId || '',
        dueDate: editTaskData?.dueDate ? new Date(editTaskData.dueDate).toISOString().split('T')[0] : ''
    });
    
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [projRes, userRes] = await Promise.all([
                    API.get('/project'),
                    API.get('/users')    
                ]);

                // Backend response formats handle kar rahe hain
                setProjects(projRes.data.projects || projRes.data || []);
                setMembers(userRes.data.users || userRes.data || []);

                if (editTaskData?.assignedToId) {
                    setTaskData(prev => ({...prev, assignedToId: editTaskData.assignedToId.toString()}));
                }
            } catch (err) {
                console.error("Fetch Dropdown Error:", err);
            } finally {
                setFetchingData(false);
            }
        };
        fetchDropdownData();
    }, [editTaskData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!taskData.projectId || !taskData.assignedToId || !taskData.dueDate) {
            alert("Kripya Project, Member aur Due Date select karein.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: taskData.title.trim(),
                description: taskData.description.trim(),
                priority: taskData.priority,
                status: taskData.status,
                projectId: parseInt(taskData.projectId),
                assignedToId: parseInt(taskData.assignedToId),
                dueDate: new Date(taskData.dueDate).toISOString()
            };

            const idToUpdate = taskId || editTaskData?.id;

            if (idToUpdate) {
                // UPDATE LOGIC
                await API.patch(`/task/update/${idToUpdate}`, payload);
                alert("Task successfully updated!");
            } else {    
                // CREATE LOGIC
                await API.post('/task/create', payload); 
                alert("Task successfully created!");
            }
            
            navigate(`/project/${taskData.projectId}`);
        } catch (err) {
            console.error("Operation Error:", err.response?.data);
            alert(err.response?.data?.details || err.response?.data?.error || "Error processing task.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold italic">
                <Loader2 className="animate-spin mr-3" size={40} /> INITIALIZING TASK INTERFACE...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
            <div className="w-full max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest transition-all">
                    <ArrowLeft size={16} /> Go Back
                </button>
                
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 tracking-tighter uppercase italic">
                        <ListPlus className="text-blue-600" size={32}/> 
                        {taskId || editTaskData ? 'Modify Task' : 'Create Task'}
                    </h2>
                    <p className="text-gray-400 font-medium text-sm mt-1">
                        {taskId || editTaskData ? 'Update existing operational parameters' : 'Assign new task to your team members'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Task Title</label>
                        <input 
                            type="text"
                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold transition-all shadow-inner"
                            value={taskData.title}
                            onChange={e => setTaskData({...taskData, title: e.target.value})}
                            required 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea 
                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none h-28 font-medium transition-all shadow-inner resize-none"
                            value={taskData.description}
                            onChange={e => setTaskData({...taskData, description: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Briefcase size={14}/> Project
                            </label>
                            <select 
                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-700"
                                value={taskData.projectId}
                                onChange={e => setTaskData({...taskData, projectId: e.target.value})}
                                required
                                disabled={!!editTaskData}
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <User size={14}/> Assign Member
                            </label>
                            <select 
                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-700"
                                value={taskData.assignedToId}
                                onChange={e => setTaskData({...taskData, assignedToId: e.target.value})}
                                required
                            >
                                <option value="">Choose Member</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><Flag size={14}/> Priority</label>
                            <select 
                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-black text-[10px] uppercase text-blue-600"
                                value={taskData.priority}
                                onChange={e => setTaskData({...taskData, priority: e.target.value})}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><Activity size={14}/> Status</label>
                            <select 
                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-700"
                                value={taskData.status}
                                onChange={e => setTaskData({...taskData, status: e.target.value})}
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><Calendar size={14}/> Due Date</label>
                            <input 
                                type="date"
                                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-700"
                                value={taskData.dueDate}
                                onChange={e => setTaskData({...taskData, dueDate: e.target.value})}
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transition-all flex justify-center items-center shadow-xl shadow-blue-100 disabled:bg-blue-300"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : (
                            <span className="flex items-center gap-2">
                                <Save size={18}/> {taskId || editTaskData ? "Update Task" : "Confirm Assignment"}
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;