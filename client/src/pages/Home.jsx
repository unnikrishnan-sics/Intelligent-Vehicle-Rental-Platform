import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Shield, Clock, Award } from 'lucide-react';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [locationQuery, setLocationQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null); // { lat, lon, display_name }
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const wrapperRef = useRef(null);

    // Debounce search for suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (locationQuery.length > 2 && !selectedLocation) {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}&limit=5`
                    );
                    const data = await response.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Error fetching locations:", error);
                }
            } else {
                setSuggestions([]);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [locationQuery, selectedLocation]);

    // Click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleLocationSelect = (place) => {
        setLocationQuery(place.display_name.split(',')[0]); // Keep it short for display
        setSelectedLocation(place);
        setShowSuggestions(false);
    };

    const handleInputChange = (e) => {
        setLocationQuery(e.target.value);
        setSelectedLocation(null); // Reset selection if typing again
    };

    const handleSearch = () => {
        if (selectedLocation) {
            // Navigate to Vehicles page with query params
            navigate(`/vehicles?lat=${selectedLocation.lat}&lng=${selectedLocation.lon}`);
        } else {
            // If no specific location selected, just go to list
            navigate('/vehicles');
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1 className="hero-title animate-fade-in-up">
                        Drive Your <span className="text-primary">Dreams</span> Today
                    </h1>
                    <p className="hero-subtitle animate-fade-in-up delay-100">
                        Experience the ultimate freedom with our premium fleet of vehicles.
                        From luxury cars to city bikes, we have the perfect ride for every journey.
                    </p>

                    {/* Search Widget */}
                    <div className="search-widget animate-fade-in-up delay-200">
                        <div className="search-group location-group" ref={wrapperRef}>
                            <div className="input-wrapper">
                                <MapPin size={20} className="input-icon" />
                                <div className="input-content">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        placeholder="Where are you going?"
                                        value={locationQuery}
                                        onChange={handleInputChange}
                                        onFocus={() => locationQuery.length > 2 && setShowSuggestions(true)}
                                    />
                                </div>

                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="suggestions-list">
                                        {suggestions.map((place) => (
                                            <li
                                                key={place.place_id}
                                                className="suggestion-item"
                                                onClick={() => handleLocationSelect(place)}
                                            >
                                                {place.display_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>


                        <button className="btn-search" onClick={handleSearch}>
                            <Search size={20} />
                            Find Vehicle
                        </button>
                    </div>
                </div>
            </section>

            {/* Brands/Trusted Section */}
            <section className="brands-section">
                <div className="container">
                    <p className="text-center text-gray mb-4 text-sm font-semibold tracking-wider">TRUSTED BY 5,000+ CUSTOMERS</p>
                    <div className="brands-grid">
                        {/* Placeholders for brand logos */}
                        <div className="brand-item">Mercedes-Benz</div>
                        <div className="brand-item">BMW</div>
                        <div className="brand-item">Audi</div>
                        <div className="brand-item">Tesla</div>
                        <div className="brand-item">Toyota</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Why Choose Us</h2>
                        <p className="section-description">We provide the best experience with our carefully curated services.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Shield size={32} />
                            </div>
                            <h3>Secure & Safe</h3>
                            <p>Every vehicle is strictly inspected and sanitized before every trip to ensure your safety.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Clock size={32} />
                            </div>
                            <h3>24/7 Support</h3>
                            <p>Our dedicated support team is available round the clock to assist you with any queries.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-wrapper">
                                <Award size={32} />
                            </div>
                            <h3>Best Price Guarantee</h3>
                            <p>We offer the most competitive rates in the market with no hidden charges.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container cta-container">
                    <div className="cta-content">
                        <h2>Ready to hit the road?</h2>
                        <p>Book your perfect ride today and explore the world on your own terms.</p>
                        <Link to="/vehicles" className="btn btn-primary btn-lg mt-4">Browse Fleet</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
