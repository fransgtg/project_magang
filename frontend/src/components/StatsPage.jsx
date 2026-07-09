import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatsPage = () => {
    const [stats, setStats] = useState({ totalData: 0, totalSynced: 0, totalUnsynced: 0, syncPercentage: 0 });

    const fetchStats = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/stats");
            setStats(res.data);
        } catch (error) {
            console.error("Error fetch stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // SVG Donut Chart calculations
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (stats.syncPercentage / 100) * circumference;

    return (
        <div className="stats-page-container">
            <h2 className="page-title">Services & Tasks Overview</h2>
            
            <div className="stats-top-cards">
                <div className="stat-box box-red">
                    <h3>Total Data</h3>
                    <p className="value">{stats.totalData.toLocaleString('id-ID')}</p>
                    <span className="label">Keseluruhan LoP</span>
                </div>
                <div className="stat-box box-green">
                    <h3>Tersinkronisasi</h3>
                    <p className="value">{stats.totalSynced.toLocaleString('id-ID')}</p>
                    <span className="label">Tabel Manual (Ada)</span>
                </div>
                <div className="stat-box box-orange">
                    <h3>Belum Sinkron</h3>
                    <p className="value">{stats.totalUnsynced.toLocaleString('id-ID')}</p>
                    <span className="label">Data Horas (Tidak Ada)</span>
                </div>
            </div>

            <div className="stats-middle-grid">
                <div className="chart-card">
                    <h3 className="card-heading">Progress Sinkronisasi</h3>
                    <p className="card-subheading">Persentase data LoP yang selesai</p>
                    <div className="donut-container">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            {/* Background circle */}
                            <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="15" />
                            {/* Progress circle */}
                            <circle 
                                cx="100" cy="100" r={radius} 
                                fill="none" 
                                stroke="#058f44" 
                                strokeWidth="15" 
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(-90 100 100)"
                                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                            />
                        </svg>
                        <div className="donut-center">
                            <span className="percent">{stats.syncPercentage.toFixed(1)}%</span>
                            <span className="status">Done</span>
                        </div>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item"><span className="dot dot-green"></span> Tersinkronisasi</div>
                        <div className="legend-item"><span className="dot dot-gray"></span> Pending</div>
                    </div>
                </div>

                <div className="details-card">
                    <div className="card-header-flex">
                        <h3 className="card-heading">Detail Overview</h3>
                    </div>
                    <p className="card-subheading">Aktivitas keseluruhan data</p>
                    <div className="overview-list">
                        <div className="overview-item">
                            <div className="oi-info">
                                <span>Total Keseluruhan</span>
                                <span>{stats.totalData.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="oi-bar"><div className="fill fill-red" style={{width: '100%'}}></div></div>
                        </div>
                        <div className="overview-item">
                            <div className="oi-info">
                                <span>Tersinkronisasi (Ada)</span>
                                <span>{stats.totalSynced.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="oi-bar"><div className="fill fill-green" style={{width: `${(stats.totalSynced/stats.totalData)*100 || 0}%`}}></div></div>
                        </div>
                        <div className="overview-item">
                            <div className="oi-info">
                                <span>Belum Sinkron (Tidak Ada)</span>
                                <span>{stats.totalUnsynced.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="oi-bar"><div className="fill fill-orange" style={{width: `${(stats.totalUnsynced/stats.totalData)*100 || 0}%`}}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
