import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarFilter from '../components/SidebarFilter';
import OutfitCard from '../components/OutfitCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiSearch } from 'react-icons/fi';
import './Listing.css';

const Listing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [outfits, setOutfits] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    gender: 'All',
    season: 'All',
    category: 'All',
    maxPrice: 10000,
    search: '',
    tags: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters = { ...filters };
    let hasParams = false;
    
    for (let [key, value] of params.entries()) {
      if (value) {
        initialFilters[key] = value;
        if (key === 'search') setSearchInput(value);
        hasParams = true;
      }
    }
    
    if (hasParams) {
      setFilters(initialFilters);
    }
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => {
    // Reset page to 1 when filters change
    setPage(1);
    setHasMore(true);
    fetchOutfits(1);
    if (user) {
      fetchFavorites();
    }
    // eslint-disable-next-line
  }, [filters, user]);

  useEffect(() => {
    if (page > 1) {
      fetchOutfits(page);
    }
    // eslint-disable-next-line
  }, [page]);

  const fetchOutfits = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.gender !== 'All') queryParams.append('gender', filters.gender);
      if (filters.season !== 'All') queryParams.append('season', filters.season);
      if (filters.category !== 'All') queryParams.append('category', filters.category);
      queryParams.append('maxPrice', filters.maxPrice);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.tags) queryParams.append('tags', filters.tags);
      queryParams.append('page', pageNum);
      queryParams.append('limit', 50);

      const res = await api.get(`/outfits?${queryParams.toString()}`);
      
      const fetchedOutfits = res.data.outfits || res.data;
      const total = res.data.total !== undefined ? res.data.total : fetchedOutfits.length;

      setTotalItems(total);

      if (pageNum === 1) {
        setOutfits(fetchedOutfits);
      } else {
        setOutfits(prev => [...prev, ...fetchedOutfits]);
      }
      
      if (fetchedOutfits.length < 50) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch outfits", error);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavoriteIds(res.data.map(f => f._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
      <div className="listing-header animate-fade-in" style={{ padding: '20px 20px 0 20px', borderBottom: '1px solid #eaeaec' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 700, color: '#282c3f' }}>Home / Clothing /</span>
            <span style={{ fontWeight: 700, color: '#282c3f' }}>Curated For You</span>
            <span style={{ color: '#535766' }}> - {totalItems} items</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <SidebarFilter filters={filters} setFilters={setFilters} />

        {/* Main Content Area */}
        <main className="listing-main" style={{ flex: 1, padding: '24px' }}>
          {loading ? (
            <div className="loader" style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
          ) : outfits.length === 0 ? (
            <div className="no-results" style={{ textAlign: 'center', marginTop: '50px' }}>
              <h3 style={{ color: '#282c3f' }}>We couldn't find any matches!</h3>
              <p style={{ color: '#535766', marginTop: '10px' }}>Please check the spelling or try searching for something else</p>
            </div>
          ) : (
            <div style={{ paddingBottom: '40px' }}>
              <div className="outfits-grid-wide" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
                gap: '20px', 
                alignItems: 'start' 
              }}>
                {outfits.map((outfit, index) => (
                  <div key={`${outfit._id}-${index}`} style={{ animationDelay: `${(index % 6) * 0.1}s` }}>
                    <OutfitCard 
                      outfit={outfit} 
                      initialFavorite={favoriteIds.includes(outfit._id)} 
                    />
                  </div>
                ))}
              </div>
              
              {hasMore && outfits.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={loadingMore}
                    style={{
                      padding: '12px 30px',
                      background: '#fff',
                      border: '1px solid #d4d5d9',
                      borderRadius: '4px',
                      color: '#282c3f',
                      fontWeight: 'bold',
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: loadingMore ? 0.7 : 1
                    }}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Listing;
