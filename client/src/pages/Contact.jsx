import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const { name, email, subject, message } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        console.log(formData);
        setSubmitted(true);
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });

        setTimeout(() => {
            setSubmitted(false);
        }, 5000);
    };

    return (
        <div className="container contact-container">
            <div className="contact-layout">
                <div>
                    <div className="contact-header">
                        <h1 className="contact-heading">Get in Touch</h1>
                        <p className="contact-text">
                            Have questions about our rental services? Need help with a booking?
                            Our team is here to assist you. Reach out to us via phone, email, or usage
                            the form below.
                        </p>
                    </div>

                    <div className="contact-info-card">
                        <div className="info-item">
                            <div className="info-icon">
                                <Phone size={24} />
                            </div>
                            <div className="info-content">
                                <h3>Phone</h3>
                                <p>+1 (555) 123-4567</p>
                                <p>Mon-Fri, 9am - 6pm</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <Mail size={24} />
                            </div>
                            <div className="info-content">
                                <h3>Email</h3>
                                <p>support@vehiclerent.com</p>
                                <p>info@vehiclerent.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <MapPin size={24} />
                            </div>
                            <div className="info-content">
                                <h3>Office</h3>
                                <p>123 Freedom Way, Suite 400</p>
                                <p>New York, NY 10012</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contact-form-wrapper">
                    <h2 className="contact-form-title">Send us a Message</h2>

                    {submitted && (
                        <div className="status-success">
                            Message sent successfully! We'll get back to you soon.
                        </div>
                    )}

                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={onChange}
                                className="form-control"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className="form-control"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject" className="form-label">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={subject}
                                onChange={onChange}
                                className="form-control"
                                placeholder="How can we help?"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message" className="form-label">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={message}
                                onChange={onChange}
                                className="form-control"
                                rows="5"
                                placeholder="Write your message here..."
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            <Send size={18} style={{ marginRight: '0.5rem' }} />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
