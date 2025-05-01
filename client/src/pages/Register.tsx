import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Star, AlertCircle, Check, X } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Name validation: 20-60 characters
    if (formData.name.length < 20) {
      errors.name = 'Name must be at least 20 characters';
    } else if (formData.name.length > 60) {
      errors.name = 'Name must be less than 60 characters';
    }
    
    // Address validation: max 400 characters
    if (formData.address.length > 400) {
      errors.address = 'Address must be less than 400 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation: 8-16 characters, at least one uppercase letter and one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must be 8-16 characters and include at least one uppercase letter and one special character';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  // Password strength indicators
  const hasMinLength = formData.password.length >= 8;
  const hasMaxLength = formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-md border p-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Star className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold ml-2">RateMyStore</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-6">Create your account</h2>
          
          {formError && (
            <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label block mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`input w-full ${validationErrors.name ? 'border-error' : ''}`}
                placeholder="Enter your full name"
                required
              />
              {validationErrors.name && (
                <p className="text-xs text-error mt-1">{validationErrors.name}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Must be between 20 and 60 characters
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="label block mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`input w-full ${validationErrors.email ? 'border-error' : ''}`}
                placeholder="email@example.com"
                required
              />
              {validationErrors.email && (
                <p className="text-xs text-error mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address" className="label block mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`input w-full min-h-[80px] ${validationErrors.address ? 'border-error' : ''}`}
                placeholder="Enter your address"
                required
              />
              {validationErrors.address && (
                <p className="text-xs text-error mt-1">{validationErrors.address}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 400 characters
              </p>
            </div>
            
            <div>
              <label htmlFor="password" className="label block mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`input w-full ${validationErrors.password ? 'border-error' : ''}`}
                placeholder="••••••••"
                required
              />
              {validationErrors.password && (
                <p className="text-xs text-error mt-1">{validationErrors.password}</p>
              )}
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className={`text-xs flex items-center ${hasMinLength && hasMaxLength ? 'text-success' : 'text-muted-foreground'}`}>
                  {hasMinLength && hasMaxLength ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  8-16 characters
                </div>
                <div className={`text-xs flex items-center ${hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
                  {hasUppercase ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  One uppercase letter
                </div>
                <div className={`text-xs flex items-center ${hasSpecialChar ? 'text-success' : 'text-muted-foreground'}`}>
                  {hasSpecialChar ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  One special character
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="label block mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input w-full ${validationErrors.confirmPassword ? 'border-error' : ''}`}
                placeholder="••••••••"
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-xs text-error mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
            
            <button type="submit" className="btn btn-primary w-full">
              Create Account
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;