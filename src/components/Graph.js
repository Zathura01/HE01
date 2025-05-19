import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Graph.css'; // We'll create this CSS file

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Graph({ country }) {
    const [graphData, setGraphData] = useState({});
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Elegant color palette
    const countryColors = [
        '#4E79A7', // Soft blue
        '#F28E2B', // Warm orange
        '#E15759'  // Muted red
    ];

    const metrics = [
        { key: 'lifeexp', label: 'Life Expectancy', unit: 'years' },
        { key: 'hiv', label: 'HIV Prevalence', unit: 'cases per 1000' },
        { key: 'gdp', label: 'GDP per Capita', unit: 'USD' }
    ];

    const getGraphData = async (country) => {
        if (!country) return;
        try {
            setLoading(true);
            const response = await fetch(`http://127.0.0.1:5000/graph/${country}`);
            const res = await response.json();
            
            if (res.years && res.lifeexp) {
                setGraphData(prev => ({
                    ...prev,
                    [country]: res
                }));
            }
        } catch (error) {
            console.error("Error fetching graph data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!Array.isArray(country)) return;

        const availableCountries = country.filter(c => graphData[c]);
        
        const newChartData = {};
        metrics.forEach(metric => {
            newChartData[metric.key] = {
                labels: availableCountries.length > 0 ? graphData[availableCountries[0]].years : [],
                datasets: availableCountries.map((countryName, index) => ({
                    label: countryName,
                    data: graphData[countryName][metric.key],
                    borderColor: countryColors[index],
                    backgroundColor: `${countryColors[index]}20`,
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: countryColors[index],
                    pointRadius: 4,
                    pointHoverRadius: 6
                }))
            };
        });

        setChartData(newChartData);
    }, [graphData, country]);

    useEffect(() => {
        if (Array.isArray(country)) {
            country.forEach(countryName => {
                if (!graphData[countryName]) {
                    getGraphData(countryName);
                }
            });
        }
    }, [country]);

    return (
        <div className="graph-dashboard">
            <div className="dashboard-header">
                <h2>Country Health Metrics Comparison</h2>
                <p className="subtitle">Visualizing key development indicators across nations</p>
            </div>

            {loading && country.length > 0 ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading data...</p>
                </div>
            ) : (
                <div className="metrics-grid">
                    {metrics.map(metric => (
                        <div key={metric.key} className="metric-card">
                            <div className="metric-header">
                                <h3>{metric.label}</h3>
                                <span className="unit">{metric.unit}</span>
                            </div>
                            <div className="chart-container">
                                {chartData[metric.key] ? (
                                    <Line
                                        data={chartData[metric.key]}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { 
                                                    position: 'top',
                                                    labels: {
                                                        boxWidth: 12,
                                                        padding: 20,
                                                        usePointStyle: true,
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                    titleFont: { size: 14 },
                                                    bodyFont: { size: 12 },
                                                    padding: 12,
                                                    usePointStyle: true,
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: {
                                                        display: false
                                                    },
                                                    ticks: {
                                                        color: '#666'
                                                    }
                                                },
                                                y: {
                                                    grid: {
                                                        color: 'rgba(0,0,0,0.05)'
                                                    },
                                                    ticks: {
                                                        color: '#666'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="no-data">
                                        Select countries to view data
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Graph;