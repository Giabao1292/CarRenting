import { useRef } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";
import { highlightedLocations, landingBrands } from "../../../data/landingData";
import { buildCitySearchExpression } from "../../../utils/locationSearch";
import {
  getSearchLocation,
  saveSearchLocation,
} from "../../../utils/locationStorage";

const LandingDiscoverySections = () => {
  const navigate = useNavigate();
  const brandTrackRef = useRef(null);
  const locationTrackRef = useRef(null);

  const scrollTrack = (trackRef, direction = "next") => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const amount = track.clientWidth * 0.75;
    track.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const handleSelectBrand = (brandName) => {
    if (!brandName) {
      navigate(APP_ROUTES.RESULTS);
      return;
    }

    const params = new URLSearchParams();
    const selectedCity = getSearchLocation()?.city || "";
    const citySearch = buildCitySearchExpression(selectedCity);

    if (citySearch) {
      params.append("search", citySearch);
    }

    params.append("search", `brand:${brandName}`);
    navigate(`${APP_ROUTES.RESULTS}?${params.toString()}`);
  };

  const handleSelectCity = (cityLabel, cityValue) => {
    saveSearchLocation({
      locationLabel: cityLabel,
      city: cityValue,
      source: "landing-city",
    });

    const citySearch = buildCitySearchExpression(cityValue);
    if (!citySearch) {
      navigate(APP_ROUTES.RESULTS);
      return;
    }

    const params = new URLSearchParams();
    params.append("search", citySearch);
    navigate(`${APP_ROUTES.RESULTS}?${params.toString()}`);
  };

  return (
    <section className="landing-discovery mb-5">
      <div className="landing-discovery__block landing-discovery__block--brand">
        <h2 className="landing-discovery__title">Chọn xe theo hãng</h2>
        <div className="landing-discovery__carousel landing-discovery__carousel--brand">
          <button
            type="button"
            className="landing-discovery__arrow"
            aria-label="Xem hãng trước"
            onClick={() => scrollTrack(brandTrackRef, "prev")}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="landing-discovery__track" ref={brandTrackRef}>
            {landingBrands.map((brand) => (
              <article
                key={brand.name}
                className="brand-tile"
                role="button"
                tabIndex={0}
                onClick={() => handleSelectBrand(brand.name)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelectBrand(brand.name);
                  }
                }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="brand-tile__logo"
                />
                <p className="brand-tile__name">{brand.name}</p>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="landing-discovery__arrow"
            aria-label="Xem hãng tiếp theo"
            onClick={() => scrollTrack(brandTrackRef, "next")}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="landing-discovery__block landing-discovery__block--city">
        <h2 className="landing-discovery__title">Địa điểm nổi bật</h2>
        <div className="landing-discovery__carousel landing-discovery__carousel--city">
          <button
            type="button"
            className="landing-discovery__arrow"
            aria-label="Xem địa điểm trước"
            onClick={() => scrollTrack(locationTrackRef, "prev")}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div
            className="landing-discovery__track landing-discovery__track--location"
            ref={locationTrackRef}
          >
            {highlightedLocations.map((item) => (
              <article key={item.citySearchValue} className="location-tile">
                <img
                  src={item.image}
                  alt={item.cityLabel}
                  className="location-tile__image"
                />
                <div className="location-tile__body">
                  <div>
                    <h3 className="location-tile__city">{item.cityLabel}</h3>
                    <p className="location-tile__count">
                      <span className="material-symbols-outlined">
                        directions_car
                      </span>
                      {item.carCountLabel}
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="location-tile__button"
                    onClick={() =>
                      handleSelectCity(item.cityLabel, item.citySearchValue)
                    }
                  >
                    TÌM XE
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="landing-discovery__arrow"
            aria-label="Xem địa điểm tiếp theo"
            onClick={() => scrollTrack(locationTrackRef, "next")}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingDiscoverySections;
