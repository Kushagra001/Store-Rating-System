import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, User, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuButtonClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuButtonClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-30 flex h-16 items-center border-b bg-card px-4 shadow-sm">
      <button 
        onClick={onMenuButtonClick}
        className="mr-4 rounded-full p-2 hover:bg-muted md:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Store Rating System</h1>
      </div>
      
      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-full p-2 hover:bg-muted"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline-block font-medium">
            {user?.name}
          </span>
        </button>
        
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-card shadow-lg border animate-fade-in">
            <div className="p-2">
              <div className="border-b pb-2 mb-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs mt-1 bg-muted text-muted-foreground capitalize rounded-full px-2 py-0.5 inline-block">
                  {user?.role}
                </p>
              </div>
              
              <Link
                to="/change-password"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Change Password
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-error hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;