import { Button } from "react-bootstrap";

const formatDisplayDate = (dateValue) => {
  if (!dateValue) {
    return "--/--/----";
  }

  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) {
    return dateValue;
  }

  return `${day}/${month}/${year}`;
};

const HeroSearchSummaryBar = ({ formData, onOpen, onSearch }) => {
  const isFromSearchButton = (target) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(target.closest(".hero-search-summary__button"));
  };

  const handleContainerClick = (event) => {
    if (isFromSearchButton(event.target)) {
      return;
    }

    onOpen();
  };

  const handleKeyDown = (event) => {
    if (isFromSearchButton(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onSearch) {
      onSearch();
      return;
    }

    onOpen();
  };

  return (
    <div
      className="hero-search-summary"
      role="button"
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      aria-label="Mở form tìm xe"
    >
      <div className="hero-search-summary__item hero-search-summary__item--location">
        <p className="hero-search-summary__label">Địa điểm nhận xe</p>
        <p className="hero-search-summary__value">{formData.location}</p>
      </div>

      <div className="hero-search-summary__item">
        <p className="hero-search-summary__label">Ngày nhận xe</p>
        <p className="hero-search-summary__value">
          {formatDisplayDate(formData.pickupDate)}
        </p>
      </div>

      <div className="hero-search-summary__item">
        <p className="hero-search-summary__label">Giờ nhận xe</p>
        <p className="hero-search-summary__value">{formData.pickupTime}</p>
      </div>

      <div className="hero-search-summary__item">
        <p className="hero-search-summary__label">Ngày trả xe</p>
        <p className="hero-search-summary__value">
          {formatDisplayDate(formData.returnDate)}
        </p>
      </div>

      <div className="hero-search-summary__item">
        <p className="hero-search-summary__label">Giờ trả xe</p>
        <p className="hero-search-summary__value">{formData.returnTime}</p>
      </div>

      <div className="hero-search-summary__item hero-search-summary__item--button">
        <Button
          type="button"
          className="hero-search-summary__button"
          onClick={handleSearchClick}
        >
          TÌM XE
        </Button>
      </div>
    </div>
  );
};

export default HeroSearchSummaryBar;
