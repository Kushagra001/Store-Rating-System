import { useEffect, useState } from 'react';
import { Users, Store, Star } from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(response.data);
      } catch (err: any) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 text-error p-4 rounded-md">
        <p>{error}</p>
        <p className="text-sm mt-2">Please try again later or contact support if the problem persists.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow-sm border p-6 group hover:border-primary/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-primary/10 text-primary p-3 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">All registered users across all roles</p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border p-6 group hover:border-secondary/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Stores</p>
              <p className="text-3xl font-bold mt-2">{stats.totalStores}</p>
            </div>
            <div className="bg-secondary/10 text-secondary p-3 rounded-lg group-hover:bg-secondary group-hover:text-white transition-colors">
              <Store className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">All registered stores on the platform</p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border p-6 group hover:border-accent/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Ratings</p>
              <p className="text-3xl font-bold mt-2">{stats.totalRatings}</p>
            </div>
            <div className="bg-accent/10 text-accent p-3 rounded-lg group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">All ratings submitted by users</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-card rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <p className="text-muted-foreground">
          Welcome to the administrator dashboard. Here you can manage users, stores, and view overall system statistics.
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/admin/users" className="text-primary hover:underline">
                  Manage Users
                </a>
              </li>
              <li>
                <a href="/admin/stores" className="text-primary hover:underline">
                  Manage Stores
                </a>
              </li>
            </ul>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">System Health</h3>
            <div className="flex items-center mt-2">
              <div className="bg-success h-2.5 w-2.5 rounded-full mr-2"></div>
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center mt-2">
              <div className="bg-success h-2.5 w-2.5 rounded-full mr-2"></div>
              <span className="text-sm">Database connected</span>
            </div>
            <div className="flex items-center mt-2">
              <div className="bg-success h-2.5 w-2.5 rounded-full mr-2"></div>
              <span className="text-sm">API services running</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;