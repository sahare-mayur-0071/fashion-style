import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiHeart, FiUser, FiShoppingCart } from 'react-icons/fi';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/collections', icon: <FiGrid />, label: 'Categories' },
    { path: '/cart', icon: <FiShoppingCart />, label: 'Cart', count: cartItemCount },
    { path: user ? '/profile' : '/login', icon: <FiUser />, label: 'Profile' }
  ];

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path || 
                         (item.path === '/profile' && location.pathname.startsWith('/profile'));
        
        return (
          <Link to={item.path} key={index} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
            <div className="bottom-nav-icon">
              {item.icon}
              {item.count > 0 && <span className="bottom-nav-badge">{item.count}</span>}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
