import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await API.post('/auth/login', { email, password });
            dispatch(loginSuccess(res.data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password. Please try again.");
            console.error("Login Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <LogIn className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 mt-2 font-medium italic">TaskMaster Workspace Login</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm animate-pulse">
                            <AlertCircle size={18} />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Mail size={20} />
                                </span>
                                <input 
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="admin@taskmaster.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Lock size={20} />
                                </span>
                                <input 
                                    type="password"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.1em] hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl disabled:bg-gray-400"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Verifying...</span>
                                </>
                            ) : "Sign In to Workspace"}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50 p-6 border-t text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        Don't have an account? <Link to="/register" className="text-blue-600 font-black hover:underline underline-offset-4">REGISTER NOW</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;