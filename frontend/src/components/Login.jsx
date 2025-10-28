import React, { useState, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      login(data.token);
      navigate("/", { state: { toastMessage: 'Login Successful!' } });
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Login failed — check credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#0d0b1e] to-[#1a1633] text-text">
      <div className="bg-surface/60 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-[90%] max-w-md border border-accent/20 transition-all duration-300 hover:border-accent/40">
        <h2 className="text-3xl font-semibold text-accentAlt mb-6 text-center tracking-wide">
          Welcome Back, Adventurer
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-3 rounded-lg bg-[#1f1b3a] text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accentAlt transition-all duration-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded-lg bg-[#1f1b3a] text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accentAlt transition-all duration-200"
          />

          <button
            type="submit"
            className="mt-2 py-2.5 rounded-lg bg-accent text-[#0d0b1e] font-semibold tracking-wide hover:bg-accentAlt transition-all duration-200"
          >
            Log In
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-error font-medium whitespace-pre-line">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <span className="text-muted">New here? </span>
          <Link
            to="/register"
            className="text-accentAlt hover:underline hover:text-accent transition-colors duration-200"
          >
            Create an account
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
