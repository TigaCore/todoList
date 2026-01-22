import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../api/supabase';

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
        <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12 bg-[#F8F6F3]">
            <div className="w-full max-w-sm mx-auto z-10">
                {/* Logo & Title */}
                <div className="text-center mb-12">
                    <img
                        src="/logo.svg"
                        alt="Tiga"
                        className="h-16 w-auto mx-auto mb-8 shadow-sm rounded-[24px]"
                    />
                    <h1 className="text-3xl font-medium text-[#2D2A26] tracking-tight">Welcome back</h1>
                    <p className="text-[#6B6560] mt-3 text-sm tracking-wide uppercase font-medium">Sign in to your workspace</p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Email Input */}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D2A26] transition-colors" size={18} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-xl text-[#2D2A26] placeholder:text-gray-400 focus:ring-1 focus:ring-[#E7E5E4] transition-all shadow-sm"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D2A26] transition-colors" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-xl text-[#2D2A26] placeholder:text-gray-400 focus:ring-1 focus:ring-[#E7E5E4] transition-all shadow-sm"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-[#B85450] text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[#2D2A26] text-[#EFEBE7] font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-[#1C1A17] transition-all disabled:opacity-70 shadow-lg shadow-gray-200"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#F8F6F3] text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <OAuthButtons />
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-[#2D2A26] hover:underline">
                        Create account
                    </Link>
                </p>

                {/* Developer Quick Login */}
                {import.meta.env.DEV && (
                    <div className="mt-8 pt-6 border-t border-gray-200/60">
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
                                            setError('Dev login failed');
                                            setIsLoading(false);
                                            return;
                                        }
                                        if (data.session) {
                                            localStorage.setItem('supabase-token', data.session.access_token);
                                            localStorage.setItem('supabase-refresh-token', data.session.refresh_token);
                                        }
                                        navigate('/');
                                    })
                                    .catch(() => setIsLoading(false));
                            }}
                            className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Lock size={12} />
                            Quick Dev Access
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
