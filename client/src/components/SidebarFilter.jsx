import React from 'react';
import './SidebarFilter.css';

const SidebarFilter = ({ filters, setFilters }) => {
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const currentCategories = filters.category === 'All' ? [] : filters.category.split(',');
    
    let newCategories;
    if (e.target.checked) {
      newCategories = [...currentCategories, value];
    } else {
      newCategories = currentCategories.filter(c => c !== value);
    }
    
    setFilters({ ...filters, category: newCategories.length ? newCategories.join(',') : 'All' });
  };

  const handleTagChange = (e) => {
    const value = e.target.value;
    const currentTags = filters.tags ? filters.tags.split(',') : [];
    
    let newTags;
    if (e.target.checked) {
      newTags = [...currentTags, value];
    } else {
      newTags = currentTags.filter(t => t !== value);
    }
    
    setFilters({ ...filters, tags: newTags.length ? newTags.join(',') : '' });
  };

  const handlePriceChange = (e) => {
    setFilters({ ...filters, maxPrice: e.target.value });
  };

  // Using real popular categories from the dataset
  const categories = [
    'Tshirts', 'Shirts', 'Casual Shoes', 'Watches', 'Sports Shoes', 'Kurtas', 'Tops', 
    'Handbags', 'Heels', 'Sunglasses', 'Wallets', 'Flip Flops', 'Sandals', 'Briefs', 
    'Belts', 'Backpacks', 'Socks', 'Formal Shoes', 'Perfume and Body Mist', 'Jeans', 
    'Shorts', 'Trousers', 'Flats', 'Bra', 'Dresses', 'Sarees', 'Earrings', 'Deodorant'
  ];
  
  // Mapped to tags in the backend
  const brands = ['Puma', 'Nike', 'Fastrack', 'Biba', 'Titan', 'United Colors of Benetton', 'Peter England', 'Fabindia', 'W', 'Fossil'];
  const colors = ['Black', 'White', 'Blue', 'Brown', 'Grey', 'Red', 'Green', 'Pink', 'Navy Blue', 'Purple', 'Silver', 'Yellow'];

  return (
    <div className="sidebar-filter-vertical">
      <div className="sidebar-header">
        <h3 className="filter-title">FILTERS</h3>
        <span className="clear-all" onClick={() => setFilters({...filters, category: 'All', tags: '', maxPrice: 10000})}>CLEAR ALL</span>
      </div>
      
      <div className="filter-section">
        <h4 className="section-title">CATEGORIES</h4>
        <div className="checkbox-group scrollable-group">
          {categories.map(cat => (
            <label key={cat} className="checkbox-label">
              <input 
                type="checkbox" 
                value={cat} 
                checked={filters.category !== 'All' && filters.category.split(',').includes(cat)}
                onChange={handleCategoryChange}
              />
              <span className="checkmark"></span>
              <span className="label-text">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="section-title">BRAND</h4>
        <div className="checkbox-group scrollable-group">
          {brands.map(brand => (
            <label key={brand} className="checkbox-label">
              <input 
                type="checkbox" 
                value={brand}
                checked={filters.tags && filters.tags.split(',').includes(brand)}
                onChange={handleTagChange} 
              />
              <span className="checkmark"></span>
              <span className="label-text">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="section-title">PRICE</h4>
        <div className="price-slider-container">
          <label className="price-label">Up to: ₹{filters.maxPrice || 10000}</label>
          <input 
            type="range" 
            name="maxPrice" 
            min="500" 
            max="10000" 
            step="500" 
            value={filters.maxPrice || 10000} 
            onChange={handlePriceChange} 
            className="myntra-range-slider"
          />
        </div>
      </div>

      <div className="filter-section">
        <h4 className="section-title">COLOR</h4>
        <div className="checkbox-group color-group scrollable-group">
          {colors.map(color => (
            <label key={color} className="checkbox-label color-label">
              <input 
                type="checkbox" 
                value={color}
                checked={filters.tags && filters.tags.split(',').includes(color)}
                onChange={handleTagChange} 
              />
              <div className="color-indicator" style={{ backgroundColor: color.replace(' ', '').toLowerCase() }}></div>
              <span className="label-text">{color}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarFilter;
