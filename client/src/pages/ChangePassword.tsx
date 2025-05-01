import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, X } from 'lucide-react';
import axios from 'axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Password validation: 8-16 characters, at least one uppercase letter and one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      errors.newPassword = 'Password must be 8-16 characters and include at least one uppercase letter and one special character';
    }
    
    // Confirm password validation
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setFormSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Navigate back after showing success message
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Failed to change password. Please try again.');
    }
  };

  // Password strength indicators
  const hasMinLength = formData.newPassword.length >= 8;
  const hasMaxLength = formData.newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const hasSpecialChar = /[!@#$%^&*]/.test(formData.newPassword);

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        
        {formError && (
          <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}
        
        {formSuccess && (
          <div className="bg-success/10 border border-success/30 text-success rounded-md p-3 mb-4 flex items-start gap-2">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{formSuccess}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="label block mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              className="input w-full"
              placeholder="Enter current password"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="label block mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              className={`input w-full ${validationErrors.newPassword ? 'border-error' : ''}`}
              placeholder="Enter new password"
              required
            />
            {validationErrors.newPassword && (
              <p className="text-xs text-error mt-1">{validationErrors.newPassword}</p>
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
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input w-full ${validationErrors.confirmPassword ? 'border-error' : ''}`}
              placeholder="Confirm new password"
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-xs text-error mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;