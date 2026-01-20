import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import OAuthButtons from '../components/OAuthButtons';

const Login = () => {
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
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                throw authError;
            }

            // Store the session token
            if (data.session) {
                localStorage.setItem('supabase-token', data.session.access_token);
                localStorage.setItem('supabase-refresh-token', data.session.refresh_token);
            }

            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col justify-center px-6 py-12"
            style={{
                background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f5ff 25%, #faf5ff 50%, #f0f5ff 75%, #e0e7ff 100%)',
            }}
        >
            {/* Animated Background Orbs */}
            <motion.div
                className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    />
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-500 mt-1 text-sm">Sign in to your workspace</p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
                    onSubmit={handleSubmit}
                    className="glass-panel rounded-3xl p-6 space-y-5"
                >
                    {/* Email Input */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl text-gray-800 placeholder:text-gray-400"
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
                            className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl text-gray-800 placeholder:text-gray-400"
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
                        className="w-full py-4 btn-primary font-medium rounded-2xl flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </motion.form>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative my-6"
                >
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gradient-to-r from-transparent via-white/50 to-transparent text-gray-400">
                            Or continue with
                        </span>
                    </div>
                </motion.div>

                {/* OAuth Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <OAuthButtons
                        onSuccess={() => navigate('/')}
                        onError={(err) => setError(err)}
                    />
                </motion.div>

                {/* Sign Up Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <p className="text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </motion.div>

                {/* Developer Quick Login */}
                {import.meta.env.DEV && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 pt-6 border-t border-white/30"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                const devEmail = import.meta.env.VITE_DEV_EMAIL || 'test@example.com';
                                const devPass = import.meta.env.VITE_DEV_PASSWORD || 'password';
                                setEmail(devEmail);
                                setPassword(devPass);

                                setIsLoading(true);
                                supabase.auth.signInWithPassword({ email: devEmail, password: devPass })
                                    .then(({ data, error }) => {
                                        if (error) {
                                            setError('Dev login failed: ' + error.message);
                                            setIsLoading(false);
                                            return;
                                        }
                                        if (data.session) {
                                            localStorage.setItem('supabase-token', data.session.access_token);
                                            localStorage.setItem('supabase-refresh-token', data.session.refresh_token);
                                        }
                                        navigate('/');
                                    })
                                    .catch(() => {
                                        setError('Dev login failed. Check console/network.');
                                        setIsLoading(false);
                                    });
                            }}
                            className="w-full py-3 glass-button font-medium rounded-xl flex items-center justify-center gap-2 text-gray-600 text-sm"
                        >
                            <Lock size={14} />
                            Quick Dev Login
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Login;
