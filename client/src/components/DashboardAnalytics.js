import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar
} from 'recharts';
import API_BASE_URL from "../api";

const DashboardAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE_URL}/api/stats`, {

            headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{padding:'2rem'}}>Loading Analytics...</div>;
  if (!stats) return <div style={{padding:'2rem'}}>Error loading stats.</div>;

  return (
    <div className="fade-in">
      <style>{`
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #eee;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            text-align: center;
        }
        .stat-value {
            font-size: 1.8rem;
            font-weight: 800;
            color: #1a1a1a;
            margin: 5px 0;
        }
        .stat-label {
            color: #666;
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        
        /* Charts Layout */
        .charts-section {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        .chart-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #eee;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .chart-title {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #333;
            border-left: 4px solid #000;
            padding-left: 10px;
        }
        
        .split-charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }

        @media (max-width: 1000px) {
            .split-charts { grid-template-columns: 1fr; }
        }
      `}</style>

      <h2 style={{fontSize:'1.8rem', fontWeight:'800', marginBottom:'1.5rem', textTransform:'uppercase'}}>
        Dashboard Overview
      </h2>

      {/* 1. TOP CARDS */}
      <div className="analytics-grid">
        <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value" style={{color: '#16a34a'}}>₹{stats.counts.revenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.counts.orders}</div>
        </div>
        <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{stats.counts.products}</div>
        </div>
        <div className="stat-card">
            <div className="stat-label">Registered Users</div>
            <div className="stat-value">{stats.counts.users}</div>
        </div>
      </div>

      <div className="charts-section">
        
        {/* 2. REVENUE CHART (Full Width) */}
        <div className="chart-card">
            <h3 className="chart-title">Revenue Trend (Last 30 Days)</h3>
            <div style={{ height: '350px' }}>
                {/* ADDED minWidth={0} HERE */}
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={10} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`₹${value}`, 'Sales']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#000" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill:'#000' }} 
                            activeDot={{ r: 6 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 3. SPLIT ROW: Orders & Top Products */}
        <div className="split-charts">
            
            {/* ORDERS CHART */}
            <div className="chart-card">
                <h3 className="chart-title">Orders Per Day</h3>
                <div style={{ height: '300px' }}>
                    {/* ADDED minWidth={0} HERE */}
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" stroke="#888" fontSize={10} tick={false} /> {/* Hiding dates for cleaner look on small bars */}
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip 
                                cursor={{fill: '#f9f9f9'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TOP PRODUCTS CHART */}
            <div className="chart-card">
                <h3 className="chart-title">Top Selling Products</h3>
                <div style={{ height: '300px' }}>
                    {/* ADDED minWidth={0} HERE */}
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart layout="vertical" data={stats.topProducts} margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" stroke="#888" fontSize={12} />
                            <YAxis 
                                type="category" 
                                dataKey="_id" 
                                width={100} 
                                stroke="#000" 
                                fontSize={11} 
                                tickFormatter={(val) => val.length > 15 ? val.slice(0,15)+'...' : val} // Truncate long names
                            />
                            <Tooltip 
                                cursor={{fill: '#f9f9f9'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="totalSold" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="Units Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;