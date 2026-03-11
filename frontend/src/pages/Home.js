import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: "Welcome to Restaurant Management System",
      description: "Streamline your restaurant operations with our comprehensive management solution",
      image: "🍽️",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 2,
      title: "Manage Orders Effortlessly",
      description: "Track orders from kitchen to table with real-time updates",
      image: "📋",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: 3,
      title: "Table Management Made Easy",
      description: "Monitor table status and optimize seating arrangements",
      image: "🪑",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="home-page">
      {/* Hero Banner Slider */}
      <section className="hero-slider">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ background: slide.gradient }}
            >
              <div className="slide-content">
                <div className="slide-icon">{slide.image}</div>
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-description">{slide.description}</p>
                <button 
                  className="cta-button"
                  onClick={() => navigate('/login')}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button className="slider-nav prev" onClick={goToPrevSlide}>
            &#8249;
          </button>
          <button className="slider-nav next" onClick={goToNextSlide}>
            &#8250;
          </button>

          {/* Dots Indicator */}
          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard Analytics</h3>
              <p>Get real-time insights into your restaurant's performance with comprehensive analytics and reports.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍕</div>
              <h3>Menu Management</h3>
              <p>Easily add, update, and manage your menu items with categories, prices, and availability controls.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Staff Management</h3>
              <p>Manage your team with role-based access control for managers, waiters, and chefs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Reservations</h3>
              <p>Handle customer reservations efficiently with date and time management.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Payment Processing</h3>
              <p>Process payments quickly with support for cash, card, and digital payment methods.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Updates</h3>
              <p>Stay synchronized with real-time order status updates across all devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Restaurant Operations?</h2>
          <p>Join thousands of restaurants already using our management system</p>
          <button 
            className="cta-button-large"
            onClick={() => navigate('/login')}
          >
            Login to Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;

