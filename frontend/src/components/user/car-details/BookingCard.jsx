import { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";
import BookingDateRangePicker from "../../common/BookingDateRangePicker";
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

const getDateKeysInRange = (startDateKey, endDateKey) => {
  const startDate = parseDateKey(startDateKey);
  const endDate = parseDateKey(endDateKey);

  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const dateKeys = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    dateKeys.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dateKeys;
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

const toMinutes = (timeValue) => {
  const [hours, minutes] = (timeValue || "").split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }

  return hours * 60 + minutes;
};

const formatDisplayDateTime = (value) => {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const parseSlotDate = (value) => {
  const parsedDate = value ? new Date(value) : null;
  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  );
};

const expandBusySlots = (busySlots = []) => {
  const blockedDateKeys = new Set();

  busySlots.forEach((slot) => {
    const startDate = parseSlotDate(slot?.start);
    const endDate = parseSlotDate(slot?.end);

    if (!startDate || !endDate) {
      return;
    }

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      blockedDateKeys.add(getDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return Array.from(blockedDateKeys).sort();
};

const hasBlockedDateInRange = (startDateKey, endDateKey, blockedDateKeySet) => {
  return getDateKeysInRange(startDateKey, endDateKey).some((dateKey) =>
    blockedDateKeySet.has(dateKey),
  );
};

const findNextAvailableDate = (
  startDateKey,
  blockedDateKeySet,
  maxDays = 365,
) => {
  let cursor = startDateKey;

  for (let i = 0; i < maxDays; i += 1) {
    if (!blockedDateKeySet.has(cursor)) {
      return cursor;
    }

    cursor = addDaysToDateKey(cursor, 1);
    if (!cursor) {
      break;
    }
  }

  return "";
};

const getRentalDays = (startDateKey, endDateKey) => {
  const startDate = parseDateKey(startDateKey);
  const endDate = parseDateKey(endDateKey);

  if (!startDate || !endDate) {
    return 0;
  }

  return Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000),
  );
};

const getBestPromotion = (promotions = []) => {
  if (!promotions.length) {
    return null;
  }

  return [...promotions].sort(
    (a, b) => Number(b?.discountValue || 0) - Number(a?.discountValue || 0),
  )[0];
};

const clampDiscount = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
};

const POTENTIAL_SURCHARGES = [
  {
    icon: "toll",
    title: "Phí cầu đường",
    value: "Theo thực tế",
    description:
      "Chủ xe có thể yêu cầu thanh toán phí cầu đường phát sinh trong quá trình thuê xe.",
  },
  {
    icon: "schedule",
    title: "Phí trả trễ",
    value: "200.000đ/giờ",
    description:
      "Nếu trả xe trễ so với thời gian đã chọn, phí sẽ được tính theo từng giờ phát sinh.",
  },
  {
    icon: "social_distance",
    title: "Phí vượt định mức km",
    value: "3.000đ/km",
    description:
      "Vượt quá định mức km trong ngày sẽ phát sinh phụ phí theo số km vượt mức.",
  },
  {
    icon: "local_gas_station",
    title: "Phụ thu nhiên liệu",
    value: "Theo mức tiêu hao",
    description:
      "Xe cần được hoàn trả mức nhiên liệu tương đương khi nhận để tránh phụ phí.",
  },
  {
    icon: "cleaning_services",
    title: "Phí vệ sinh",
    value: "150.000đ",
    description:
      "Nếu xe bẩn hoặc có mùi khi hoàn trả, chủ xe có thể thu thêm phí vệ sinh.",
  },
];

const formatCurrencyVnd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0 VND";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const BookingCard = ({ car, promotions = [] }) => {
  const navigate = useNavigate();
  const originalPricePerDay =
    Number(car?.originalPricePerDay ?? car?.pricePerDay) || 0;
  const blockedDateKeys = useMemo(
    () => expandBusySlots(car?.busySlots || []),
    [car?.busySlots],
  );
  const blockedDateKeySet = useMemo(
    () => new Set(blockedDateKeys),
    [blockedDateKeys],
  );
  const todayDateKey = getDateKey(new Date());
  const initialStartDate = useMemo(
    () => findNextAvailableDate(todayDateKey, blockedDateKeySet),
    [blockedDateKeySet, todayDateKey],
  );
  const initialEndDate = useMemo(() => {
    if (!initialStartDate) {
      return "";
    }

    return findNextAvailableDate(
      addDaysToDateKey(initialStartDate, 1),
      blockedDateKeySet,
    );
  }, [blockedDateKeySet, initialStartDate]);

  const [activePicker, setActivePicker] = useState("");
  const [tripStartDate, setTripStartDate] = useState(initialStartDate);
  const [tripEndDate, setTripEndDate] = useState(initialEndDate);
  const [selectingDateField, setSelectingDateField] = useState("start");
  const [tripStartTime, setTripStartTime] = useState("10:00");
  const [tripEndTime, setTripEndTime] = useState("10:00");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherSearch, setVoucherSearch] = useState("");

  const bestPromotion = useMemo(
    () => getBestPromotion(promotions),
    [promotions],
  );
  const [selectedPromotionId, setSelectedPromotionId] = useState(
    bestPromotion?.id || null,
  );
  const [hasVoucherSelectionChanged, setHasVoucherSelectionChanged] =
    useState(false);

  useEffect(() => {
    if (
      hasVoucherSelectionChanged ||
      selectedPromotionId ||
      !bestPromotion?.id
    ) {
      return;
    }

    setSelectedPromotionId(bestPromotion.id);
  }, [bestPromotion, hasVoucherSelectionChanged, selectedPromotionId]);

  const selectedPromotion = useMemo(() => {
    if (!selectedPromotionId) {
      return null;
    }

    return (
      promotions.find((promotion) => promotion.id === selectedPromotionId) ||
      null
    );
  }, [promotions, selectedPromotionId]);

  const filteredPromotions = useMemo(() => {
    const keyword = voucherSearch.trim().toLowerCase();
    const sortedPromotions = [...promotions].sort(
      (a, b) => Number(b?.discountValue || 0) - Number(a?.discountValue || 0),
    );

    if (!keyword) {
      return sortedPromotions;
    }

    return sortedPromotions.filter((promotion) => {
      return String(promotion?.code || "")
        .toLowerCase()
        .includes(keyword);
    });
  }, [promotions, voucherSearch]);

  const discountPercent = clampDiscount(selectedPromotion?.discountValue);
  const discountedPricePerDay = Math.round(
    originalPricePerDay * ((100 - discountPercent) / 100),
  );
  const rentalDays = getRentalDays(tripStartDate, tripEndDate);
  const rentalSubtotal = discountedPricePerDay * rentalDays;
  const originalSubtotal = originalPricePerDay * rentalDays;
  const discountAmount = Math.max(originalSubtotal - rentalSubtotal, 0);
  const hasDiscount = discountPercent > 0;
  const serviceFee = 0;
  const totalPrice = rentalSubtotal + serviceFee;

  const handleDateSelection = (_, dateValue) => {
    if (!dateValue || blockedDateKeySet.has(dateValue)) {
      return;
    }

    if (selectingDateField === "start" || !tripStartDate) {
      setTripStartDate(dateValue);
      setTripEndDate(null);
      setSelectingDateField("end");
      setActivePicker("date");
      return;
    }

    if (selectingDateField === "end") {
      if (dateValue < tripStartDate) {
        setTripStartDate(dateValue);
        setTripEndDate(null);
        setSelectingDateField("end");
        setActivePicker("date");
        return;
      }

      if (
        tripStartDate &&
        hasBlockedDateInRange(tripStartDate, dateValue, blockedDateKeySet)
      ) {
        return;
      }

      setTripEndDate(dateValue);
      setSelectingDateField("start");
      setActivePicker("startTime");
    }
  };

  const handleTimeSelection = (timeValue) => {
    if (!timeValue) {
      return;
    }

    if (activePicker === "startTime") {
      setTripStartTime(timeValue);

      if (
        tripStartDate === tripEndDate &&
        toMinutes(timeValue) >= toMinutes(tripEndTime)
      ) {
        const normalizedHour = Math.min(
          23,
          Number(timeValue.split(":")[0]) + 1,
        );
        const nextEndTime = `${String(normalizedHour).padStart(2, "0")}:00`;
        setTripEndTime(nextEndTime);
      }

      setActivePicker("endTime");
      return;
    }

    if (activePicker === "endTime") {
      if (
        tripStartDate === tripEndDate &&
        toMinutes(timeValue) <= toMinutes(tripStartTime)
      ) {
        return;
      }

      setTripEndTime(timeValue);
      setActivePicker("endTime");
    }
  };

  const handleBookNow = () => {
    navigate(APP_ROUTES.PAYMENT);
  };

  const handleApplyPromotion = (promotionId) => {
    setHasVoucherSelectionChanged(true);
    setSelectedPromotionId(promotionId || null);
    setShowVoucherModal(false);
  };

  const openScheduleModal = ({ picker, dateField }) => {
    if (dateField) {
      setSelectingDateField(dateField);
    }

    setActivePicker(picker);
    setShowScheduleModal(true);
  };

  return (
    <>
      <Card
        className="border-0 shadow-sm rounded-4 p-3 position-sticky"
        style={{ top: 90, zIndex: 12 }}
      >
        <div className="d-flex justify-content-between align-items-end mb-3">
          <div>
            <span className="fs-3 fw-bold">
              {formatCurrencyVnd(discountedPricePerDay)}
            </span>
            <span className="text-muted"> / ngày</span>
          </div>
          {hasDiscount ? (
            <small className="text-decoration-line-through text-muted">
              {formatCurrencyVnd(originalPricePerDay)}
            </small>
          ) : null}
        </div>

        <div className="border rounded-3 overflow-hidden mb-3">
          <div className="d-flex border-bottom">
            <div className="p-2 flex-fill border-end position-relative">
              <small className="text-muted d-block">Trip Start</small>
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-dark text-decoration-none"
                onClick={() => {
                  openScheduleModal({
                    picker: "date",
                    dateField: "start",
                  });
                }}
              >
                {formatDisplayDate(tripStartDate)}
              </button>
            </div>
            <div className="p-2 flex-fill position-relative">
              <small className="text-muted d-block">Trip End</small>
              <button
                type="button"
                onClick={() => {
                  openScheduleModal({
                    picker: "date",
                    dateField: "end",
                  });
                }}
                className="btn btn-link p-0 fw-bold text-dark text-decoration-none"
              >
                {formatDisplayDate(tripEndDate)}
              </button>
            </div>
          </div>

          <div className="d-flex border-bottom">
            <div className="p-2 flex-fill border-end position-relative">
              <small className="text-muted d-block">Giờ nhận</small>
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-dark text-decoration-none"
                onClick={() =>
                  openScheduleModal({
                    picker: "startTime",
                  })
                }
              >
                {tripStartTime}
              </button>
            </div>
            <div className="p-2 flex-fill position-relative">
              <small className="text-muted d-block">Giờ trả</small>
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-dark text-decoration-none"
                onClick={() =>
                  openScheduleModal({
                    picker: "endTime",
                  })
                }
              >
                {tripEndTime}
              </button>
            </div>
          </div>
          <div className="p-2">
            <small className="text-muted d-block">Pickup & Return</small>
            <strong>{car?.location || "Chưa có địa chỉ"}</strong>
          </div>
        </div>

        <div className="border rounded-3 p-2 mb-3">
          <small className="text-muted d-block mb-2">Voucher</small>
          <button
            type="button"
            className="booking-voucher-trigger"
            onClick={() => setShowVoucherModal(true)}
          >
            <span className="material-symbols-outlined">sell</span>
            <span>
              {selectedPromotion
                ? `${selectedPromotion.code} - Giảm ${discountPercent}%`
                : "Áp dụng mã khuyến mãi / giới thiệu"}
            </span>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <Button
          className="btn-primary-custom w-100 py-2 mb-2"
          onClick={handleBookNow}
        >
          Book Now
        </Button>
        <div className="text-center text-muted small mb-3">
          You won't be charged yet
        </div>

        <div className="d-flex justify-content-between small mb-1">
          <span>Giá thuê ({rentalDays || 0} ngày)</span>
          <span>{formatCurrencyVnd(originalSubtotal)}</span>
        </div>

        {hasDiscount ? (
          <div className="d-flex justify-content-between small mb-1 text-success">
            <span>
              Voucher {selectedPromotion?.code || ""} (-{discountPercent}%)
            </span>
            <span>-{formatCurrencyVnd(discountAmount)}</span>
          </div>
        ) : null}

        <div className="d-flex justify-content-between small mb-3">
          <span>Phí dịch vụ</span>
          <span>{formatCurrencyVnd(serviceFee)}</span>
        </div>

        {hasDiscount ? (
          <div className="small text-muted mb-3">
            Giá gốc:{" "}
            <span className="text-decoration-line-through">
              {formatCurrencyVnd(originalSubtotal)}
            </span>
          </div>
        ) : null}

        <div className="d-flex justify-content-between border-top pt-2 fw-bold">
          <span>Total</span>
          <span>{formatCurrencyVnd(totalPrice)}</span>
        </div>
      </Card>

      <Card
        className="border-0 shadow-sm rounded-4 p-3 mt-3"
        style={{ position: "relative", zIndex: 1 }}
      >
        <h5 className="booking-surcharge-title mb-3">
          Phụ phí có thể phát sinh
        </h5>
        <div className="d-grid gap-3">
          {POTENTIAL_SURCHARGES.map((item) => (
            <div key={item.title} className="booking-surcharge-item">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-success">
                    {item.icon}
                  </span>
                  <strong>{item.title}</strong>
                </div>
                <span className="text-muted fw-semibold">{item.value}</span>
              </div>
              <p className="text-muted small mb-0 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        show={showScheduleModal}
        onHide={() => {
          setShowScheduleModal(false);
          setActivePicker("");
        }}
        centered
        dialogClassName="hero-search-modal"
      >
        <Modal.Header closeButton className="hero-search-modal__header">
          <Modal.Title className="hero-search-modal__title">
            Chọn lịch xe
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="hero-search-modal__body">
          <div className="d-grid gap-2">
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn flex-fill ${
                  activePicker === "date" && selectingDateField === "start"
                    ? "btn-success"
                    : "btn-outline-secondary"
                }`}
                onClick={() => {
                  setSelectingDateField("start");
                  setActivePicker("date");
                }}
              >
                Ngày nhận: {formatDisplayDate(tripStartDate)}
              </button>
              <button
                type="button"
                className={`btn flex-fill ${
                  activePicker === "date" && selectingDateField === "end"
                    ? "btn-success"
                    : "btn-outline-secondary"
                }`}
                onClick={() => {
                  setSelectingDateField("end");
                  setActivePicker("date");
                }}
              >
                Ngày trả: {formatDisplayDate(tripEndDate)}
              </button>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn flex-fill ${
                  activePicker === "startTime"
                    ? "btn-success"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setActivePicker("startTime")}
              >
                Giờ nhận: {tripStartTime}
              </button>
              <button
                type="button"
                className={`btn flex-fill ${
                  activePicker === "endTime"
                    ? "btn-success"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setActivePicker("endTime")}
              >
                Giờ trả: {tripEndTime}
              </button>
            </div>

            <div className="mt-2">
              {activePicker === "date" ? (
                <BookingDateRangePicker
                  startDate={tripStartDate}
                  endDate={tripEndDate}
                  activeField={selectingDateField}
                  blockedDateKeys={blockedDateKeys}
                  onSelectDate={handleDateSelection}
                  onClose={() => setShowScheduleModal(false)}
                />
              ) : (
                <BookingTimePicker
                  title={
                    activePicker === "startTime"
                      ? "Chọn giờ nhận"
                      : "Chọn giờ trả"
                  }
                  selectedTime={
                    activePicker === "startTime" ? tripStartTime : tripEndTime
                  }
                  selectedDate={
                    activePicker === "startTime" ? tripStartDate : tripEndDate
                  }
                  onSelectTime={handleTimeSelection}
                  onClose={() => setShowScheduleModal(false)}
                />
              )}
            </div>

            <Button
              className="btn-primary-custom mt-2"
              onClick={() => {
                setShowScheduleModal(false);
                setActivePicker("");
              }}
            >
              Xong
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showVoucherModal}
        onHide={() => setShowVoucherModal(false)}
        centered
        dialogClassName="booking-voucher-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Mã khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            value={voucherSearch}
            onChange={(event) => setVoucherSearch(event.target.value)}
            placeholder="Tìm kiếm mã khuyến mãi..."
            className="mb-3"
          />

          <div className="d-grid gap-2 booking-voucher-list">
            <button
              type="button"
              className={`booking-voucher-option ${!selectedPromotionId ? "is-active" : ""}`}
              onClick={() => handleApplyPromotion(null)}
            >
              <div className="fw-semibold">Không áp dụng voucher</div>
              <div className="text-muted small">
                Giữ nguyên giá thuê hiện tại
              </div>
            </button>

            {filteredPromotions.map((promotion) => {
              const isActive = selectedPromotionId === promotion.id;
              const promotionDiscount = clampDiscount(promotion.discountValue);

              return (
                <div
                  key={promotion.id || promotion.code}
                  className={`booking-voucher-option ${isActive ? "is-active" : ""}`}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <div className="fw-bold">{promotion.code}</div>
                      <div className="text-muted">
                        Giảm {promotionDiscount}%
                      </div>
                    </div>
                    {isActive ? (
                      <span className="badge text-bg-success">
                        Đang áp dụng
                      </span>
                    ) : null}
                  </div>

                  <div className="small text-muted mb-2">
                    Có giá trị từ {formatDisplayDateTime(promotion.startAt)} đến{" "}
                    {formatDisplayDateTime(promotion.endAt)}
                  </div>

                  <div className="small text-muted mb-3">
                    Số lượng còn lại: {promotion.usageLimit ?? "Không giới hạn"}
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? "secondary" : "success"}
                    onClick={() => handleApplyPromotion(promotion.id)}
                    disabled={isActive}
                  >
                    {isActive ? "Đã áp dụng" : "Áp dụng"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BookingCard;
