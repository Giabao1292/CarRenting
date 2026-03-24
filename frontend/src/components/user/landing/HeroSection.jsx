import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";
import ConfirmActionModal from "../../common/ConfirmActionModal";
import { heroBg } from "../../../data/landingData";
import {
  buildCitySearchExpression,
  extractCityFromLocation,
  normalizeCityName,
} from "../../../utils/locationSearch";
import {
  getSearchLocation,
  saveSearchLocation,
} from "../../../utils/locationStorage";
import HeroSearchModal from "./HeroSearchModal";
import HeroSearchSummaryBar from "./HeroSearchSummaryBar";

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, daysToAdd = 1) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};

const getInitialSearchForm = () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  return {
    location:
      "Hera Spa, 228 Đ. Nguyễn Khắc Viện, Hoà Hải, Ngũ Hành Sơn, Đà Nẵng",
    pickupDate: getDateKey(today),
    pickupTime: "10:00",
    returnDate: getDateKey(tomorrow),
    returnTime: "10:00",
  };
};

const parseDateTime = (date, time) => {
  if (!date || !time) {
    return null;
  }

  return new Date(`${date}T${time}:00`);
};

const isNightTime = (time) => {
  const [hour] = (time || "").split(":").map(Number);
  if (Number.isNaN(hour)) {
    return false;
  }

  return hour >= 23 || hour < 7;
};

const formatRentalDuration = (start, end) => {
  if (!start || !end) {
    return "0 giờ";
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) {
    return "0 giờ";
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (!days) {
    return `${hours} giờ`;
  }

  if (!hours) {
    return `${days} ngày`;
  }

  return `${days} ngày ${hours} giờ`;
};

const buildDateTimeSearchValue = (dateValue = "", timeValue = "") => {
  if (!dateValue || !timeValue) {
    return "";
  }

  const normalizedTime = /^\d{2}:\d{2}$/.test(timeValue)
    ? `${timeValue}:00`
    : timeValue;

  return `${dateValue} ${normalizedTime}`;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState(() => {
    const initialSearchForm = getInitialSearchForm();
    const savedLocation = getSearchLocation();
    if (!savedLocation?.locationLabel) {
      return initialSearchForm;
    }

    return {
      ...initialSearchForm,
      location: savedLocation.locationLabel,
    };
  });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showConfirmLocationModal, setShowConfirmLocationModal] =
    useState(false);
  const [pendingLocationOption, setPendingLocationOption] = useState("");

  useEffect(() => {
    const handleLandingCitySelection = (event) => {
      const payload = event?.detail;
      if (!payload?.locationLabel) {
        return;
      }

      setSearchForm((prev) => ({
        ...prev,
        location: payload.locationLabel,
      }));
    };

    window.addEventListener(
      "landing-location-selected",
      handleLandingCitySelection,
    );
    return () => {
      window.removeEventListener(
        "landing-location-selected",
        handleLandingCitySelection,
      );
    };
  }, []);

  const rentalDuration = useMemo(() => {
    const pickupDateTime = parseDateTime(
      searchForm.pickupDate,
      searchForm.pickupTime,
    );
    const returnDateTime = parseDateTime(
      searchForm.returnDate,
      searchForm.returnTime,
    );

    return formatRentalDuration(pickupDateTime, returnDateTime);
  }, [
    searchForm.pickupDate,
    searchForm.pickupTime,
    searchForm.returnDate,
    searchForm.returnTime,
  ]);

  const showNightNotice = useMemo(() => {
    return (
      isNightTime(searchForm.pickupTime) || isNightTime(searchForm.returnTime)
    );
  }, [searchForm.pickupTime, searchForm.returnTime]);

  const handleFieldChange = (field, value) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyLocationSelection = (locationLabel, city, source = "manual") => {
    const normalizedCity = normalizeCityName(
      city || extractCityFromLocation(locationLabel),
    );

    setSearchForm((prev) => ({
      ...prev,
      location: locationLabel,
    }));

    saveSearchLocation({
      locationLabel,
      city: normalizedCity,
      source,
    });
  };

  const requestCurrentLocation = async () => {
    const fallbackCity = "Ha Noi";
    const fallbackLocationLabel = "Ha Noi";

    if (!navigator.geolocation) {
      applyLocationSelection(fallbackLocationLabel, fallbackCity, "fallback");
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      );
      const data = await response.json();

      const reverseCity =
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.province ||
        fallbackCity;

      const normalizedCity = normalizeCityName(reverseCity);
      const fullAddress = data?.display_name || normalizedCity;

      applyLocationSelection(fullAddress, normalizedCity, "geolocation");
    } catch {
      applyLocationSelection(fallbackLocationLabel, fallbackCity, "fallback");
    }
  };

  const handleLocationOptionSelection = async (selectedOption) => {
    if (selectedOption === "Địa điểm hiện tại") {
      await requestCurrentLocation();
      return;
    }

    const currentCity = normalizeCityName(
      extractCityFromLocation(searchForm.location),
    );
    const nextCity = normalizeCityName(selectedOption);

    if (currentCity && currentCity === nextCity) {
      applyLocationSelection(selectedOption, nextCity, "manual");
      return;
    }

    setPendingLocationOption(selectedOption);
    setShowConfirmLocationModal(true);
  };

  const handleConfirmLocationChange = () => {
    if (!pendingLocationOption) {
      setShowConfirmLocationModal(false);
      return;
    }

    const city = normalizeCityName(pendingLocationOption);
    applyLocationSelection(pendingLocationOption, city, "manual");
    setPendingLocationOption("");
    setShowConfirmLocationModal(false);
  };

  const handleCancelLocationChange = () => {
    setPendingLocationOption("");
    setShowConfirmLocationModal(false);
  };

  const handleSubmitSearch = (event) => {
    event?.preventDefault?.();

    const savedLocation = getSearchLocation();
    const extractedCity = normalizeCityName(
      extractCityFromLocation(searchForm.location),
    );
    const city = savedLocation?.city || extractedCity;
    const searchExpression = buildCitySearchExpression(city);
    const pickupAt = buildDateTimeSearchValue(
      searchForm.pickupDate,
      searchForm.pickupTime,
    );
    const dropoffAt = buildDateTimeSearchValue(
      searchForm.returnDate,
      searchForm.returnTime,
    );

    setShowSearchModal(false);

    const nextParams = new URLSearchParams();
    if (searchExpression) {
      nextParams.append("search", searchExpression);
    }

    if (pickupAt) {
      nextParams.set("pickupAt", pickupAt);
    }

    if (dropoffAt) {
      nextParams.set("dropoffAt", dropoffAt);
    }

    const nextQueryString = nextParams.toString();
    if (!nextQueryString) {
      navigate(APP_ROUTES.RESULTS);
      return;
    }

    navigate(`${APP_ROUTES.RESULTS}?${nextQueryString}`);
  };

  return (
    <section className="position-relative rounded-4 overflow-hidden shadow-lg mb-5 mioto-hero-section">
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="position-absolute top-0 start-0 w-100 h-100 mioto-hero-overlay" />

      <div
        className="position-relative p-4 p-md-5 text-white d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: 560 }}
      >
        <h1 className="mioto-hero-title text-white text-center fw-bold mb-3">
          YIOTO - Cùng Bạn Trên
          <br />
          Mọi Hành Trình
        </h1>
        <div className="mioto-hero-divider mb-3" />
        <p className="mioto-hero-subtitle text-center mb-4">
          Trải nghiệm sự khác biệt từ <span>hơn 10.000</span> xe gia đình đời
          mới khắp Việt Nam
        </p>

        <HeroSearchSummaryBar
          formData={searchForm}
          onOpen={() => setShowSearchModal(true)}
          onSearch={handleSubmitSearch}
        />
      </div>

      <HeroSearchModal
        show={showSearchModal}
        onHide={() => setShowSearchModal(false)}
        formData={searchForm}
        rentalDuration={rentalDuration}
        showNightNotice={showNightNotice}
        onFieldChange={handleFieldChange}
        onSelectLocationOption={handleLocationOptionSelection}
        onSubmit={handleSubmitSearch}
      />

      <ConfirmActionModal
        show={showConfirmLocationModal}
        title="Xác nhận đổi địa chỉ"
        message={`Bạn có muốn đổi địa chỉ nhận xe sang ${pendingLocationOption}?`}
        confirmText="Đồng ý"
        onCancel={handleCancelLocationChange}
        onConfirm={handleConfirmLocationChange}
      />
    </section>
  );
};

export default HeroSection;
