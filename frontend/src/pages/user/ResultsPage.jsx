import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { APP_ROUTES } from "../../app/routes";
import FilterSelectModal from "../../components/common/FilterSelectModal";
import HeroSearchModal from "../../components/user/landing/HeroSearchModal";
import HeroSearchSummaryBar from "../../components/user/landing/HeroSearchSummaryBar";
import ResultCard from "../../components/user/results/ResultCard";
import { resultCards } from "../../data/resultsData";
import { getCars } from "../../services/carService";
import {
  buildCitySearchExpression,
  extractCityFromLocation,
  normalizeCityName,
  parseSearchExpression,
} from "../../utils/locationSearch";
import {
  getSearchLocation,
  saveSearchLocation,
} from "../../utils/locationStorage";

const INITIAL_SEARCH_FORM = {
  location: "Đà Nẵng",
  pickupDate: "2026-03-23",
  pickupTime: "03:00",
  returnDate: "2026-03-25",
  returnTime: "07:00",
};

const CITY_TO_PROVINCE_CODE = {
  "Ha Noi": 1,
  "Ho Chi Minh": 79,
  "Da Nang": 48,
  "Khanh Hoa": 56,
  "Binh Duong": 74,
  "Can Tho": 92,
  "Da Lat": 68,
  "Hoi An": 49,
};

const FILTER_KEY = {
  BRAND: "brand",
  SEATS: "seats",
  FUEL: "tranmission",
  AREA: "area",
  SORT: "sort",
};

const getBrandFromTitle = (title = "") => {
  return title.trim().split(" ")[0] || "Khác";
};

const getDistrictFromLocation = (location = "") => {
  if (!location) {
    return "";
  }

  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[0] || location;
};

const makeUniqueOptions = (items) => {
  return Array.from(new Set(items.filter(Boolean)));
};

const stripAdministrativePrefix = (value = "") => {
  return value
    .replace(/^(quận|huyện|thành phố|thị xã|thị trấn)\s+/i, "")
    .trim();
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

const parseDateTimeSearchValue = (value = "") => {
  const normalized = value.trim();
  const match = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?$/.exec(
    normalized,
  );

  if (!match) {
    return null;
  }

  return {
    date: match[1],
    time: match[2],
  };
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pickupAtFromSearch = searchParams.get("pickupAt") || "";
  const dropoffAtFromSearch = searchParams.get("dropoffAt") || "";
  const parsedPickupAt = parseDateTimeSearchValue(pickupAtFromSearch);
  const parsedDropoffAt = parseDateTimeSearchValue(dropoffAtFromSearch);
  const [cards, setCards] = useState(resultCards);
  const [pageInfo, setPageInfo] = useState({
    totalElements: resultCards.length,
    totalPages: 1,
    number: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeFilterModal, setActiveFilterModal] = useState("");
  const [draftFilterValue, setDraftFilterValue] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [areaOptionsFromApi, setAreaOptionsFromApi] = useState([]);

  const [searchForm, setSearchForm] = useState(() => {
    const savedLocation = getSearchLocation();
    const baseForm = {
      ...INITIAL_SEARCH_FORM,
      pickupDate: parsedPickupAt?.date || INITIAL_SEARCH_FORM.pickupDate,
      pickupTime: parsedPickupAt?.time || INITIAL_SEARCH_FORM.pickupTime,
      returnDate: parsedDropoffAt?.date || INITIAL_SEARCH_FORM.returnDate,
      returnTime: parsedDropoffAt?.time || INITIAL_SEARCH_FORM.returnTime,
    };

    if (!savedLocation?.locationLabel) {
      return baseForm;
    }

    return {
      ...baseForm,
      location: savedLocation.locationLabel,
    };
  });

  const [filters, setFilters] = useState(() => {
    const initialBrandFromSearch = searchParams
      .getAll("search")
      .map((expression) => parseSearchExpression(expression))
      .find(
        (expression) =>
          expression?.key === "brand" && expression?.operator === ":",
      )?.value;

    return {
      brand: initialBrandFromSearch || "all",
      seats: "all",
      tranmission: "all",
      area: "all",
      sort: "pricePerDay,asc",
    };
  });

  const parsedSearchExpressions = useMemo(() => {
    return searchParams
      .getAll("search")
      .map((expression) => parseSearchExpression(expression))
      .filter(Boolean);
  }, [searchParams]);

  const cityFromSearch = useMemo(() => {
    const cityMatcher = parsedSearchExpressions.find(
      (expression) => expression.key === "city" && expression.operator === ":",
    );

    if (!cityMatcher?.value) {
      return "";
    }

    return normalizeCityName(cityMatcher.value);
  }, [parsedSearchExpressions]);

  const brandFromSearch = useMemo(() => {
    const brandMatcher = parsedSearchExpressions.find(
      (expression) => expression.key === "brand" && expression.operator === ":",
    );

    return brandMatcher?.value || "";
  }, [parsedSearchExpressions]);

  useEffect(() => {
    if (!brandFromSearch) {
      return;
    }

    setFilters((prev) => {
      if (prev.brand === brandFromSearch) {
        return prev;
      }

      return {
        ...prev,
        brand: brandFromSearch,
      };
    });
  }, [brandFromSearch]);

  const selectedCity =
    cityFromSearch ||
    normalizeCityName(
      getSearchLocation()?.city || extractCityFromLocation(searchForm.location),
    );

  const decoratedCards = useMemo(() => {
    return cards.map((car) => ({
      ...car,
      brand: getBrandFromTitle(car.title),
      district: getDistrictFromLocation(car.location),
      seatsValue: Number(car.specs?.[0]?.value || 0),
    }));
  }, [cards]);

  useEffect(() => {
    let isCancelled = false;

    const loadAreaOptions = async () => {
      const provinceCode = CITY_TO_PROVINCE_CODE[selectedCity];
      if (!provinceCode) {
        setAreaOptionsFromApi([]);
        return;
      }

      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
        );
        const payload = await response.json();
        if (isCancelled) {
          return;
        }

        const districtOptions = Array.isArray(payload?.districts)
          ? payload.districts
              .map((district) => district?.name?.trim())
              .filter(Boolean)
          : [];

        setAreaOptionsFromApi(districtOptions);
      } catch {
        if (!isCancelled) {
          setAreaOptionsFromApi([]);
        }
      }
    };

    loadAreaOptions();

    return () => {
      isCancelled = true;
    };
  }, [selectedCity]);

  const filterOptions = useMemo(() => {
    const brandOptions = makeUniqueOptions(
      decoratedCards.map((item) => item.brand),
    );
    const seatsOptions = makeUniqueOptions(
      decoratedCards
        .map((item) => String(item.seatsValue))
        .filter((value) => value !== "0"),
    );
    const areaOptions = areaOptionsFromApi.length
      ? areaOptionsFromApi
      : makeUniqueOptions(decoratedCards.map((item) => item.district));

    return {
      brand: [
        { value: "all", label: "Tất cả", icon: "check_circle" },
        ...brandOptions.map((value) => ({
          value,
          label: value,
          icon: "directions_car",
        })),
      ],
      seats: [
        { value: "all", label: "Tất cả", icon: "check_circle" },
        ...seatsOptions.map((value) => ({
          value,
          label: `${value} chỗ`,
          icon: "airline_seat_recline_normal",
        })),
      ],
      tranmission: [
        { value: "all", label: "Tất cả", icon: "check_circle" },
        {
          value: "automatic",
          label: "Số tự động",
          icon: "tune",
        },
        {
          value: "manual",
          label: "Số sàn",
          icon: "tune",
        },
        {
          value: "electric",
          label: "Điện",
          icon: "electric_bolt",
        },
      ],
      area: [
        { value: "all", label: "Tất cả", icon: "check_circle" },
        ...areaOptions.map((value) => ({
          value,
          label: value,
          icon: "location_on",
        })),
      ],
      sort: [
        {
          value: "pricePerDay,asc",
          label: "Giá tăng dần",
          icon: "arrow_upward",
        },
        {
          value: "pricePerDay,desc",
          label: "Giá giảm dần",
          icon: "arrow_downward",
        },
      ],
    };
  }, [areaOptionsFromApi, decoratedCards]);

  useEffect(() => {
    let isCancelled = false;

    const loadCars = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getCars({
          city: selectedCity,
          size: 40,
          brand: filters.brand !== "all" ? filters.brand : "",
          seating: filters.seats !== "all" ? filters.seats : "",
          tranmission: filters.tranmission !== "all" ? filters.tranmission : "",
          address:
            filters.area !== "all"
              ? stripAdministrativePrefix(filters.area)
              : "",
          pickupAt: pickupAtFromSearch,
          dropoffAt: dropoffAtFromSearch,
          sort: filters.sort,
        });
        if (isCancelled) {
          return;
        }

        setCards(response.cars.length ? response.cars : []);
        setPageInfo(response.pageInfo);
      } catch {
        if (isCancelled) {
          return;
        }

        setCards(resultCards);
        setPageInfo({
          totalElements: resultCards.length,
          totalPages: 1,
          number: 0,
        });
        setErrorMessage(
          "Không thể tải danh sách xe từ server. Đang hiển thị dữ liệu mẫu.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCars();

    return () => {
      isCancelled = true;
    };
  }, [
    dropoffAtFromSearch,
    selectedCity,
    filters.area,
    filters.brand,
    filters.seats,
    filters.sort,
    filters.tranmission,
    pickupAtFromSearch,
  ]);

  const handleSearchFieldChange = (field, value) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = (event) => {
    event?.preventDefault?.();

    const city = normalizeCityName(
      extractCityFromLocation(searchForm.location),
    );
    saveSearchLocation({
      locationLabel: searchForm.location,
      city,
      source: "manual",
    });

    setShowSearchModal(false);

    const nextParams = new URLSearchParams();
    const searchExpression = buildCitySearchExpression(city);
    if (searchExpression) {
      nextParams.set("search", searchExpression);
    }

    const pickupAt = buildDateTimeSearchValue(
      searchForm.pickupDate,
      searchForm.pickupTime,
    );
    if (pickupAt) {
      nextParams.set("pickupAt", pickupAt);
    }

    const dropoffAt = buildDateTimeSearchValue(
      searchForm.returnDate,
      searchForm.returnTime,
    );
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

  const handleSelectLocationOption = (value) => {
    setSearchForm((prev) => ({ ...prev, location: value }));
  };

  const filterChips = [
    {
      key: FILTER_KEY.BRAND,
      label: filters.brand === "all" ? "Hãng xe" : filters.brand,
      icon: "directions_car",
    },
    {
      key: FILTER_KEY.SEATS,
      label: filters.seats === "all" ? "Số chỗ" : `${filters.seats} chỗ`,
      icon: "airline_seat_recline_normal",
    },
    {
      key: FILTER_KEY.FUEL,
      label:
        filters.tranmission === "all"
          ? "Nhiên liệu"
          : filterOptions.tranmission.find(
              (option) => option.value === filters.tranmission,
            )?.label || filters.tranmission,
      icon: "local_gas_station",
    },
    {
      key: FILTER_KEY.AREA,
      label: filters.area === "all" ? "Khu vực xe" : filters.area,
      icon: "location_on",
    },
    {
      key: FILTER_KEY.SORT,
      label:
        filters.sort === "pricePerDay,asc" ? "Giá tăng dần" : "Giá giảm dần",
      icon: "swap_vert",
    },
  ];

  const getOptionsByModalKey = () => {
    if (!activeFilterModal) {
      return [];
    }

    return filterOptions[activeFilterModal] || [];
  };

  const openFilterModal = (filterKey) => {
    setActiveFilterModal(filterKey);
    setDraftFilterValue(filters[filterKey] || "all");
  };

  const closeFilterModal = () => {
    setActiveFilterModal("");
    setDraftFilterValue("");
  };

  const activeModalTitleMap = {
    brand: "Hãng xe",
    seats: "Số chỗ",
    tranmission: "Nhiên liệu",
    area: "Khu vực xe",
    sort: "Sắp xếp",
  };

  const isAllFilterActive =
    filters.brand === "all" &&
    filters.seats === "all" &&
    filters.tranmission === "all" &&
    filters.area === "all";

  return (
    <>
      <section className="results-page__search-strip">
        <Container>
          <div className="results-page__search-inner">
            <h2 className="results-page__search-title">Tìm xe tự lái</h2>
            <HeroSearchSummaryBar
              formData={searchForm}
              onOpen={() => setShowSearchModal(true)}
              onSearch={handleSearchSubmit}
            />
          </div>
        </Container>
      </section>

      <section className="results-page__filter-strip">
        <Container>
          <div className="results-page__chips">
            <button
              type="button"
              className={`results-filter-chip ${isAllFilterActive ? "is-active" : ""}`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  brand: "all",
                  seats: "all",
                  tranmission: "all",
                  area: "all",
                }))
              }
            >
              Tất cả
            </button>

            {filterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={`results-filter-chip ${
                  chip.key === FILTER_KEY.SORT
                    ? "is-active"
                    : filters[chip.key] !== "all"
                      ? "is-active"
                      : ""
                }`}
                onClick={() => openFilterModal(chip.key)}
              >
                <span className="material-symbols-outlined">{chip.icon}</span>
                {chip.label}
              </button>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-3 py-md-4">
        <div className="mb-3 d-flex flex-column flex-md-row justify-content-between gap-2">
          <div className="text-muted-soft fw-semibold">
            {cards.length} xe hiển thị
            {selectedCity ? ` tại ${selectedCity}` : ""}
          </div>
          <div className="text-muted-soft small">
            Trang {pageInfo.number + 1}/{Math.max(pageInfo.totalPages, 1)}
          </div>
        </div>

        {errorMessage ? <Alert variant="warning">{errorMessage}</Alert> : null}

        {isLoading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        ) : null}

        <Row xs={1} md={2} lg={4} className="g-3">
          {!isLoading && cards.length === 0 ? (
            <Col>
              <div className="text-muted-soft">Không tìm thấy xe phù hợp.</div>
            </Col>
          ) : null}

          {!isLoading &&
            cards.map((car) => (
              <Col key={car.id || car.title}>
                <ResultCard car={car} />
              </Col>
            ))}
        </Row>

        <div className="d-flex justify-content-center mt-4">
          <div className="d-flex align-items-center gap-2">
            <Button variant="light" className="border" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </Button>
            <Button className="btn-primary-custom">
              {pageInfo.number + 1}
            </Button>
            <Button variant="light" className="border" disabled>
              / {Math.max(pageInfo.totalPages, 1)}
            </Button>
            <Button variant="light" className="border" disabled>
              <span className="material-symbols-outlined">chevron_right</span>
            </Button>
          </div>
        </div>
      </Container>

      <HeroSearchModal
        show={showSearchModal}
        onHide={() => setShowSearchModal(false)}
        formData={searchForm}
        rentalDuration="2 ngày 4 giờ"
        showNightNotice={false}
        onFieldChange={handleSearchFieldChange}
        onSelectLocationOption={handleSelectLocationOption}
        onSubmit={handleSearchSubmit}
      />

      <FilterSelectModal
        show={Boolean(activeFilterModal)}
        title={activeModalTitleMap[activeFilterModal] || "Bộ lọc"}
        options={getOptionsByModalKey()}
        selectedValue={draftFilterValue}
        onSelect={(value) => setDraftFilterValue(value)}
        onClose={closeFilterModal}
        onApply={() => {
          if (!activeFilterModal) {
            closeFilterModal();
            return;
          }

          setFilters((prev) => ({
            ...prev,
            [activeFilterModal]: draftFilterValue || "all",
          }));
          closeFilterModal();
        }}
      />
    </>
  );
};

export default ResultsPage;
