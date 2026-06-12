import React from 'react';
import ReactDOM from 'react-dom';
import { FaCheck, FaBox, FaTruck, FaMapMarkerAlt, FaHome, FaTimes } from 'react-icons/fa';

const TrackingModal = ({ order, onClose }) => {
  if (!order) return null;

  const steps = [
    { name: 'Order Placed', icon: <FaCheck />, desc: 'We have received your order.' },
    { name: 'Packed', icon: <FaBox />, desc: 'Your order is packed and ready.' },
    { name: 'Shipped', icon: <FaTruck />, desc: 'Your order is on the way.' },
    { name: 'Out for Delivery', icon: <FaMapMarkerAlt />, desc: 'Out for delivery today.' },
    { name: 'Delivered', icon: <FaHome />, desc: 'Your order has been delivered.' }
  ];

  const completedSteps = order.trackingSteps?.map(t => t.status) || [];
  
  const legacyStatusMap = {
    'pending': ['Order Placed'],
    'paid': ['Order Placed'],
    'shipped': ['Order Placed', 'Packed', 'Shipped'],
    'out_for_delivery': ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery'],
    'delivered': ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
  };

  const derivedSteps = legacyStatusMap[order.status?.toLowerCase()] || ['Order Placed'];
  const actualCompletedSteps = [...new Set([...completedSteps, ...derivedSteps])];
  
  // Find current active step index
  const activeStepIndex = actualCompletedSteps.length - 1;
  const progressPercentage = (actualCompletedSteps.length / steps.length) * 100;

  return ReactDOM.createPortal(
    <div className="tracking-modal-overlay">
      <div className="tracking-modal glass modal-pop-in">
        <div className="modal-header">
          <div>
            <h3 style={{ color: '#1a1f36', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.2rem' }}>Track Order</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID: <span style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontWeight: '600' }}>{order._id}</span></p>
          </div>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="tracking-progress-container">
          <div className="tracking-progress-bar">
            <div 
              className="tracking-progress-fill progress-fill-animate"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="progress-text">{actualCompletedSteps.length} of {steps.length} steps completed</p>
        </div>

        <div className="timeline">
          {steps.map((step, index) => {
            const isCompleted = actualCompletedSteps.includes(step.name);
            const isActive = index === activeStepIndex;
            const stepData = order.trackingSteps?.find(t => t.status === step.name);
            
            return (
              <div 
                key={index} 
                className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} step-stagger-${index}`}
              >
                <div className="timeline-icon-wrapper">
                  <div className="timeline-icon">
                    {step.icon}
                  </div>
                  {isActive && <div className="timeline-icon-pulse"></div>}
                </div>
                
                <div className="timeline-content">
                  <h4 className="step-title">{step.name}</h4>
                  <p className="step-desc">{stepData?.message || step.desc}</p>
                  {isCompleted && stepData && stepData.timestamp && (
                    <span className="step-time">{new Date(stepData.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TrackingModal;
