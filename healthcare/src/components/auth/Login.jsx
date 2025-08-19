import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Eye, EyeOff, Mail, Lock, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!formData.password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await login(formData.email, formData.password);
      
      toast.success("Đăng nhập thành công!");
      
      // Chuyển giao diện dựa trên vai trò
      if (user.role === 'patient') {
        navigate('/patient');
      } else if (user.role === 'doctor') {
        navigate('/doctor');
      } else if (user.role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      setError("Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.");

      toast.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full shadow-lg">
              {" "}
              {/* Added shadow-lg */}
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hoặc{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              {" "}
              {/* Added transition-colors */}
              đăng ký nếu chưa có tài khoản
            </Link>
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-200/50 animate-scaleIn"
          onSubmit={handleSubmit}
        >
          {" "}
          {/* Increased border-radius, added border, animate-scaleIn */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {" "}
              {/* Increased border-radius */}
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"

                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200" /* Increased py, added transition */
                  placeholder="Nhập email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200" /* Increased py, added transition */
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-none p-0 hover:bg-transparent" /* Reset button styles */
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg" /* Applied button styles from index.css */
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
          {/* Demo accounts */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {" "}
            {/* Increased padding, increased border-radius, added border */}
            <p className="text-xs text-gray-600 mb-2 font-semibold">
              Tài khoản demo:
            </p>{" "}
            {/* Added font-semibold */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                <span className="font-medium">Bệnh nhân:</span> patient@healthcare.com
              </div>{" "}
              {/* Added font-medium */}
              <div>
                <span className="font-medium">Bác sĩ:</span> doctor@healthcare.com
              </div>
              <div>
                <span className="font-medium">Admin:</span> admin@healthcare.com
              </div>
              <div>
                <span className="font-medium">Mật khẩu:</span> password123
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

