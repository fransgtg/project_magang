import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-floating-wrapper">
      {/* Background blobs for the wrapper */}
      <div className="float-bg-blob top-left"></div>
      <div className="float-bg-blob bottom-right"></div>
      
      {/* 3D-like CSS Rings in Background */}
      <div className="bg-ring-container ring-1">
        <div className="abstract-ring"></div>
        <div className="abstract-ring inner"></div>
      </div>
      <div className="bg-ring-container ring-2">
        <div className="abstract-ring"></div>
        <div className="abstract-ring inner"></div>
      </div>



      <div className="floating-card-container">
        <div className="floating-card">
          <div className="card-body">
            <div className="body-center">
              <h1 className="hero-title title-anim">
                Report<span>LoP</span>
              </h1>
              <p className="hero-desc desc-anim">
                Solusi modern untuk memantau, mengelola, dan mensinkronisasikan puluhan ribu data LoP secara real-time dengan presisi tinggi.
              </p>
              <button className="btn-learn-more btn-anim" onClick={() => navigate('/dashboard/stats')}>
                Mulai Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;