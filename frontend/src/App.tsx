import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
    const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
        const token = localStorage.getItem('supabase-token');
        return token ? children : <Navigate to="/login" />;
    };

    return (
        <ThemeProvider>
            <LanguageProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } />
                    </Routes>
                </Router>
            </LanguageProvider>
        </ThemeProvider>
    )
}

export default App
