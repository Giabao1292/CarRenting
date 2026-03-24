import { useEffect, useRef } from "react";

const TIME_SLOTS = Array.from({ length: 24 }, (_, hour) => {
  return `${String(hour).padStart(2, "0")}:00`;
});

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toMinutes = (timeValue) => {
  const [hours, minutes] = (timeValue || "").split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }

  return hours * 60 + minutes;
};

const BookingTimePicker = ({
  title,
  selectedTime,
  selectedDate,
  onSelectTime,
  onClose,
  minimumLeadHours = 1,
}) => {
  const listRef = useRef(null);
  const selectedItemRef = useRef(null);
  const now = new Date();
  const todayKey = toDateKey(now);
  const selectedDateKey = selectedDate || "";
  const minimumSelectableMinutes =
    now.getHours() * 60 + now.getMinutes() + minimumLeadHours * 60;

  useEffect(() => {
    if (!selectedItemRef.current || !listRef.current) {
      return;
    }

    selectedItemRef.current.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [selectedTime, selectedDate]);

  return (
    <div className="booking-time-picker">
      <div className="booking-time-picker__header">
        <p>{title}</p>
        <button
          type="button"
          className="booking-time-picker__close"
          onClick={onClose}
          aria-label="Đóng chọn giờ"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div
        className="booking-time-picker__list"
        role="listbox"
        aria-label={title}
        ref={listRef}
      >
        {TIME_SLOTS.map((time) => {
          const isSelected = time === selectedTime;
          const slotMinutes = toMinutes(time);
          const isPastDate = Boolean(
            selectedDateKey && selectedDateKey < todayKey,
          );
          const isTodayRestricted =
            selectedDateKey === todayKey &&
            slotMinutes < minimumSelectableMinutes;
          const isDisabled = isPastDate || isTodayRestricted;

          return (
            <button
              key={time}
              type="button"
              className={`booking-time-picker__item ${isSelected ? "is-selected" : ""} ${
                isDisabled ? "is-disabled" : ""
              }`}
              onClick={() => onSelectTime(time)}
              disabled={isDisabled}
              aria-selected={isSelected}
              ref={isSelected ? selectedItemRef : null}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingTimePicker;
