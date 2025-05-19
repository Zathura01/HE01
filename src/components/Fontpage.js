import React, { useState, useEffect } from 'react';
import './../components/Style.css';
import Graph from './Graph';
import Preds from './Preds';

const regionOptions = ["World", "Continent", "Country"];
const developmentModes = ["Both","Developed", "Developing"];

function Frontpage() {
    const [inp, setInp] = useState({ 
        region: "World",
        mode:"Both", 
        country: [], 
        attributes: [] 
    });
    const [countries, setCountries] = useState([]);
    const [alert, setAlert] = useState([true, 1, 2, 3]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "country") {
            if (inp.country.length < 3 && !inp.country.includes(value)) {
                setInp(prev => ({
                    ...prev,
                    country: [...prev.country, value]
                }));
            } else if (inp.country.length >= 3) {
                setAlert(0);
            }
        } else {
            setInp(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const fetchCountries = async () => {
        let req = {
            region: inp.region,
            mode: inp.mode
        }
        try {
            const response = await fetch(`http://127.0.0.1:5000/?region=${encodeURIComponent(inp.region)}&mode=${encodeURIComponent(inp.mode)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const data = await response.json();
            console.log(data)
            if (data) {
                setCountries(data);
                setAlert([false, 1, 2, 3]);
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    };

    const removeCountry = (countryToRemove) => {
        setInp(prev => ({
            ...prev,
            country: prev.country.filter(country => country !== countryToRemove)
        }));
    };

    useEffect(() => {
            fetchCountries();
    }, [inp.mode]);

    return (
        <div className="compact-dashboard">
            <div className="control-row">
                <div className="form-compact">
                    <select 
                        name="region" 
                        value={inp.region} 
                        onChange={handleInputChange}
                        className="compact-select"
                    >
                        <option value="">Region</option>
                        {regionOptions.map((val, ind) => (
                            <option key={ind} value={val}>{val}</option>
                        ))}
                    </select>
                </div>

                <div className="form-compact">
                    <select 
                        name="mode" 
                        value={inp.mode} 
                        onChange={handleInputChange}
                        className="compact-select"
                    >
                        <option value="">Development</option>
                        {developmentModes.map((val, ind) => (
                            <option key={ind} value={val}>{val}</option>
                        ))}
                    </select>
                </div>

                <div className="form-compact">
                    <select 
                        name="country" 
                        value={inp.country} 
                        onChange={handleInputChange}
                        className="compact-select"
                    >
                        <option value="">Countries</option>
                        {countries.map((val, ind) => (
                            <option key={ind} value={val}>{val}</option>
                        ))}
                    </select>
                </div>

                <div className="selected-countries-compact">
                    {inp.country.map((val, ind) => (
                        <span key={ind} className="country-tag-compact">
                            {val}
                            <button 
                                onClick={() => removeCountry(val)}
                                className="remove-btn-compact"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="graph-area">
                <Graph country={inp.country} />
                <Preds country={inp.country} />
            </div>
        </div>
    );
}

export default Frontpage;