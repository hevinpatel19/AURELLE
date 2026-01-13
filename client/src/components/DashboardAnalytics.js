import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

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

    if (loading) return <div style={{ padding: '2rem' }}>Loading Analytics...</div>;
    if (!stats) return <div style={{ padding: '2rem' }}>Error loading stats.</div>;

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
            background: var(--charcoal);
            padding: 20px;
            border-radius: 4px;
            border: var(--border-subtle);
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            text-align: center;
        }
        .stat-value {
            font-size: 1.8rem;
            font-weight: 400;
            font-family: var(--font-display);
            color: var(--gold);
            margin: 5px 0;
        }
        .stat-label {
            color: var(--fog);
            font-size: 0.7rem;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.1em;
        }
        
        /* Charts Layout */
        .charts-section {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        .chart-card {
            background: var(--charcoal);
            padding: 25px;
            border-radius: 4px;
            border: var(--border-subtle);
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .chart-title {
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 20px;
            color: var(--ivory);
            border-left: 3px solid var(--gold);
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

            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '400',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                marginBottom: '1.5rem',
                color: 'var(--ivory)'
            }}>
                Analytics Overview
            </h2>

            {/* 1. TOP CARDS */}
            <div className="analytics-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">₹{stats.counts.revenue.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-value" style={{ color: 'var(--ivory)' }}>{stats.counts.orders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Products</div>
                    <div className="stat-value" style={{ color: 'var(--ivory)' }}>{stats.counts.products}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Registered Users</div>
                    <div className="stat-value" style={{ color: 'var(--ivory)' }}>{stats.counts.users}</div>
                </div>
            </div>

            <div className="charts-section">

                {/* 2. REVENUE CHART (Full Width) */}
                <div className="chart-card">
                    <h3 className="chart-title">Revenue Trend (Last 30 Days)</h3>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <LineChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" fontSize={11} tickMargin={10} />
                                <YAxis stroke="#888" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111',
                                        borderRadius: '4px',
                                        border: '1px solid #333',
                                        color: '#eee'
                                    }}
                                    itemStyle={{ color: '#B8976A' }}
                                    formatter={(value) => [`₹${value}`, 'Sales']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#B8976A"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#B8976A' }}
                                    activeDot={{ r: 5 }}
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
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="date" stroke="#888" fontSize={10} tick={false} />
                                    <YAxis stroke="#888" fontSize={11} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#1a1a1a' }}
                                        contentStyle={{
                                            backgroundColor: '#111',
                                            borderRadius: '4px',
                                            border: '1px solid #333',
                                            color: '#eee'
                                        }}
                                    />
                                    <Bar dataKey="orders" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={12} fillOpacity={0.7} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* TOP PRODUCTS CHART */}
                    <div className="chart-card">
                        <h3 className="chart-title">Top Selling Products</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart layout="vertical" data={stats.topProducts} margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                    <XAxis type="number" stroke="#888" fontSize={11} allowDecimals={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="_id"
                                        width={120}
                                        stroke="#ccc"
                                        fontSize={11}
                                        tickFormatter={(val) => val.length > 18 ? val.slice(0, 18) + '...' : val}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#1a1a1a' }}
                                        contentStyle={{
                                            backgroundColor: '#111',
                                            borderRadius: '4px',
                                            border: '1px solid #333',
                                            color: '#eee'
                                        }}
                                    />
                                    <Bar dataKey="totalSold" fill="#10B981" radius={[0, 2, 2, 0]} barSize={12} name="Units Sold" fillOpacity={0.7} />
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