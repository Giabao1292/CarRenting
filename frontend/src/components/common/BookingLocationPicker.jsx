import { useEffect, useMemo, useState } from "react";
import {
  getCurrentCoordinates,
  getDistrictsByProvinceCode,
  getProvinces,
  getWardsByDistrictCode,
  reverseGeocodeCoordinates,
} from "../../services/locationService";

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

const findByCode = (items, code) => {
  const normalizedCode = Number(code);
  if (!normalizedCode) {
    return null;
  }

  return (
    items.find((item) => Number(item?.code) === Number(normalizedCode)) || null
  );
};

const BookingLocationPicker = ({
  value,
  onSelectLocation,
  onSelectLocationDetail,
  onClose,
  enableManualAddress = false,
}) => {
  const [keyword, setKeyword] = useState("");
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [pickerError, setPickerError] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  useEffect(() => {
    if (!enableManualAddress) {
      return;
    }

    let isCancelled = false;

    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      setPickerError("");

      try {
        const data = await getProvinces();
        if (!isCancelled) {
          setProvinces(data);
        }
      } catch (error) {
        if (!isCancelled) {
          setPickerError(
            error?.message || "Không thể tải danh sách tỉnh/thành.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProvinces(false);
        }
      }
    };

    loadProvinces();

    return () => {
      isCancelled = true;
    };
  }, [enableManualAddress]);

  useEffect(() => {
    if (!enableManualAddress || !selectedProvinceCode) {
      setDistricts([]);
      setSelectedDistrictCode("");
      setWards([]);
      setSelectedWardCode("");
      return;
    }

    let isCancelled = false;

    const loadDistricts = async () => {
      setIsLoadingDistricts(true);
      setPickerError("");

      try {
        const data = await getDistrictsByProvinceCode(selectedProvinceCode);
        if (!isCancelled) {
          setDistricts(data);
          setSelectedDistrictCode("");
          setWards([]);
          setSelectedWardCode("");
        }
      } catch (error) {
        if (!isCancelled) {
          setPickerError(
            error?.message || "Không thể tải danh sách quận/huyện.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingDistricts(false);
        }
      }
    };

    loadDistricts();

    return () => {
      isCancelled = true;
    };
  }, [enableManualAddress, selectedProvinceCode]);

  useEffect(() => {
    if (!enableManualAddress || !selectedDistrictCode) {
      setWards([]);
      setSelectedWardCode("");
      return;
    }

    let isCancelled = false;

    const loadWards = async () => {
      setIsLoadingWards(true);
      setPickerError("");

      try {
        const data = await getWardsByDistrictCode(selectedDistrictCode);
        if (!isCancelled) {
          setWards(data);
          setSelectedWardCode("");
        }
      } catch (error) {
        if (!isCancelled) {
          setPickerError(
            error?.message || "Không thể tải danh sách phường/xã.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingWards(false);
        }
      }
    };

    loadWards();

    return () => {
      isCancelled = true;
    };
  }, [enableManualAddress, selectedDistrictCode]);

  const handleSelectLocation = (locationLabel, details = null) => {
    onSelectLocation(locationLabel);
    if (typeof onSelectLocationDetail === "function") {
      onSelectLocationDetail(details);
    }
    onClose();
  };

  const filteredSuggestions = useMemo(() => {
    const dynamicCities = provinces.map((item) => item.name);
    const mergedSuggestions = [...LOCATION_SUGGESTIONS, ...dynamicCities];
    const uniqueSuggestions = Array.from(new Set(mergedSuggestions));

    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return uniqueSuggestions;
    }

    return uniqueSuggestions.filter((city) =>
      city.toLowerCase().includes(normalizedKeyword),
    );
  }, [keyword, provinces]);

  const selectedProvince = useMemo(
    () => findByCode(provinces, selectedProvinceCode),
    [provinces, selectedProvinceCode],
  );
  const selectedDistrict = useMemo(
    () => findByCode(districts, selectedDistrictCode),
    [districts, selectedDistrictCode],
  );
  const selectedWard = useMemo(
    () => findByCode(wards, selectedWardCode),
    [wards, selectedWardCode],
  );

  const manualAddressLabel = useMemo(() => {
    return [
      String(streetAddress || "").trim(),
      selectedWard?.name || "",
      selectedDistrict?.name || "",
      selectedProvince?.name || "",
    ]
      .filter(Boolean)
      .join(", ");
  }, [
    selectedDistrict?.name,
    selectedProvince?.name,
    selectedWard?.name,
    streetAddress,
  ]);

  const handleUseCurrentLocation = async () => {
    setPickerError("");
    setIsLoadingCurrentLocation(true);

    try {
      const coordinates = await getCurrentCoordinates();
      let reverseGeocode = null;

      try {
        reverseGeocode = await reverseGeocodeCoordinates(
          coordinates.lat,
          coordinates.lng,
        );
      } catch {
        reverseGeocode = null;
      }

      const locationLabel =
        reverseGeocode?.fullAddress ||
        `Vị trí hiện tại (${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)})`;

      handleSelectLocation(locationLabel, {
        source: "current-location",
        ...coordinates,
        province: reverseGeocode?.province || "",
        district: reverseGeocode?.district || "",
        ward: reverseGeocode?.ward || "",
        streetAddress: reverseGeocode?.streetAddress || "",
        fullAddress: locationLabel,
      });
    } catch (error) {
      setPickerError(error?.message || "Không thể lấy vị trí hiện tại.");
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };

  return (
    <div className="booking-location-picker">
      <div className="booking-location-picker__header">
        {!enableManualAddress ? (
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="booking-location-picker__search"
            placeholder="Nhập địa điểm"
            autoFocus
          />
        ) : null}
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
        onClick={handleUseCurrentLocation}
        disabled={isLoadingCurrentLocation}
      >
        <span className="material-symbols-outlined">my_location</span>
        {isLoadingCurrentLocation
          ? "Đang lấy vị trí..."
          : "Dùng vị trí hiện tại"}
      </button>

      {pickerError ? (
        <p className="booking-location-picker__error">{pickerError}</p>
      ) : null}

      {!enableManualAddress ? (
        <>
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
                  handleSelectLocation(city, {
                    source: "city",
                    city,
                    fullAddress: city,
                  });
                }}
              >
                <span className="booking-location-picker__city-icon">◍</span>
                <span>{city}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {enableManualAddress ? (
        <div className="booking-location-picker__manual">
          <p className="booking-location-picker__section-label mb-2">
            Nhập địa chỉ chi tiết (API hành chính VN)
          </p>

          <div className="booking-location-picker__manual-grid">
            <select
              className="booking-location-picker__select"
              value={selectedProvinceCode}
              onChange={(event) => setSelectedProvinceCode(event.target.value)}
              disabled={isLoadingProvinces}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              className="booking-location-picker__select"
              value={selectedDistrictCode}
              onChange={(event) => setSelectedDistrictCode(event.target.value)}
              disabled={!selectedProvinceCode || isLoadingDistricts}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              className="booking-location-picker__select"
              value={selectedWardCode}
              onChange={(event) => setSelectedWardCode(event.target.value)}
              disabled={!selectedDistrictCode || isLoadingWards}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="booking-location-picker__search"
              value={streetAddress}
              onChange={(event) => setStreetAddress(event.target.value)}
              placeholder="Số nhà, tên đường"
            />
          </div>

          <button
            type="button"
            className="booking-location-picker__manual-submit"
            onClick={() => {
              handleSelectLocation(manualAddressLabel, {
                source: "manual",
                provinceCode: selectedProvince?.code || null,
                province: selectedProvince?.name || "",
                districtCode: selectedDistrict?.code || null,
                district: selectedDistrict?.name || "",
                wardCode: selectedWard?.code || null,
                ward: selectedWard?.name || "",
                streetAddress: String(streetAddress || "").trim(),
                fullAddress: manualAddressLabel,
              });
            }}
            disabled={
              !manualAddressLabel ||
              !selectedProvinceCode ||
              !selectedDistrictCode
            }
          >
            Xác nhận địa chỉ
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default BookingLocationPicker;
