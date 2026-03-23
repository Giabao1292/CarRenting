import { useMemo, useState } from "react";

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const addMonths = (date, offset) => {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
};

const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const createMonthCells = (baseMonth) => {
  const monthStart = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1);
  const dayOffset = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - dayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);

    return {
      date: cellDate,
      dateKey: toDateKey(cellDate),
      day: cellDate.getDate(),
      inCurrentMonth: cellDate.getMonth() === baseMonth.getMonth(),
    };
  });
};

const MonthPanel = ({ monthDate, startDate, endDate, onSelectDate }) => {
  const monthCells = createMonthCells(monthDate);
  const startKey = startDate ? toDateKey(startDate) : "";
  const endKey = endDate ? toDateKey(endDate) : "";
  const todayKey = toDateKey(new Date());

  return (
    <div className="booking-calendar__month">
      <h4 className="booking-calendar__month-title">
        {MONTH_LABELS[monthDate.getMonth()]}/{monthDate.getFullYear()}
      </h4>

      <div className="booking-calendar__weekday-row">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="booking-calendar__days-grid">
        {monthCells.map((cell) => {
          if (!cell.inCurrentMonth) {
            return (
              <span
                key={`${cell.dateKey}-${cell.day}`}
                className="booking-calendar__day-empty"
                aria-hidden="true"
              />
            );
          }

          const isStart = startKey && cell.dateKey === startKey;
          const isEnd = endKey && cell.dateKey === endKey;
          const isDisabled = cell.dateKey < todayKey;
          const isInRange =
            startKey &&
            endKey &&
            cell.dateKey >= startKey &&
            cell.dateKey <= endKey;

          return (
            <button
              key={`${cell.dateKey}-${cell.day}`}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(cell.dateKey)}
              className={`booking-calendar__day ${isInRange ? "is-in-range" : ""} ${
                isStart || isEnd ? "is-selected" : ""
              } ${isDisabled ? "is-disabled" : ""}
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const BookingDateRangePicker = ({
  startDate,
  endDate,
  activeField,
  onSelectDate,
  onClose,
}) => {
  const parsedStartDate = parseDateValue(startDate);
  const parsedEndDate = parseDateValue(endDate);
  const focusDate = parsedStartDate || new Date();
  const [monthCursor, setMonthCursor] = useState(() =>
    getMonthStart(focusDate),
  );

  const firstMonth = monthCursor;
  const secondMonth = addMonths(firstMonth, 1);

  const monthRangeLabel = useMemo(() => {
    return `${MONTH_LABELS[firstMonth.getMonth()]}/${firstMonth.getFullYear()} - ${MONTH_LABELS[secondMonth.getMonth()]}/${secondMonth.getFullYear()}`;
  }, [firstMonth, secondMonth]);

  const rentalDays =
    parsedStartDate && parsedEndDate
      ? Math.max(
          1,
          Math.ceil(
            (parsedEndDate.getTime() - parsedStartDate.getTime()) / 86400000,
          ),
        )
      : 0;

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__header">
        <p className="booking-calendar__note">
          {rentalDays
            ? `${rentalDays} ngày thuê`
            : "Chọn ngày nhận và ngày trả"}
        </p>
        <div className="booking-calendar__header-actions">
          <button
            type="button"
            className="booking-calendar__close"
            onClick={onClose}
            aria-label="Đóng chọn ngày"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="booking-calendar__nav">
        <button
          type="button"
          className="booking-calendar__nav-btn"
          onClick={() => setMonthCursor((prev) => addMonths(prev, -2))}
          aria-label="Xem 2 tháng trước"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <p className="booking-calendar__nav-label">{monthRangeLabel}</p>

        <button
          type="button"
          className="booking-calendar__nav-btn"
          onClick={() => setMonthCursor((prev) => addMonths(prev, 2))}
          aria-label="Xem 2 tháng sau"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="booking-calendar__months">
        <MonthPanel
          monthDate={firstMonth}
          startDate={parsedStartDate}
          endDate={parsedEndDate}
          onSelectDate={(value) => onSelectDate(activeField, value)}
        />
        <MonthPanel
          monthDate={secondMonth}
          startDate={parsedStartDate}
          endDate={parsedEndDate}
          onSelectDate={(value) => onSelectDate(activeField, value)}
        />
      </div>
    </div>
  );
};

export default BookingDateRangePicker;
