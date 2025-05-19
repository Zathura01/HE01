import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Preds.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Preds({ country }) {
    const [graphData, setGraphData] = useState({});
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Matching color palette
    const countryColors = [
        '#4E79A7', // Soft blue
        '#F28E2B', // Warm orange
        '#E15759'  // Muted red
    ];

    const metrics = [
        { key: 'lifeexp', label: 'Life Expectancy Prediction', unit: 'years' },
        { key: 'hiv', label: 'HIV Prevalence Forecast', unit: 'cases per 1000' },
        { key: 'gdp', label: 'GDP Projection', unit: 'USD' }
    ];

    const getGraphData = async (country) => {
        if (!country) return;
        try {
            setLoading(true);
            const response = await fetch(`http://127.0.0.1:5000/predictions/${country}`);
            const res = await response.json();
            
            if (res.years && res.lifeexp) {
                setGraphData(prev => ({
                    ...prev,
                    [country]: {
                        ...res,
                        // Add visual distinction for predicted years
                        years: res.years.map(year => year > new Date().getFullYear() ? `${year}*` : year)
                    }
                }));
            }
        } catch (error) {
            console.error("Error fetching prediction data:", error);
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
                    borderWidth: 3,
                    borderDash: graphData[countryName].years.some(year => year.toString().includes('*')) ? [5, 5] : [],
                    tension: 0.3,
                    pointBackgroundColor: countryColors[index],
                    pointRadius: function(context) {
                        return context.dataIndex === graphData[countryName].years.length - 11 ? 6 : 4;
                    },
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
        <div className="predictions-container">
            <div className="predictions-header">
                <h2>10-Year Projections</h2>
                <p className="subtitle">Forecasted trends based on current data patterns</p>
                <div className="prediction-key">
                    <span className="key-item"><span className="dashed-line"></span> Projected values</span>
                    <span className="key-item"><span className="solid-line"></span> Historical data</span>
                </div>
            </div>

            {loading && country.length > 0 ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Generating predictions...</p>
                </div>
            ) : (
                <div className="predictions-grid">
                    {metrics.map(metric => (
                        <div key={metric.key} className="prediction-card">
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
                                                    callbacks: {
                                                        label: function(context) {
                                                            return `${context.dataset.label}: ${context.parsed.y} ${metric.unit}`;
                                                        }
                                                    }
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: {
                                                        display: false
                                                    },
                                                    ticks: {
                                                        color: '#666',
                                                        callback: function(value) {
                                                            // Highlight prediction years
                                                            if (value.includes('*')) {
                                                                return value.replace('*', '');
                                                            }
                                                            return value;
                                                        }
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
                                            },
                                            elements: {
                                                line: {
                                                    borderDash: function(context) {
                                                        // Dashed line for predictions
                                                        const chart = context.chart;
                                                        const dataset = chart.data.datasets[context.datasetIndex];
                                                        return dataset.borderDash || [];
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="no-data">
                                        Select countries to view projections
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

export default Preds;