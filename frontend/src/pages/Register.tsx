import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';

const Register = () => {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/users/register', { nickname, email, password });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col justify-center px-6 py-12">
            {/* Animated Background Orbs */}
            <motion.div
                className="absolute top-32 right-10 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl"
                animate={{
                    scale: [1.1, 1, 1.1],
                    opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="w-full max-w-sm mx-auto z-10">
                {/* Logo & Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="text-center mb-10"
                >
                    <motion.img
                        src="/logo.svg"
                        alt="Tiga"
                        className="h-20 w-auto mx-auto mb-6 drop-shadow-xl"
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    />
                    <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
                    <p className="text-gray-500 mt-1 text-sm">Start your productivity journey</p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Name Input */}
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Your name"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-indigo-500 text-white font-medium rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-70 shadow-lg shadow-indigo-500/25"
                    >
                        {isLoading ? (
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        ) : (
                            <>
                                Create Account
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </motion.form>

                {/* Sign In Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <p className="text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
