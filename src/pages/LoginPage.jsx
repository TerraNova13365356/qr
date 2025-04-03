"use client";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, facebookProvider } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignup) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            if (email.includes("@stud")) {
                navigate("/student");
            } else if (email.includes("@fac")) {
                navigate("/teacher");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const userEmail = result.user.email;
            if (userEmail.includes("@stud")) {
                navigate("/student");
            } else if (userEmail.includes("@fac")) {
                navigate("/teacher");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            const userEmail = result.user.email;
            if (userEmail.includes("@stud")) {
                navigate("/student");
            } else if (userEmail.includes("@fac")) {
                navigate("/teacher");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <div className="bg-gray-50 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
                        {isSignup ? "Sign Up" : "Login"}
                    </h1>
                    {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-gray-700">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 bg-white text-gray-700 rounded-lg border border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-700">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 bg-white text-gray-700 rounded-lg border border-gray-300 shadow-sm" />
                        </div>
                        <button type="submit" className={`w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition ${loading ? "opacity-50" : ""}`} disabled={loading}>
                            {loading ? (isSignup ? "Signing Up..." : "Logging In...") : (isSignup ? "Sign Up" : "Login")}
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <span onClick={() => setIsSignup(!isSignup)} className="text-gray-600 cursor-pointer hover:underline">
                            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                        </span>
                    </div>
                    <div className="mt-4 flex justify-center space-x-4">
                        <button onClick={handleGoogleLogin} className="w-28 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Google</button>
                        <button onClick={handleFacebookLogin} className="w-28 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Facebook</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;