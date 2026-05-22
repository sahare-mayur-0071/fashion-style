import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiUser, FiShoppingCart, FiLogOut, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          Vogue<span>Sync</span>
        </Link>
        
        <div className="mobile-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FiX className="icon" /> : <FiMenu className="icon" />}
        </div>

        <div className={`nav-menu-wrapper ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-menu">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
            <Link to="/collections" className="nav-link" onClick={closeMobileMenu}>Collections</Link>
          </div>
          
          <form onSubmit={handleSearch} className="global-search-form">
            <input 
              type="text" 
              placeholder="Search for color, name, type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="global-search-input"
            />
            <button type="submit" className="global-search-btn">
              <FiSearch />
            </button>
          </form>

          <div className="nav-actions">
            {user && (
              <Link to="/favorites" className="action-btn" title="Favorites" onClick={closeMobileMenu}>
                <FiHeart className="icon" />
              </Link>
            )}
            <Link to="/cart" className="action-btn cart-btn" title="Cart" onClick={closeMobileMenu}>
              <FiShoppingCart className="icon" />
              {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </Link>
            
            {user ? (
              <div className="auth-buttons user-auth-actions">
                <Link to="/profile" style={{ textDecoration: 'none' }} onClick={closeMobileMenu}>
                  <span className="user-greeting">Hi, {user.name}</span>
                </Link>
                <button className="logout-btn" onClick={handleLogout} title="Logout">
                  <FiLogOut className="icon" />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-outline" onClick={() => { navigate('/login'); closeMobileMenu(); }}>Login</button>
                <button className="btn-primary" onClick={() => { navigate('/signup'); closeMobileMenu(); }}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
