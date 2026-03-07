import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useSelector } from 'react-redux';
import { ArrowLeft, Edit2, Trash2, Calendar, User, Plus, AlertCircle } from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    const fetchDetails = useCallback(async () => {
        try {
            const res = await API.get(`/project/${id}`);
            setProject(res.data);
        } catch (err) {
            console.error("Project details fetching error", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await API.delete(`/task/${taskId}`);
                fetchDetails();
            } catch (err) {
                alert("Error deleting task");
            }
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await API.patch(`/task/status/${taskId}`, { status: newStatus });
            fetchDetails();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold italic">
            LOADING PROJECT ENGINE...
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold uppercase text-xs"
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                {isAdmin && (
                    <button 
                        onClick={() => navigate('/create-task', { state: { projectId: id } })}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase hover:bg-blue-700 shadow-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> New Task
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 mb-10">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Project Matrix</span>
                        <h1 className="text-4xl font-black text-gray-900 mt-3">{project?.name || 'Untitled Project'}</h1>
                        <p className="text-gray-500 mt-2 font-medium">{project?.description || 'No description provided.'}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-lg font-black text-gray-800 mb-6 px-2 italic uppercase tracking-tight">Active Tasks</h2>

            <div className="grid gap-4">
                {project?.tasks && project.tasks.length > 0 ? (
                    project.tasks.map((task) => (
                        <div key={task.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm group">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                        task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 
                                        task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {task.priority}
                                    </span>
                                    <h3 className="font-bold text-gray-800 text-lg tracking-tight">{task.title}</h3>
                                </div>
                                <div className="flex gap-5 text-gray-400 text-[10px] font-bold uppercase">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} /> 
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-blue-500">
                                        <User size={14} /> 
                                        {task.assignedTo?.name || 'Unassigned'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <select 
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    className="text-[10px] font-black uppercase border-2 border-gray-50 rounded-xl px-3 py-2 outline-none bg-gray-50"
                                >
                                    <option value="TODO">Todo</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>

                                {isAdmin && (
                                    <div className="flex items-center gap-1 border-l border-gray-100 pl-4 ml-2">
                                        <button 
                                            onClick={() => navigate(`/edit-task/${task.id}`, { state: { task } })}
                                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <AlertCircle className="text-gray-300" size={40} />
                        <div>
                            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Zero tasks deployed</p>
                            {isAdmin && <p className="text-blue-500 text-[10px] font-bold mt-1">Click '+ New Task' to begin.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;