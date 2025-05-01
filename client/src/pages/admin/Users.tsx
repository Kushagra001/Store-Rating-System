import { useState, useEffect } from 'react';
import { Search, Plus, X, User as UserIcon, Check, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import StarRating from '../../components/StarRating';

interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'owner';
  rating?: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user' as 'admin' | 'user' | 'owner'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        user.address.toLowerCase().includes(searchTermLower) ||
        user.role.toLowerCase().includes(searchTermLower)
      );
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err: any) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/admin/users', formData);
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        address: '',
        password: '',
        role: 'user'
      });
      setShowAddModal(false);
      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    // Sort the filtered users
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredUsers(sortedUsers);
  };

  const getSortIcon = (key: keyof User) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'ascending' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/10 text-primary';
      case 'owner':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Manage Users</h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center font-medium"
                  >
                    Name {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <button 
                    onClick={() => handleSort('email')}
                    className="flex items-center font-medium"
                  >
                    Email {getSortIcon('email')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <button 
                    onClick={() => handleSort('address')}
                    className="flex items-center font-medium"
                  >
                    Address {getSortIcon('address')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <button 
                    onClick={() => handleSort('role')}
                    className="flex items-center font-medium"
                  >
                    Role {getSortIcon('role')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Rating
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    {searchTerm ? 'No users matching your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="max-w-xs truncate" title={user.address}>
                        {user.address}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'owner' && user.rating !== undefined ? (
                        <div className="flex items-center">
                          <StarRating value={user.rating} readonly size="sm" />
                          <span className="ml-2 text-sm">{user.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-error hover:text-error/80 p-1 rounded-full hover:bg-muted transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-card rounded-lg shadow-lg border w-full max-w-md mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
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
                    placeholder="Enter full name"
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
                  <label htmlFor="role" className="label block mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  >
                    <option value="user">Normal User</option>
                    <option value="admin">Administrator</option>
                    <option value="owner">Store Owner</option>
                  </select>
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
                    placeholder="Enter address"
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
                  <p className="text-xs text-muted-foreground mt-1">
                    8-16 characters, one uppercase letter, one special character
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;