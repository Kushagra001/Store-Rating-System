import { useState, useEffect } from 'react';
import { Search, X, User, Star } from 'lucide-react';
import axios from 'axios';
import StarRating from '../../components/StarRating';

interface Rating {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  rating: number;
  createdAt: string;
}

interface StoreInfo {
  id: number;
  name: string;
  totalRatings: number;
  averageRating: number;
}

const OwnerDashboard = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Rating | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });

  useEffect(() => {
    fetchStoreInfo();
    fetchRatings();
  }, []);

  useEffect(() => {
    // Filter ratings based on search term
    const filtered = ratings.filter(rating => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        rating.userName.toLowerCase().includes(searchTermLower) ||
        rating.userEmail.toLowerCase().includes(searchTermLower)
      );
    });
    
    setFilteredRatings(filtered);
  }, [searchTerm, ratings]);

  const fetchStoreInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/owner/store');
      setStoreInfo(response.data);
    } catch (err: any) {
      setError('Failed to fetch store information');
      console.error(err);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/owner/ratings');
      setRatings(response.data);
      setFilteredRatings(response.data);
    } catch (err: any) {
      setError('Failed to fetch ratings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Rating) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    // Sort the filtered ratings
    const sortedRatings = [...filteredRatings].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredRatings(sortedRatings);
  };

  const getSortIcon = (key: keyof Rating) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'ascending' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  if (loading && ratings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Store Dashboard</h1>
      
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {storeInfo && (
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{storeInfo.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground text-sm mb-1">Average Rating</p>
              <div className="flex items-center">
                <StarRating value={storeInfo.averageRating} readonly size="sm" />
                <span className="ml-2 text-2xl font-bold">{storeInfo.averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-2">out of 5</span>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground text-sm mb-1">Total Ratings</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{storeInfo.totalRatings}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {storeInfo.totalRatings === 1 ? 'customer has' : 'customers have'} rated your store
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center">
              <Star className="text-yellow-400 h-5 w-5 mr-2" />
              <p className="text-sm text-muted-foreground">
                Ratings breakdown helps you understand how customers perceive your store. 
                Use this information to improve your services and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <h2 className="text-xl font-semibold mb-2 md:mb-0">Customer Ratings</h2>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="input pl-10 w-full"
              placeholder="Search by name or email..."
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
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    <button 
                      onClick={() => handleSort('userName')}
                      className="flex items-center font-medium"
                    >
                      Customer {getSortIcon('userName')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    <button 
                      onClick={() => handleSort('userEmail')}
                      className="flex items-center font-medium"
                    >
                      Email {getSortIcon('userEmail')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    <button 
                      onClick={() => handleSort('rating')}
                      className="flex items-center font-medium"
                    >
                      Rating {getSortIcon('rating')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    <button 
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center font-medium"
                    >
                      Date {getSortIcon('createdAt')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRatings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      {searchTerm ? 'No ratings matching your search' : 'No ratings found'}
                    </td>
                  </tr>
                ) : (
                  filteredRatings.map((rating) => (
                    <tr key={rating.id} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground mr-2">
                            <User className="h-4 w-4" />
                          </div>
                          {rating.userName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{rating.userEmail}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <StarRating value={rating.rating} readonly size="sm" />
                          <span className="ml-2 text-sm">{rating.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;