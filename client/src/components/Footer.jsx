import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>
                            <Car size={28} />
                            VehicleRent
                        </h3>
                        <p className="footer-description">
                            Experience the freedom of the road with our premium vehicle rental service.
                            Reliable, affordable, and ready when you are.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link"><Facebook size={20} /></a>
                            <a href="#" className="social-link"><Twitter size={20} /></a>
                            <a href="#" className="social-link"><Instagram size={20} /></a>
                            <a href="#" className="social-link"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/vehicles">Vehicles</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-heading">Support</h4>
                        <ul className="footer-links">
                            <li><Link to="#">Help Center</Link></li>
                            <li><Link to="#">Terms of Service</Link></li>
                            <li><Link to="#">Privacy Policy</Link></li>
                            <li><Link to="#">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-heading">Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <MapPin size={18} style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                                <span>123 Freedom Way,<br />New York, NY 10012</span>
                            </li>
                            <li>
                                <Phone size={18} style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li>
                                <Mail size={18} style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                                <span>support@vehiclerent.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} VehicleRent. All rights reserved.</p>
                    <div className="footer-links" style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link to="#">Privacy</Link>
                        <Link to="#">Terms</Link>
                        <Link to="#">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
