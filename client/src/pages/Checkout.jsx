import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart, fetchCart } = useContext(CartContext);
  
  const [loading, setLoading] = useState(true);
  
  // Step 1: Delivery Details (Step 1 since Order details are just Cart review)
  const [address, setAddress] = useState({ phone: '', street: '', city: '', state: '', pincode: '' });
  
  // Step 2: Payment Details
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'COD' or 'Online'

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    // eslint-disable-next-line
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data) {
        setAddress({
          phone: res.data.phone || '',
          street: res.data.address?.street || '',
          city: res.data.address?.city || '',
          state: res.data.address?.state || '',
          pincode: res.data.address?.pincode || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!address.phone || !address.street || !address.city || !address.state || !address.pincode) {
        return alert("Please fill in all delivery details");
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) return navigate('/login');
    setIsProcessing(true);

    const items = cart?.items || [];
    if (items.length === 0) {
      alert('Your cart is empty');
      setIsProcessing(false);
      return;
    }

    const orderItems = items.map(item => ({
      outfitId: item.outfitId._id,
      title: item.outfitId.title,
      image: item.outfitId.image,
      price: item.outfitId.price,
      size: item.size,
      quantity: item.quantity,
      originalStock: item.outfitId.stock
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const getLowStockAlert = () => {
      let alertMsg = '';
      orderItems.forEach(item => {
        const remaining = item.originalStock - item.quantity;
        if (remaining > 0 && remaining <= 10) {
          alertMsg += `\n🔥 Hurry, only ${remaining} items left for ${item.title}!`;
        }
      });
      return alertMsg;
    };

    try {
      const orderPayload = {
        items: orderItems,
        totalAmount,
        paymentMethod,
        deliveryAddress: address,
        userId: user._id
      };

      const result = await api.post('/payment/order', orderPayload);

      if (paymentMethod === 'COD') {
        if (result.data.success) {
          const lowStockMsg = getLowStockAlert();
          alert(`Order Placed Successfully via Cash on Delivery!${lowStockMsg}`);
          fetchCart(); // Refresh cart to empty it
          navigate('/profile/orders');
        }
        return;
      }

      // Real Razorpay Integration
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      const { amount, id: order_id, currency } = result.data.order;
      const { dbOrderId, key_id } = result.data;

      const options = {
        key: key_id,
        amount: amount.toString(),
        currency: currency,
        name: "Fashion Style",
        description: "Order Payment",
        order_id: order_id,
        handler: async function (response) {
          try {
            const verifyData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId
            };

            const verify = await api.post('/payment/verify', verifyData);
            if (verify.data.message === 'Payment verified successfully') {
              const lowStockMsg = getLowStockAlert();
              alert(`Payment Successful! Your order has been placed.${lowStockMsg}`);
              fetchCart();
              navigate('/profile/orders');
            } else {
              alert('Payment Verification Failed!');
            }
          } catch (err) {
            console.error(err);
            alert('Error verifying payment. Please try again.');
          }
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: address.phone
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Error processing order. Please try again.');
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="checkout-loading">Loading...</div>;

  const items = cart?.items || [];
  if (items.length === 0) return <div className="checkout-loading" style={{flexDirection:'column'}}><h3>Cart is empty</h3><button className="btn-primary" onClick={()=>navigate('/collections')}>Go Shopping</button></div>;

  const totalAmount = items.reduce((sum, item) => sum + ((item.outfitId?.price || 0) * item.quantity), 0);

  return (
    <div className="container checkout-container animate-fade-in">
      
      <div className="checkout-details glass" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Progress Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <span style={{ color: step >= 1 ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: step >= 1 ? 600 : 400 }}>1. Delivery</span>
          <span style={{ color: step >= 2 ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: step >= 2 ? 600 : 400 }}>2. Payment</span>
        </div>
        
        {step === 1 && (
          <div className="animate-fade-in">
            <h4 style={{ color: '#000000', marginBottom: '1rem' }}>Delivery Address</h4>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input type="tel" name="phone" placeholder="Phone Number" className="auth-input" value={address.phone} onChange={handleAddressChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input type="text" name="street" placeholder="Street Address" className="auth-input" value={address.street} onChange={handleAddressChange} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" name="city" placeholder="City" className="auth-input" value={address.city} onChange={handleAddressChange} />
              <input type="text" name="state" placeholder="State" className="auth-input" value={address.state} onChange={handleAddressChange} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input type="text" name="pincode" placeholder="Pincode" className="auth-input" value={address.pincode} onChange={handleAddressChange} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h4 style={{ color: '#000000', marginBottom: '1rem' }}>Payment Method</h4>
            
            <div 
              style={{ padding: '1rem', border: `1px solid ${paymentMethod === 'Online' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              onClick={() => setPaymentMethod('Online')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {paymentMethod === 'Online' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>}
                </div>
                <div>
                  <strong>Pay Online Securely (UPI, Cards, Net Banking)</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Pay instantly via Razorpay</p>
                </div>
              </div>
              
              {/* Payment Logos inside Online Option */}
              <div style={{ display: 'flex', gap: '1rem', paddingLeft: '36px', flexWrap: 'wrap' }}>
                <div style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" style={{ height: '16px' }} />
                </div>
                <div style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" style={{ height: '16px' }} />
                </div>
                <div style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 'bold', color: '#1a1f36', display: 'flex', alignItems: 'center' }}>
                  Google Pay
                </div>
                <div style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 'bold', color: '#1a1f36', display: 'flex', alignItems: 'center' }}>
                  Net Banking
                </div>
              </div>
            </div>

            <div 
              style={{ padding: '1rem', border: `1px solid ${paymentMethod === 'COD' ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '8px', marginBottom: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              onClick={() => setPaymentMethod('COD')}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === 'COD' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>}
              </div>
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Pay with cash upon delivery</p>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '1rem' }}>Order Summary</h4>
              {items.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>{item.outfitId?.title} (x{item.quantity})</span>
                  <span>₹{(item.outfitId?.price || 0) * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="checkout-summary">
          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {step > 1 && (
            <button className="btn-outline" onClick={prevStep} style={{ flex: 1 }}>
              Back
            </button>
          )}
          
          {step < 2 ? (
            <button className="btn-primary proceed-btn" onClick={nextStep} style={{ flex: 2 }}>
              Continue
            </button>
          ) : (
            <button 
              className="btn-primary proceed-btn" 
              onClick={handlePayment}
              disabled={isProcessing}
              style={{ flex: 2 }}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Checkout;
