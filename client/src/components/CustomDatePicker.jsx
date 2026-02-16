import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from 'lucide-react';
import './CustomDatePicker.css';

const CustomInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
    <div className={`custom-date-input-wrapper ${className}`} onClick={onClick} ref={ref}>
        <CalendarIcon size={18} className="input-icon" />
        <input
            type="text"
            value={value}
            placeholder={placeholder || "Select Date"}
            readOnly
            className="custom-date-display"
        />
    </div>
));

const CustomDatePicker = ({ selected, onChange, placeholder, minDate, showTimeSelect, dateFormat, className }) => {
    return (
        <DatePicker
            selected={selected}
            onChange={onChange}
            customInput={<CustomInput placeholder={placeholder} className={className} />}
            minDate={minDate}
            showTimeSelect={showTimeSelect}
            dateFormat={dateFormat || (showTimeSelect ? "MMMM d, yyyy h:mm aa" : "MMMM d, yyyy")}
            popperClassName="custom-datepicker-popper"
            calendarClassName="custom-datepicker-calendar"
            wrapperClassName="w-full"
        />
    );
};

export default CustomDatePicker;
