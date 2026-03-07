import React, { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LogOut, Briefcase, CheckCircle, 
    Clock, Plus, TrendingUp, ListPlus, AlertCircle, User, LayoutDashboard,
    Pencil, Trash2, RefreshCcw, Moon, Sun, Loader2, CheckSquare, Square, ClipboardList, Layers
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({ 
        totalTasks: 0, completedTasks: 0, pendingTasks: 0, assignedToMe: 0, overdueTasks: 0 
    });
    const [projects, setProjects] = useState([]);
    const [allTasks, setAllTasks] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Theme Logic
    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const sortTasksByPriority = useCallback((tasks) => {
        const priorityMap = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        return [...tasks].sort((a, b) => 
            (priorityMap[a.priority] || 4) - (priorityMap[b.priority] || 4)
        );
    }, []);

    // Fetch Dashboard Data
    const fetchDashboardData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setIsRefreshing(true);
        try {
            const [statsRes, projectsRes, tasksRes] = await Promise.all([
                API.get('/dashboard/analytics').catch(() => ({ data: { success: false } })),
                API.get('/project').catch(() => ({ data: [] })),
                API.get('/task').catch(() => ({ data: [] })) 
            ]);
            
            if (statsRes.data && statsRes.data.success) {
                const d = statsRes.data.data;
                setStats({
                    totalTasks: d.totalTasks || 0,
                    completedTasks: d.completed || 0,
                    pendingTasks: d.pending || 0,
                    assignedToMe: d.assignedToMe || 0,
                    overdueTasks: d.overdue || 0 
                });
            }

            const projectList = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.projects || []);
            setProjects(projectList);
            
            const taskData = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data?.tasks || []);
            const sorted = sortTasksByPriority(taskData);
            setAllTasks(sorted);

        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [sortTasksByPriority]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleToggleStatus = async (taskId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
            await API.patch(`/task/status/${taskId}`, { status: newStatus });
            fetchDashboardData(false);
        } catch (err) {
            alert(err.response?.data?.error || "Permission Denied: Only assigned users can update status.");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Delete this task?")) {
            try {
                await API.delete(`/task/${taskId}`);
                fetchDashboardData(false);
            } catch (err) {
                alert("Only Admins can delete tasks.");
            }
        }
    };

    const handleDeleteProject = async (e, id) => {
        e.preventDefault(); e.stopPropagation();
        if (window.confirm("🚨 Delete project and all tasks?")) {
            try {
                setIsRefreshing(true);
                await API.delete(`/project/${id}`);
                fetchDashboardData(false); 
            } catch (err) {
                alert("Only Project Owner/Admin can delete projects.");
            } finally {
                setIsRefreshing(false);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Engine...</p>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col fixed h-full z-30 shadow-sm">
                <div className="p-8 pb-4 flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                        <TrendingUp size={22} strokeWidth={3} />
                    </div>
                    <span className="font-black text-2xl tracking-tighter italic dark:text-white">TASKMASTER</span>
                </div>
                
                <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
                    <SidebarLabel label="Navigation" />
                    <NavItem icon={<LayoutDashboard size={20}/>} label="Analytics" active onClick={() => navigate('/')} />
                    
                    {user?.role === 'ADMIN' && (
                        <>
                            <SidebarLabel label="Management" className="mt-8" />
                            <NavItem icon={<Plus size={20}/>} label="New Project" onClick={() => navigate('/create-project')} />
                            <NavItem icon={<ListPlus size={20}/>} label="Create Tasks" onClick={() => navigate('/create-task')} />
                            {/* Assign Member & Team Roles Removed as requested */}
                        </>
                    )}
                    
                    <SidebarLabel label="Personal" className="mt-8" />
                    <NavItem icon={<CheckCircle size={20}/>} label="My Workload" onClick={() => navigate('/my-tasks')} />
                    
                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-4 w-full p-4 text-slate-400 dark:text-slate-500 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-all">
                            {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
                            <span>{darkMode ? 'Light' : 'Dark'} Mode</span>
                        </button>
                        <button onClick={() => dispatch(logout())} className="flex items-center gap-4 w-full p-4 mt-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <div className="h-2 w-2 bg-current rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">System Live</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={() => fetchDashboardData(false)} className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                            <RefreshCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black uppercase tracking-tighter dark:text-white leading-none mb-1">
                                    {user?.name || "Member"}
                                </p>
                                <p className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md inline-block ${user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {user?.role}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
                    
                    {/* Stat Cards - Adjusted spacing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard label="Total Tasks" value={stats.totalTasks} icon={<Briefcase size={18}/>} theme="blue" />
                        <StatCard label="Completed" value={stats.completedTasks} icon={<CheckCircle size={18}/>} theme="emerald" />
                        <StatCard label="Pending" value={stats.pendingTasks} icon={<Clock size={18}/>} theme="amber" />
                        <StatCard label="My Tasks" value={stats.assignedToMe} icon={<User size={18}/>} theme="indigo" />
                        <StatCard label="Overdue" value={stats.overdueTasks} icon={<AlertCircle size={18}/>} theme="rose" alert={stats.overdueTasks > 0} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* Task List Section - 8 Columns */}
                        <div className="xl:col-span-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 dark:text-white">
                                    <ClipboardList size={22} className="text-blue-600" /> All Priority Tasks
                                </h3>
                                <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full dark:text-slate-400">
                                    {allTasks.length} TOTAL
                                </span>
                            </div>

                            <div className="grid gap-3">
                                <AnimatePresence mode="popLayout">
                                    {allTasks.length > 0 ? allTasks.map((task) => (
                                        <TaskListItem 
                                            key={task.id} 
                                            task={task} 
                                            currentUser={user}
                                            onToggle={() => handleToggleStatus(task.id, task.status)}
                                            onEdit={() => navigate(`/edit-task/${task.id}`)}
                                            onDelete={() => handleDeleteTask(task.id)}
                                        />
                                    )) : (
                                        <div className="p-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                                            <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No active tasks found.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Projects Sidebar - 4 Columns */}
                        <div className="xl:col-span-4 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 dark:text-white">
                                    <Layers size={22} className="text-blue-600" /> Projects
                                </h3>
                                {user?.role === 'ADMIN' && (
                                    <button onClick={() => navigate('/create-project')} className="text-blue-600 hover:bg-blue-50 p-1 rounded-lg transition-all">
                                        <Plus size={20} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                {projects.length > 0 ? projects.map((p) => (
                                    <ProjectSmallCard 
                                        key={p.id} 
                                        project={p} 
                                        isAdmin={user?.role === 'ADMIN'}
                                        onClick={() => navigate(`/project/${p.id}`)}
                                        onEdit={() => navigate(`/edit-project/${p.id}`)}
                                        onDelete={(e) => handleDeleteProject(e, p.id)}
                                    />
                                )) : (
                                    <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] text-center border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] text-slate-400 font-black uppercase">No active projects</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

// --- SUB COMPONENTS ---

const ProjectSmallCard = ({ project, onClick, onDelete, onEdit, isAdmin }) => (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-xl hover:scale-[1.02] cursor-pointer group flex items-center justify-between transition-all">
        <div onClick={onClick} className="flex items-center gap-4 truncate flex-1">
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                <Briefcase size={16} />
            </div>
            <div className="truncate">
                <p className="font-black text-xs uppercase tracking-tight truncate dark:text-white">{project.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{project.status || 'Active'}</p>
            </div>
        </div>
        {isAdmin && (
            <div className="flex gap-1 ml-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-500 transition-all"><Pencil size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(e); }} className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
            </div>
        )}
    </div>
);

const SidebarLabel = ({ label, className }) => <p className={`text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 ml-4 ${className}`}>{label}</p>;

const NavItem = ({ icon, label, active = false, onClick }) => (
    <div onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}>
        {icon} <span>{label}</span>
    </div>
);

const TaskListItem = ({ task, onToggle, onEdit, onDelete, currentUser }) => {
    const isCompleted = task.status === 'COMPLETED';
    const isAdmin = currentUser?.role === 'ADMIN';
    const currentUserId = currentUser?.id || currentUser?._id;
    const assigneeId = task.assignedToId || task.assignedTo?.id;
    const canUpdate = isAdmin || (currentUserId && String(currentUserId) === String(assigneeId));

    const priorityColors = {
        HIGH: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        MEDIUM: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        LOW: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    };

    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:border-blue-100 dark:hover:border-blue-900/30 ${isCompleted ? 'opacity-60 grayscale' : ''}`}>
            <button 
                onClick={canUpdate ? onToggle : undefined} 
                className={`${canUpdate ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-20'} text-slate-300 transition-all shrink-0`}
            >
                {isCompleted ? <CheckSquare size={24} className="text-emerald-500" /> : <Square size={24} />}
            </button>
            
            <div className="flex-1 min-w-0 text-left">
                <h4 className={`font-black text-sm truncate dark:text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>{task.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{task.project?.name || 'General Task'}</p>
                    <div className="h-1 w-1 bg-slate-300 rounded-full" />
                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 italic">@{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                
                {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all border-l border-slate-100 dark:border-slate-800 pl-2">
                        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-amber-500 transition-colors"><Pencil size={14}/></button>
                        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const StatCard = ({ label, value, icon, theme, alert }) => {
    const themes = { blue: 'bg-blue-600', emerald: 'bg-emerald-500', amber: 'bg-amber-500', indigo: 'bg-indigo-600', rose: 'bg-rose-500' };
    return (
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 ${alert ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-slate-950' : ''}`}>
            <div className={`h-10 w-10 rounded-xl ${themes[theme]} flex items-center justify-center text-white shadow-lg mb-4`}>{icon}</div>
            <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 leading-tight">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
            </div>
        </div>
    );
};

export default Dashboard;