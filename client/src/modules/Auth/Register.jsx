// src/modules/Auth/Register.jsx
import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Loader2, School } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from '@/modules/AuthContext/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { showToast } from '@/modules/toast/customToast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      showToast('success', 'Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
        console.log(error);
        
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-100 via-white to-pink-100 p-6">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join Abmgroups today</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>

            {/* Email - Optional */}
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                name="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>

            {/* Role Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="college_student">College Student</SelectItem>
                  <SelectItem value="school_student">School Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button type="submit" disabled={loading}  className="w-full h-12 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 mt-6">
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

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-500 font-medium hover:text-indigo-600">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;