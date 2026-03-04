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

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: user?.user?.name || user?.name || ''
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

    const validatePayment = () => {
        const { cardNumber, expiry, cvv, name } = paymentData;
        if (cardNumber.length < 19) {
            toast.error('Please enter a valid card number');
            return false;
        }
        if (expiry.length < 5) {
            toast.error('Please enter a valid expiry date');
            return false;
        }
        if (cvv.length < 3) {
            toast.error('Please enter a valid CVV');
            return false;
        }
        if (!name.trim()) {
            toast.error('Please enter the cardholder name');
            return false;
        }
        return true;
    };

    const confirmPayment = async () => {
        if (!validatePayment()) return;
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
                            <p className="text-gray-500">₹{vehicle.pricePerHour}/hour</p>
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
                                        <span>₹{vehicle.pricePerHour}/hr</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                                        <span>Total</span>
                                        <span>₹{totalPrice}</span>
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
                    <div className="payment-body animate-fade-in">
                        <div className="modal-header pt-0">
                            <h2>Confirm & Pay</h2>
                            <p className="text-gray-500 text-sm">Amount due: <b>₹{totalPrice}</b></p>
                        </div>

                        {/* Visual Credit Card */}
                        <div className="credit-card-mock mb-8 hover:transform hover:scale-[1.02] transition-all duration-500">
                            <div className="card-chip"></div>
                            <div className="card-number">
                                {paymentData.cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="card-details">
                                <div>
                                    <div className="card-label">Card Holder</div>
                                    <div className="card-value truncate max-w-[150px]">
                                        {paymentData.name || 'Your Name'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="card-label">Expires</div>
                                    <div className="card-value">{paymentData.expiry || 'MM/YY'}</div>
                                </div>
                            </div>

                            {/* Decorative circles */}
                            <div className="absolute top-6 right-6 flex -space-x-4 opacity-40">
                                <div className="w-10 h-10 rounded-full bg-white/20 blur-[1px]"></div>
                                <div className="w-10 h-10 rounded-full bg-white/20 blur-[1px]"></div>
                            </div>
                        </div>

                        <div className="payment-form space-y-5">
                            <div className="form-group">
                                <label>Card Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={paymentData.cardNumber}
                                        onChange={handlePaymentChange}
                                        placeholder="0000 0000 0000 0000"
                                        className="form-control w-full pl-11"
                                        maxLength="19"
                                    />
                                    <div className="absolute left-4 top-3 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        value={paymentData.expiry}
                                        onChange={handlePaymentChange}
                                        placeholder="MM/YY"
                                        className="form-control"
                                        maxLength="5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        value={paymentData.cvv}
                                        onChange={handlePaymentChange}
                                        placeholder="•••"
                                        className="form-control"
                                        maxLength="3"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Cardholder Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={paymentData.name}
                                    onChange={handlePaymentChange}
                                    className="form-control"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <button
                            className="btn btn-primary w-full mt-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-[0.98]"
                            disabled={isProcessing}
                            onClick={confirmPayment}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Securing Payment...
                                </>
                            ) : (
                                <>
                                    Pay ₹{totalPrice} <ShieldCheck size={20} />
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                            <ShieldCheck size={14} className="text-green-500" />
                            256-bit SSL Encrypted Payment
                        </div>
                    </div>
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
