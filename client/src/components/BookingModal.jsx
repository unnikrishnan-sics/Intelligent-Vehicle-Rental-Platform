import { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../redux/slices/bookingSlice'; // We need to create this
import { toast } from 'react-toastify';
import CustomDatePicker from './CustomDatePicker';
import './BookingModal.css';

const BookingModal = ({ vehicle, onClose }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Dates
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success

    // Calculate Price
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const hours = Math.abs(end - start) / 36e5;
            if (hours > 0) {
                setTotalPrice(Math.round(hours * vehicle.pricePerHour));
            } else {
                setTotalPrice(0);
            }
        }
    }, [startDate, endDate, vehicle.pricePerHour]);

    const handleBooking = () => {
        if (!user) {
            toast.error('Please login to book a vehicle');
            return;
        }
        setStep(2); // Move to Payment
    };

    // Payment Form State
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: user?.name || ''
    });

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').replace(/^(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }

        setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const confirmPayment = async () => {
        setIsProcessing(true);

        // Simulate Payment Gateway Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Dispatch Booking Action
        const bookingData = {
            vehicleId: vehicle._id,
            startDate,
            endDate,
            totalPrice
        };

        try {
            await dispatch(createBooking(bookingData)).unwrap();
            setStep(3);
            toast.success('Payment Successful! Booking Confirmed.');
        } catch (error) {
            toast.error(error || 'Booking Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content booking-modal">
                <button className="close-btn" onClick={onClose}><X /></button>

                {step === 1 && (
                    <>
                        <div className="modal-header">
                            <h2>Book {vehicle.make} {vehicle.model}</h2>
                            <p className="text-gray-500">${vehicle.pricePerHour}/hour</p>
                        </div>
                        <div className="modal-body">
                            <div className="date-selection">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <CustomDatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        minDate={vehicle.nextAvailableDate ? new Date(vehicle.nextAvailableDate) : new Date()}
                                        showTimeSelect
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholder="Select Pick-up Date"
                                    />
                                    {vehicle.nextAvailableDate && (
                                        <small className="text-red-500 mt-1 block">
                                            Note: Vehicle is unavailable until {new Date(vehicle.nextAvailableDate).toLocaleDateString()}
                                        </small>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <CustomDatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        minDate={startDate || (vehicle.nextAvailableDate ? new Date(vehicle.nextAvailableDate) : new Date())}
                                        showTimeSelect
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholder="Select Drop-off Date"
                                    />
                                </div>
                            </div>
                            {totalPrice > 0 && (
                                <div className="price-summary">
                                    <div className="flex justify-between">
                                        <span>Rate</span>
                                        <span>${vehicle.pricePerHour}/hr</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                                        <span>Total</span>
                                        <span>${totalPrice}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn btn-primary w-full mt-4"
                                disabled={!startDate || !endDate || totalPrice <= 0}
                                onClick={handleBooking}
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="modal-header text-center border-b-0 pb-0">
                            <h2>Secure Checkout</h2>
                            <p className="text-gray-500 text-sm">Complete your payment of <b>${totalPrice}</b></p>
                        </div>

                        <div className="payment-body p-6">
                            {/* Visual Credit Card */}
                            <div className="credit-card-mock mb-6 mx-auto transform hover:scale-105 transition-transform duration-300">
                                <div className="card-chip mb-4"></div>
                                <div className="card-number mb-4 text-xl tracking-widest">
                                    {paymentData.cardNumber || '#### #### #### ####'}
                                </div>
                                <div className="card-details flex justify-between items-end">
                                    <div>
                                        <div className="text-xs opacity-75 mb-1">Card Holder</div>
                                        <div className="uppercase font-medium tracking-wide">
                                            {paymentData.name || 'YOUR NAME'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs opacity-75 mb-1">Expires</div>
                                        <div className="font-medium">{paymentData.expiry || 'MM/YY'}</div>
                                    </div>
                                </div>
                                {/* Decorative circle */}
                                <div className="absolute top-4 right-4 opacity-50">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white opacity-20"></div>
                                        <div className="w-8 h-8 rounded-full bg-white opacity-20 -ml-4"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-form space-y-4">
                                <div className="form-group">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={paymentData.cardNumber}
                                            onChange={handlePaymentChange}
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            maxLength="19"
                                        />
                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry Date</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            value={paymentData.expiry}
                                            onChange={handlePaymentChange}
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            maxLength="5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CVV</label>
                                        <input
                                            type="password"
                                            name="cvv"
                                            value={paymentData.cvv}
                                            onChange={handlePaymentChange}
                                            placeholder="123"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            maxLength="3"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={paymentData.name}
                                        onChange={handlePaymentChange}
                                        placeholder="Name on Card"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                className="btn btn-primary w-full mt-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                                disabled={isProcessing}
                                onClick={confirmPayment}
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Pay ${totalPrice} <ShieldCheck size={18} />
                                    </span>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                                <ShieldCheck size={12} /> SSL Secured Transaction
                            </p>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <div className="text-center py-12 px-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-800">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                            Your <b>{vehicle.make} {vehicle.model}</b> is reserved. We've sent a confirmation email to <b>{user.email}</b>.
                        </p>
                        <button
                            className="btn btn-primary w-full py-3"
                            onClick={onClose}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
