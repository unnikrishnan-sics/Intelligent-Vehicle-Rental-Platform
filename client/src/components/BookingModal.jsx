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
                        <div className="modal-header text-center">
                            <h2>Secure Payment</h2>
                            <p className="text-gray-500">Pay ${totalPrice} to confirm booking</p>
                        </div>

                        <div className="payment-form">
                            <div className="form-group mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    maxLength="19"
                                />
                            </div>
                            <div className="flex gap-4 mb-4">
                                <div className="form-group flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        maxLength="5"
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input
                                        type="password"
                                        placeholder="123"
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        maxLength="3"
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="Name on Card"
                                    defaultValue={user?.name || ''}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2">
                                <span className="flex items-center justify-center gap-1">
                                    <ShieldCheck size={12} /> Secure Payment Gateway (Simulation)
                                </span>
                            </p>
                        </div>

                        <button
                            className="btn btn-primary w-full mt-6"
                            disabled={isProcessing}
                            onClick={confirmPayment}
                        >
                            {isProcessing ? 'Processing Payment...' : `Pay $${totalPrice} & Confirm`}
                        </button>
                    </>
                )}

                {step === 3 && (
                    <div className="text-center py-8">
                        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-6">Your ride is ready. You will receive an email shortly.</p>
                        <button className="btn btn-primary" onClick={onClose}>View My Bookings</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
