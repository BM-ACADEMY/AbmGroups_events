// src/modules/Auth/Login.jsx (Updated - Add link to Register)
import { Mail, Lock, Loader2 } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "@/modules/AuthContext/AuthContext";
import { Link } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEmail = emailOrPhone.includes("@");
      const credentials = {
        [isEmail ? "email" : "phone"]: emailOrPhone,
        password,
      };
      await login(credentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-100 via-white to-pink-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center"
      >
        <h1 className="text-gray-900 text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-sm mb-8">Login to Abmgroups</p>

        <div className="flex items-center w-full mb-4 h-12 rounded-full border border-gray-300 px-5 gap-3 transition-shadow focus-within:shadow-md">
          <Mail size={18} className="text-gray-400" />
          <input
            type="text"
            name="emailOrPhone"
            placeholder="Email or Phone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="w-full h-full text-gray-700 placeholder-gray-400 outline-none bg-transparent text-sm"
            required
          />
        </div>

        <div className="flex items-center w-full mb-6 h-12 rounded-full border border-gray-300 px-5 gap-3 transition-shadow focus-within:shadow-md">
          <Lock size={18} className="text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-full text-gray-700 placeholder-gray-400 outline-none bg-transparent text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        <div className="text-gray-400 text-xs mt-6 text-center">
          By continuing, you agree to our{" "}
          <a href="#" className="text-indigo-500 underline hover:text-indigo-600">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-500 underline hover:text-indigo-600">
            Privacy Policy
          </a>
          .
        </div>

        <p className="text-gray-600 text-sm mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-500 font-medium hover:text-indigo-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;