const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        const logoPath = path.join(__dirname, '../assets/logo.png');

        const mailOptions = {
            from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
            attachments: [{
                filename: 'logo.png',
                path: logoPath,
                cid: 'logo' // same cid value as in the html img src
            }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to prevent blocking the main flow, just log it
        return null;
    }
};

// --- Email Templates ---

const logoHtml = `<div style="text-align: center; margin-bottom: 20px;"><img src="cid:logo" alt="IntelliDrive" style="width: 150px;"/></div>`;
const footerHtml = `<div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 12px;"><p>&copy; ${new Date().getFullYear()} IntelliDrive Vehicle Rental. All rights reserved.</p></div>`;

const getBaseTemplate = (content) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        ${logoHtml}
        <div style="color: #333; line-height: 1.6;">
            ${content}
        </div>
        ${footerHtml}
    </div>
    `;
};

// 1. Welcome Email
exports.sendWelcomeEmail = async (user) => {
    const content = `
        <h2 style="color: #2563EB;">Welcome to IntelliDrive!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining IntelliDrive - The smartest way to rent vehicles.</p>
        <p>You can now browse our premium fleet, book rides, and track them in real-time.</p>
        <p><strong>Get ready to hit the road!</strong></p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:5173/login" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
        </div>
    `;
    return sendEmail({
        to: user.email,
        subject: 'Welcome to IntelliDrive!',
        html: getBaseTemplate(content)
    });
};

// 2. Booking Confirmation
exports.sendBookingConfirmation = async (user, booking, vehicle) => {
    const content = `
        <h2 style="color: #2563EB;">Booking Received</h2>
        <p>Hi ${user.name},</p>
        <p>We have received your booking request. Our team is reviewing it now.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})</p>
            <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
            <p><strong>Dates:</strong> ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</p>
        </div>
        
        <p>You will receive another email once your booking is confirmed.</p>
    `;
    return sendEmail({
        to: user.email,
        subject: 'Booking Received - IntelliDrive',
        html: getBaseTemplate(content)
    });
};

// 3. Status Update
exports.sendBookingStatusUpdate = async (user, booking, vehicle, status) => {
    let color = '#2563EB';
    let message = '';

    if (status === 'confirmed') {
        color = '#10B981'; // Green
        message = 'Great news! Your booking has been confirmed. You can complete the payment in your dashboard.';
    } else if (status === 'cancelled') {
        color = '#EF4444'; // Red
        message = 'We regret to inform you that your booking has been cancelled.';
    } else if (status === 'completed') {
        color = '#2563EB'; // Blue
        message = 'We hope you enjoyed your ride! Your trip is now marked as completed.';
    } else if (status === 'active') {
        color = '#F59E0B'; // Orange
        message = 'Your trip has started! Drive safely.';
    }

    const content = `
        <h2 style="color: ${color};">Booking ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
        <p>Hi ${user.name},</p>
        <p>${message}</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:5173/dashboard" style="background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking</a>
        </div>
    `;
    return sendEmail({
        to: user.email,
        subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} - IntelliDrive`,
        html: getBaseTemplate(content)
    });
};

// 4. Payment Receipt
exports.sendPaymentReceipt = async (user, booking, vehicle, amount) => {
    const content = `
        <h2 style="color: #10B981;">Payment Successful</h2>
        <p>Hi ${user.name},</p>
        <p>We received your payment of <strong>$${amount}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p><strong>Transaction ID:</strong> ${booking.transactionId || 'TXN-' + Date.now()}</p>
             <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
             <p><strong>Amount Paid:</strong> $${amount}</p>
        </div>
        
        <p>Thank you for choosing IntelliDrive!</p>
    `;
    return sendEmail({
        to: user.email,
        subject: 'Payment Receipt - IntelliDrive',
        html: getBaseTemplate(content)
    });
};
