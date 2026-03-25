import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import BookingDateRangePicker from "../../common/BookingDateRangePicker";
import BookingLocationPicker from "../../common/BookingLocationPicker";
import BookingTimePicker from "../../common/BookingTimePicker";

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const addDaysToDateKey = (dateKey, daysToAdd = 1) => {
  const baseDate = parseDateKey(dateKey);
  if (!baseDate) {
    return "";
  }

  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return getDateKey(nextDate);
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "Chọn ngày";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const PickerField = ({
  icon,
  label,
  value,
  name,
  onOpen,
  displayFormatter,
  isActive,
  dropdownType,
  alignRight = false,
  children,
  highlighted = false,
}) => {
  return (
    <div
      className={`hero-search-modal__field-wrapper ${isActive ? "is-active" : ""}`}
    >
      <div
        className={`hero-search-modal__field ${highlighted ? "is-highlighted" : ""} ${
          isActive ? "is-active" : ""
        }`}
      >
        <p className="hero-search-modal__field-label">{label}</p>
        <div className="hero-search-modal__field-input-wrapper">
          <span className="material-symbols-outlined">{icon}</span>
          <button
            type="button"
            className="hero-search-modal__field-button"
            onClick={() => onOpen(name)}
          >
            {displayFormatter ? displayFormatter(value) : value}
          </button>
        </div>
      </div>

      {isActive && children ? (
        <div
          className={`hero-search-modal__dropdown hero-search-modal__dropdown--${dropdownType} ${
            alignRight ? "is-right" : ""
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};

const HeroSearchModal = ({
  show,
  onHide,
  formData,
  rentalDuration,
  showNightNotice,
  onFieldChange,
  onSelectLocationOption,
  onSubmit,
}) => {
  const [activePicker, setActivePicker] = useState(null);
  const modalBodyRef = useRef(null);

  useEffect(() => {
    if (!activePicker) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!modalBodyRef.current) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (!modalBodyRef.current.contains(target)) {
        return;
      }

      if (!target.closest(".hero-search-modal__field-wrapper")) {
        setActivePicker(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activePicker]);

  const handleDateSelection = (field, dateValue) => {
    const today = getDateKey(new Date());

    // Chặn ngày quá khứ
    if (dateValue < today) {
      return;
    }

    if (field === "pickupDate") {
      onFieldChange("pickupDate", dateValue);
      const nextDay = addDaysToDateKey(dateValue, 1) || dateValue;

      // pickupDate mới sau/đúng returnDate hiện tại hoặc thiếu returnDate -> tự set +1 ngày
      if (formData.returnDate && dateValue >= formData.returnDate) {
        onFieldChange("returnDate", nextDay);
      } else if (!formData.returnDate) {
        onFieldChange("returnDate", nextDay);
      }

      // Giống flow car-detail: chọn ngày nhận xong thì chuyển qua chọn ngày trả.
      setActivePicker("returnDate");
      return;
    }

    if (field === "returnDate") {
      if (!formData.pickupDate) {
        onFieldChange("pickupDate", dateValue);
        onFieldChange(
          "returnDate",
          addDaysToDateKey(dateValue, 1) || dateValue,
        );
        setActivePicker("returnDate");
        return;
      }

      // Nếu ngày trả <= ngày nhận: reset từ ngày nhận mới và yêu cầu chọn lại ngày trả.
      if (dateValue <= formData.pickupDate) {
        onFieldChange("pickupDate", dateValue);
        onFieldChange(
          "returnDate",
          addDaysToDateKey(dateValue, 1) || dateValue,
        );
        setActivePicker("returnDate");
        return;
      }

      // Return hợp lệ -> cập nhật và chuyển qua chọn giờ nhận.
      onFieldChange("returnDate", dateValue);
      setActivePicker("pickupTime");
    }
  };

  const handleTimeSelection = (timeValue) => {
    if (!activePicker) {
      return;
    }

    onFieldChange(activePicker, timeValue);
    setActivePicker(null);
  };

  const handleFormSubmit = (event) => {
    setActivePicker(null);
    onSubmit(event);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="hero-search-modal"
      contentClassName="hero-search-modal__content"
    >
      <Modal.Header closeButton className="hero-search-modal__header">
        <Modal.Title className="hero-search-modal__title">Tìm xe</Modal.Title>
      </Modal.Header>

      <Modal.Body className="hero-search-modal__body">
        <div ref={modalBodyRef}>
          <Form onSubmit={handleFormSubmit}>
            <div
              className={`hero-search-modal__field-wrapper ${
                activePicker === "location" ? "is-active" : ""
              }`}
            >
              <div
                className={`hero-search-modal__location-block ${
                  activePicker === "location" ? "is-active" : ""
                }`}
              >
                <p className="hero-search-modal__field-label">Địa điểm</p>
                <div className="hero-search-modal__field-input-wrapper">
                  <span className="material-symbols-outlined">location_on</span>
                  <button
                    type="button"
                    className="hero-search-modal__field-button"
                    onClick={() => setActivePicker("location")}
                  >
                    {formData.location || "Chọn địa điểm"}
                  </button>
                </div>
              </div>

              {activePicker === "location" ? (
                <div className="hero-search-modal__dropdown hero-search-modal__dropdown--location">
                  <BookingLocationPicker
                    value={formData.location}
                    onSelectLocation={onSelectLocationOption}
                    onClose={() => setActivePicker(null)}
                  />
                </div>
              ) : null}
            </div>

            <Row className="g-2 mt-1">
              <Col xs={6}>
                <PickerField
                  icon="calendar_today"
                  label="Ngày nhận xe"
                  dropdownType="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  displayFormatter={formatDisplayDate}
                  onOpen={setActivePicker}
                  isActive={activePicker === "pickupDate"}
                >
                  <BookingDateRangePicker
                    startDate={formData.pickupDate}
                    endDate={formData.returnDate}
                    activeField={activePicker}
                    onSelectDate={handleDateSelection}
                    onClose={() => setActivePicker(null)}
                  />
                </PickerField>
              </Col>
              <Col xs={6}>
                <PickerField
                  icon="schedule"
                  label="Giờ nhận xe"
                  dropdownType="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onOpen={setActivePicker}
                  isActive={activePicker === "pickupTime"}
                  alignRight
                  highlighted
                >
                  <BookingTimePicker
                    title="Chọn giờ nhận xe"
                    selectedTime={formData.pickupTime}
                    selectedDate={formData.pickupDate}
                    onSelectTime={handleTimeSelection}
                    onClose={() => setActivePicker(null)}
                  />
                </PickerField>
              </Col>
            </Row>

            <Row className="g-2 mt-1">
              <Col xs={6}>
                <PickerField
                  icon="calendar_today"
                  label="Ngày trả xe"
                  dropdownType="date"
                  name="returnDate"
                  value={formData.returnDate}
                  displayFormatter={formatDisplayDate}
                  onOpen={setActivePicker}
                  isActive={activePicker === "returnDate"}
                >
                  <BookingDateRangePicker
                    startDate={formData.pickupDate}
                    endDate={formData.returnDate}
                    activeField={activePicker}
                    onSelectDate={handleDateSelection}
                    onClose={() => setActivePicker(null)}
                  />
                </PickerField>
              </Col>
              <Col xs={6}>
                <PickerField
                  icon="schedule"
                  label="Giờ trả xe"
                  dropdownType="time"
                  name="returnTime"
                  value={formData.returnTime}
                  onOpen={setActivePicker}
                  isActive={activePicker === "returnTime"}
                  alignRight
                >
                  <BookingTimePicker
                    title="Chọn giờ trả xe"
                    selectedTime={formData.returnTime}
                    selectedDate={formData.returnDate}
                    onSelectTime={handleTimeSelection}
                    onClose={() => setActivePicker(null)}
                  />
                </PickerField>
              </Col>
            </Row>

            <div className="hero-search-modal__duration mt-4">
              <p className="hero-search-modal__duration-label">
                Thời gian thuê
              </p>
              <p className="hero-search-modal__duration-value">
                {rentalDuration}
              </p>
            </div>

            {showNightNotice && (
              <div className="hero-search-modal__notice mt-3">
                <span className="material-symbols-outlined">nights_stay</span>
                <p>
                  Khung giờ buổi khuya (23:00 tới 7:00) có thể có ít lựa chọn xe
                  hơn so với các khung giờ khác.
                </p>
              </div>
            )}

            <div className="hero-search-modal__notice mt-3">
              <span className="material-symbols-outlined">error</span>
              <p>
                Đây là chuyến đặt sát giờ. Để xe được chuẩn bị tốt và vệ sinh
                chu đáo, vui lòng đặt trước 2 tiếng.
              </p>
            </div>

            <div className="hero-search-modal__promo mt-4">
              <strong>Tiết kiệm đến 50%</strong> nếu chọn{" "}
              <strong>4h, 8h, 12h, 24h</strong> bắt đầu từ lúc nhận xe, nhận và
              trả xe 24/24
            </div>

            <Button
              type="submit"
              className="hero-search-modal__submit-btn mt-4"
            >
              Tìm xe
            </Button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default HeroSearchModal;
