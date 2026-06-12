import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaTimes, FaSpinner, FaChevronDown } from 'react-icons/fa';
import OutfitCard from '../components/OutfitCard';
import AdBannerCarousel from '../components/AdBannerCarousel';
import api from '../services/api';
import './Home.css';

const CustomSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="custom-select-container">
      <label>{label}</label>
      <div 
        className={`custom-select-box ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption.icon} {selectedOption.label}</span>
        <FaChevronDown className="select-arrow" />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="custom-select-dropdown glass"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {options.map((opt) => (
              <div 
                key={opt.value} 
                className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.icon} {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Home = () => {
  const [formData, setFormData] = useState({
    gender: 'Women',
    season: 'All',
    maxPrice: 5000,
  });
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [recommendations, setRecommendations] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const genderOptions = [
    { value: 'Men', label: 'Men', icon: '👕' },
    { value: 'Women', label: 'Women', icon: '👗' },
    { value: 'Unisex', label: 'Unisex', icon: '✨' }
  ];

  const seasonOptions = [
    { value: 'Summer', label: 'Summer', icon: '☀️' },
    { value: 'Winter', label: 'Winter', icon: '❄️' },
    { value: 'Rainy', label: 'Rainy', icon: '🌧️' },
    { value: 'All', label: 'All Seasons', icon: '🌍' }
  ];



  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        handleFileSelection(droppedFile);
      } else {
        setError('Please upload an image file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setError('');
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let searchQuery = '';
      
      // 1. Process Visual AI Search if image is uploaded
      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        
        const uploadRes = await api.post('/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data.searchQuery) {
          searchQuery = uploadRes.data.searchQuery;
        }
      }
      
      // 2. Fetch curated collection from database
      const params = {
        limit: 8,
        gender: formData.gender !== 'Unisex' ? formData.gender : undefined,
        maxPrice: formData.maxPrice,
        season: formData.season !== 'All' ? formData.season : undefined
      };
      
      // Pass the AI search keywords if we have them
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      let res = await api.get('/outfits', { params });
      let finalOutfits = res.data.outfits || [];
      
      // 3. Smart Fallback: If AI visual search was too narrow, broaden the search
      if (finalOutfits.length === 0 && searchQuery) {
        delete params.search; // Remove strict visual matching
        res = await api.get('/outfits', { params });
        finalOutfits = res.data.outfits || [];
      }
      
      setRecommendations(finalOutfits);
      setHasSearched(true);
      
      // Scroll down to results smoothly
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      
    } catch (err) {
      console.error('Curation Error:', err);
      setError('Failed to curate collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage for slider gradient
  const sliderPercentage = ((formData.maxPrice - 500) / 9500) * 100;

  return (
    <div className="premium-home-container">
      <div className="ambient-glow"></div>
      
      <AdBannerCarousel />
      
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <h1>Define Your Aesthetics</h1>
          <p>AI-powered personalized curation tailored to your unique style and vibe.</p>
        </div>
      </motion.div>

      <motion.div 
        className="preference-form-container glass"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
      >
        <h2>Style Profile</h2>
        {error && <div className="form-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="preference-form">
          <div className="form-row">
            <CustomSelect 
              label="Style Identity" 
              value={formData.gender} 
              options={genderOptions}
              onChange={(val) => setFormData({...formData, gender: val})}
            />
            <CustomSelect 
              label="Seasonal Vibe" 
              value={formData.season} 
              options={seasonOptions}
              onChange={(val) => setFormData({...formData, season: val})}
            />
          </div>
          
          <div className="form-group budget-group">
            <div className="budget-header">
              <label>Investment Range</label>
              <span className="budget-value">₹{formData.maxPrice}</span>
            </div>
            <input 
              type="range" 
              name="maxPrice" 
              min="500" 
              max="10000" 
              step="500"
              value={formData.maxPrice} 
              onChange={(e) => setFormData({...formData, maxPrice: parseInt(e.target.value)})} 
              className="premium-slider"
              style={{ background: `linear-gradient(to right, var(--primary-color) ${sliderPercentage}%, #e2e8f0 ${sliderPercentage}%)` }}
            />
          </div>

          <div className="form-group">
            <label>Visual Inspiration (Optional)</label>
            <div 
              className={`drag-drop-zone ${isDragActive ? 'active' : ''} ${preview ? 'has-preview' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                id="file-upload" 
                className="hidden-file-input"
              />
              
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Inspiration Preview" className="image-preview" />
                  <button type="button" className="remove-preview-btn" onClick={clearFile}>
                    <FaTimes /> Remove
                  </button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="drag-drop-content">
                  <FaCloudUploadAlt className="upload-icon" />
                  <p>Drag & drop an image or <span>browse</span></p>
                  <span className="upload-hint">Supports JPG, PNG, WEBP</span>
                </label>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-premium w-100" 
            disabled={loading}
          >
            {loading ? (
              <><FaSpinner className="spinner" /> Curating Collection...</>
            ) : (
              'Discover Your Styles'
            )}
          </button>
        </form>
      </motion.div>

      {/* Recommendations Section */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div 
            id="results-section"
            className="recommendations-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="recommendations-header">
              <h2>Your Curated Collection</h2>
              <p>Handpicked selections based on your unique profile.</p>
            </div>
            
            {loading ? (
              <div className="loading-grid">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton-card glass"></div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="no-results glass">
                <h3>No perfect matches found.</h3>
                <p>Try adjusting your style profile or budget for a wider selection.</p>
              </div>
            ) : (
              <div className="outfits-grid-wide">
                {recommendations.map((outfit, index) => (
                  <motion.div 
                    key={outfit._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <OutfitCard 
                      outfit={outfit} 
                      initialFavorite={favoriteIds.includes(outfit._id)} 
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
