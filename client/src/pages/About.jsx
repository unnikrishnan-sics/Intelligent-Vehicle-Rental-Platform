import { Target, Eye } from 'lucide-react';
import './About.css';

const About = () => {
    return (
        <div className="container about-container">
            <div className="about-hero">
                <h1 className="about-title">About VehicleRent</h1>
                <p className="about-text">
                    VehicleRent is your trusted partner for reliable, affordable, and convenient vehicle rentals.
                    Founded with a passion for travel and a commitment to service, we aim to make every journey memorable.
                    Whether you need a car for a business trip, a bike for a weekend getaway, or a scooter for city commuting,
                    we have the perfect ride for you.
                </p>
            </div>

            <div className="mission-vision">
                <div className="mv-card">
                    <h2 className="mv-title">
                        <Target size={28} />
                        Our Mission
                    </h2>
                    <p className="mv-desc">
                        To provide high-quality, safe, and affordable transportation solutions to our customers,
                        empowering them to explore the world with confidence and ease. We strive to exceed expectations
                        through exceptional customer service and a modern, well-maintained fleet.
                    </p>
                </div>

                <div className="mv-card">
                    <h2 className="mv-title">
                        <Eye size={28} />
                        Our Vision
                    </h2>
                    <p className="mv-desc">
                        To be the leading vehicle rental platform known for innovation, reliability, and sustainability.
                        We envision a future where mobility is accessible to everyone, reducing the need for ownership
                        and promoting a greener, more shared economy.
                    </p>
                </div>
            </div>

            <div className="team-section">
                <h2 className="team-title">Meet Our Team</h2>
                <div className="team-grid">
                    <div className="team-member">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="CEO" className="team-img" />
                        <h3 className="team-name">John Doe</h3>
                        <p className="team-role">CEO & Founder</p>
                    </div>
                    <div className="team-member">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="COO" className="team-img" />
                        <h3 className="team-name">Jane Smith</h3>
                        <p className="team-role">Head of Operations</p>
                    </div>
                    <div className="team-member">
                        <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="CTO" className="team-img" />
                        <h3 className="team-name">Robert Johnson</h3>
                        <p className="team-role">Tech Lead</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
