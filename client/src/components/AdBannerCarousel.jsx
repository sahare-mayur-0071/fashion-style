import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdBannerCarousel.css';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    title: 'End of Season Sale',
    subtitle: 'Up to 70% Off on Top Brands',
    buttonText: 'Shop Now',
    color: '#ef4444',
    link: '/collections'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    title: 'New Arrivals',
    subtitle: 'Discover the Spring Collection',
    buttonText: 'Explore',
    color: '#3b82f6',
    link: '/collections'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    title: 'Premium Winter Wear',
    subtitle: 'Stay warm in style. Exclusive 20% cashback.',
    buttonText: 'View Deals',
    color: '#10b981',
    link: '/collections'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop',
    title: 'Exclusive Accessories',
    subtitle: 'Elevate your look with our premium collection.',
    buttonText: 'Accessorize',
    color: '#8b5cf6',
    link: '/collections'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop',
    title: 'Footwear Fiesta',
    subtitle: 'Step into comfort. Flat 50% off on all shoes.',
    buttonText: 'Shop Shoes',
    color: '#f59e0b',
    link: '/collections'
  }
];

const AdBannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      z: 0,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      z: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="ad-carousel-container">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="ad-slide"
        >
          <div className="ad-image-wrapper">
             <div className="ad-overlay"></div>
             <img src={banners[currentIndex].image} alt={banners[currentIndex].title} className="ad-image" />
          </div>
          <div className="ad-content">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2 }}
            >
              {banners[currentIndex].title}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.3 }}
            >
              {banners[currentIndex].subtitle}
            </motion.p>
            <motion.button 
              className="ad-btn"
              style={{ backgroundColor: banners[currentIndex].color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(banners[currentIndex].link)}
            >
              {banners[currentIndex].buttonText} <FaArrowRight style={{ fontSize: '0.9em' }} />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      <button className="nav-btn prev" onClick={prevSlide}>
        <FaChevronLeft />
      </button>
      <button className="nav-btn next" onClick={nextSlide}>
        <FaChevronRight />
      </button>

      <div className="carousel-indicators">
        {banners.map((_, idx) => (
          <div 
            key={idx} 
            className={`indicator ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdBannerCarousel;
