import { useMemo, useState } from "react";

const LOCATION_SUGGESTIONS = [
  "Đà Nẵng",
  "Hội An",
  "Hồ Chí Minh",
  "Hà Nội",
  "Bình Dương",
  "Khánh Hòa",
  "Đà Lạt",
  "Cần Thơ",
];

const BookingLocationPicker = ({ value, onSelectLocation, onClose }) => {
  const [keyword, setKeyword] = useState("");

  const filteredSuggestions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return LOCATION_SUGGESTIONS;
    }

    return LOCATION_SUGGESTIONS.filter((city) =>
      city.toLowerCase().includes(normalizedKeyword),
    );
  }, [keyword]);

  return (
    <div className="booking-location-picker">
      <div className="booking-location-picker__header">
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="booking-location-picker__search"
          placeholder="Nhập địa điểm"
          autoFocus
        />
        <button
          type="button"
          className="booking-location-picker__close"
          onClick={onClose}
          aria-label="Đóng chọn địa điểm"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <button
        type="button"
        className="booking-location-picker__current"
        onClick={() => {
          onSelectLocation("Địa điểm hiện tại");
          onClose();
        }}
      >
        <span className="material-symbols-outlined">my_location</span>
        Địa điểm hiện tại
      </button>

      <p className="booking-location-picker__section-label">
        Thành phố hiển thị danh sách xe
      </p>

      <div className="booking-location-picker__cities">
        {filteredSuggestions.map((city) => (
          <button
            type="button"
            key={city}
            className={`booking-location-picker__city ${
              city === value ? "is-selected" : ""
            }`}
            onClick={() => {
              onSelectLocation(city);
              onClose();
            }}
          >
            <span className="booking-location-picker__city-icon">◍</span>
            <span>{city}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookingLocationPicker;
