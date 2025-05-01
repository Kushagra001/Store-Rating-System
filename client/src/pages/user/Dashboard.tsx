import { useState, useEffect } from 'react';
import { Search, X, MapPin, Star } from 'lucide-react';
import axios from 'axios';
import StarRating from '../../components/StarRating';

interface Store {
  id: number;
  name: string;
  address: string;
  overallRating: number;
  userRating: number | null;
}

const UserDashboard = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRatingId, setActiveRatingId] = useState<number | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    id: number;
    status: 'success' | 'error';
    message: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Store | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    // Filter stores based on search term
    const filtered = stores.filter(store => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        store.name.toLowerCase().includes(searchTermLower) ||
        store.address.toLowerCase().includes(searchTermLower)
      );
    });
    
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/stores');
      setStores(response.data);
      setFilteredStores(response.data);
    } catch (err: any) {
      setError('Failed to fetch stores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (storeId: number, rating: number) => {
    try {
      await axios.post(`http://localhost:5000/api/ratings`, {
        storeId,
        rating
      });
      
      // Update the local state to reflect the new rating
      setStores(prev => 
        prev.map(store => 
          store.id === storeId ? { ...store, userRating: rating } : store
        )
      );
      
      // Show success message
      setSubmitStatus({
        id: storeId,
        status: 'success',
        message: 'Rating submitted successfully!'
      });
      
      // Hide message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
      
      // Reset active rating
      setActiveRatingId(null);
      
      // Refresh stores to get updated overall rating
      fetchStores();
    } catch (err: any) {
      // Show error message
      setSubmitStatus({
        id: storeId,
        status: 'error',
        message: 'Failed to submit rating. Please try again.'
      });
      
      // Hide message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  const handleSort = (key: keyof Store) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    // Sort the filtered stores
    const sortedStores = [...filteredStores].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredStores(sortedStores);
  };

  const getSortIcon = (key: keyof Store) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'ascending' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  if (loading && stores.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Explore Stores</h1>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search stores by name or address..."
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
      
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.length === 0 ? (
          <div className="col-span-full text-center p-8 bg-card rounded-lg border">
            <p className="text-muted-foreground">
              {searchTerm ? 'No stores matching your search' : 'No stores found'}
            </p>
          </div>
        ) : (
          filteredStores.map((store) => (
            <div key={store.id} className="bg-card rounded-lg shadow-sm border overflow-hidden hover:border-primary/30 transition-all animate-slide-up">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 truncate" title={store.name}>
                  {store.name}
                </h2>
                
                <div className="flex items-center mb-4 text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <p className="text-sm truncate" title={store.address}>
                    {store.address}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
                    <div className="flex items-center">
                      <StarRating value={store.overallRating} readonly size="sm" />
                      <span className="ml-2 font-medium">{store.overallRating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  {store.userRating !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your Rating</p>
                      <div className="flex items-center">
                        <StarRating value={store.userRating} readonly size="sm" />
                        <span className="ml-2 font-medium">{store.userRating}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  {activeRatingId === store.id ? (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        {store.userRating === null ? 'Submit your rating:' : 'Update your rating:'}
                      </p>
                      <div className="flex items-center justify-between">
                        <StarRating
                          value={store.userRating || 0}
                          onChange={(rating) => handleRatingChange(store.id, rating)}
                          size="md"
                        />
                        <button
                          onClick={() => setActiveRatingId(null)}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveRatingId(store.id)}
                      className="btn btn-secondary w-full"
                    >
                      {store.userRating === null ? 'Rate this store' : 'Update rating'}
                    </button>
                  )}
                  
                  {submitStatus && submitStatus.id === store.id && (
                    <div className={`mt-2 text-sm p-2 rounded ${
                      submitStatus.status === 'success' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-error/10 text-error'
                    }`}>
                      {submitStatus.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDashboard;