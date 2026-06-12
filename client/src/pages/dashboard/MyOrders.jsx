import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TrackingModal from './TrackingModal';
import { FaBoxOpen, FaRoute } from 'react-icons/fa';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSimulateTracking = async (orderId) => {
    try {
      const res = await api.put(`/orders/${orderId}/simulate-tracking`);
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
      if (trackingOrder?._id === orderId) {
        setTrackingOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <>
      {trackingOrder && (
        <TrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
      )}
      
      <div className="animate-fade-in">
        <div className="dash-header">
          <h2>My Orders</h2>
          <p style={{ color: 'var(--text-secondary)' }}>View your order history and track deliveries.</p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <FaBoxOpen style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No orders found</h3>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Order ID: </span>
                  <span style={{ fontFamily: 'monospace' }}>{order._id}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Placed on: </span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total: </span>
                  <span style={{ color: '#000000', fontWeight: 700 }}>₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Render items array or fallback to legacy outfitId */}
              <div style={{ padding: '1rem 0' }}>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <img src={item.image || item.outfitId?.image} alt="product" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.title || item.outfitId?.title}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Size: {item.size} | Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))
                ) : order.outfitId && (
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <img src={order.outfitId.image} alt="product" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{order.outfitId.title}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Size: {order.size} | Qty: {order.quantity}</div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span className={`status-badge status-${order.status}`}>
                  {order.status.toUpperCase()}
                </span>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleSimulateTracking(order._id)}>
                    Simulate Step
                  </button>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setTrackingOrder(order)}>
                    <FaRoute /> Track Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default MyOrders;
