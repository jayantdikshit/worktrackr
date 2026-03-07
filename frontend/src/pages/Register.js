import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Loader2, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'MEMBER'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/auth/register', formData);
            alert("Registration Successful! Now please login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <UserPlus className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                        <p className="text-gray-500 mt-2">Join TaskMaster team management</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <User size={18} />
                                </span>
                                <input name="name" type="text" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Mail size={18} />
                                </span>
                                <input name="email" type="email" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input name="password" type="password" required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Register as...</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <ShieldCheck size={18} />
                                </span>
                                <select name="role" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange}>
                                    <option value="MEMBER">Team Member</option>
                                    <option value="ADMIN">Project Admin</option>
                                </select>
                            </div>
                        </div>

                        <button disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign Up"}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 p-4 border-t text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;