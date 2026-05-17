import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart, FaBolt } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import StockWarningModal from './StockWarningModal';
import './OutfitCard.css';

const OutfitCard = ({ outfit, initialFavorite = false, onRemove }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [isFav, setIsFav] = useState(initialFavorite);
  const [adding, setAdding] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Mock Original Price (approx 40% higher)
  const originalPrice = Math.round(outfit.price * 1.4);
  const discountPercent = Math.round(((originalPrice - outfit.price) / originalPrice) * 100);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to add to favorites");

    try {
      if (isFav) {
        await api.delete(`/favorites/remove/${outfit._id}`);
        if (onRemove) onRemove(outfit._id);
      } else {
        await api.post('/favorites/add', { outfitId: outfit._id });
      }
      setIsFav(!isFav);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    await addToCart(outfit._id, 'M', 1);
    setAdding(false);
  };

  const proceedToCheckout = async () => {
    setShowWarning(false);
    await addToCart(outfit._id, 'M', 1);
    navigate('/checkout/cart');
  };

  return (
    <>
      <div className="product-card" onClick={() => navigate(`/product/${outfit._id}`)}>
        <div className="product-image-wrapper">
          <img src={outfit.image} alt={outfit.title} className="product-image" />
          
          <button className="wishlist-btn" onClick={toggleFavorite}>
            {isFav ? <FaHeart color="#ff3e6c" size={18} /> : <FaRegHeart color="#535766" size={18} />}
          </button>
          
          {outfit.stock === 0 ? (
            <div className="stock-badge out-of-stock">OUT OF STOCK</div>
          ) : outfit.stock <= 5 ? (
            <div className="stock-badge few-left">ONLY {outfit.stock} LEFT</div>
          ) : null}
          
          <div className="product-rating">
            4.2 ★ | 1.2k
          </div>
        </div>
        
        <div className="product-info">
          <h3 className="product-brand">{outfit.category} Brand</h3>
          <h4 className="product-title">{outfit.title}</h4>
          
          <div className="price-row">
            <span className="current-price">₹{outfit.price}</span>
            <span className="original-price">₹{originalPrice}</span>
            <span className="discount-percent">({discountPercent}% OFF)</span>
          </div>
        </div>
        
        <div className="product-action-overlay">
          <button 
            className="action-btn-cart" 
            onClick={handleAddToCart}
            disabled={adding || outfit.stock === 0}
          >
            {adding ? '...' : <><FaShoppingCart /> ADD TO CART</>}
          </button>
        </div>
      </div>

      <StockWarningModal 
        isOpen={showWarning} 
        items={[outfit]} 
        onContinue={proceedToCheckout} 
        onCancel={() => setShowWarning(false)} 
      />
    </>
  );
};

export default OutfitCard;
