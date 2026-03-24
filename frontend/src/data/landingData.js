import heroBgImage from "../assets/background/bg-landingpage-1.png";
import mitsubishiSymbol from "../assets/brand/MITSUBISHI.webp";
import vinfastSymbol from "../assets/brand/Vinfast.webp";
import hondaSymbol from "../assets/brand/honda.webp";
import hyundaiSymbol from "../assets/brand/huyndai.webp";
import mazdaSymbol from "../assets/brand/mazda.webp";
import mercesdesSymbol from "../assets/brand/mercesdes.webp";
import peugeotSymbol from "../assets/brand/peugeot.webp";
import porscheSymbol from "../assets/brand/porsche.webp";
import toyotaSymbol from "../assets/brand/toyota.webp";

import binhDuongCityImage from "../assets/city/binhduongcity.webp";
import canThoCityImage from "../assets/city/canthocity.webp";
import daLatCityImage from "../assets/city/dalatcity.webp";
import daNangCityImage from "../assets/city/danangcity.webp";
import haNoiCityImage from "../assets/city/hanoicity.webp";
import hoChiMinhCityImage from "../assets/city/hochiminhcity.webp";
import khanhHoaCityImage from "../assets/city/khanhhoacity.webp";

export const heroBg = heroBgImage;

export const featuredCars = [
  {
    title: "Tesla Model 3",
    location: "San Francisco, CA",
    price: "$89",
    badge: "Electric",
    badge2: "Self-Driving",
    rating: "4.9 (120)",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0FE27gme52zwCEbdfs_zxhzxgMc-ODuZvpTZPE9ExzXLNSW4S15TsmFXOx0FRFzJMGIUBfi32pwkexQ6EJ8WHBwsc5h_hFaBTsyhLKS7yKs4DSsWx9IDnhz51W0I099-L_t5xt3pH5hzkQ7slJ9Of_6R8Xxn_jZyinTUv3u_ldr9Z_nomvtq95Kji1KM3A0gAiPIbmNl9dZAMr_Y70K8HP_tgUjkkcXQVFZKqhoGwLVpeuVGLeWq0c_mxL2U302MBsxPRMIBgPTg",
  },
  {
    title: "BMW i4",
    location: "Los Angeles, CA",
    price: "$110",
    badge: "Electric",
    badge2: "Luxury",
    rating: "4.8 (85)",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVVv5TLOqbmrfSn-zFZI0qDOqoiDgorwVfRn3em0OPRVp5E79U3gRsG8kn6gC5u4cwz2RE2Ja7uOfWy-rSofIlY_kuWY9e0diCy-7XbC4Qhb_wMK660P4LUndFSSCDSe1zvxD6DmrNV7umPEZjefS-VqzE2yFHcaoUf8qzDd5KhIMJ9ZcUtaJweNktL_HOdxCwf4AlzU6vGbnzhW_NQWHqs5aNBC44hBwb41QCXbROh9VBsuuUGJYxUbEMZ89YWAT_3NpwJHD7cTw",
  },
  {
    title: "Polestar 2",
    location: "Seattle, WA",
    price: "$95",
    badge: "Electric",
    badge2: "Performance",
    rating: "5.0 (42)",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgeplZ3nod6DCJ-QrPUuKFRKIEgPRrMJRRXH145TMS_GOXS6amAJb3qEI3XoG_agJs0alBSOg_pgBOob9fsrKCycz_IATn5-gfcdh11Z0MNyY7qXGw9Zl5U5oMUeNEFcdXh1uunLd1vubtzrdIsx08BOk9koIhJB_n4DfGHSbU6PA9rANK6ZpLhKV5PS4YbpWbU8eHp3okGuMmCry4wmuG6LiYu7kQl-4QaMhLOXruCQLN_57PP_L1httqg6kiBNdBfMZygC03tSU",
  },
];

export const landingBrands = [
  {
    name: "Mercedes",
    logo: mercesdesSymbol,
  },
  {
    name: "VinFast",
    logo: vinfastSymbol,
  },
  {
    name: "Porsche",
    logo: porscheSymbol,
  },
  {
    name: "Mitsubishi",
    logo: mitsubishiSymbol,
  },
  {
    name: "Mazda",
    logo: mazdaSymbol,
  },
  {
    name: "Toyota",
    logo: toyotaSymbol,
  },
  {
    name: "Hyundai",
    logo: hyundaiSymbol,
  },
  {
    name: "Honda",
    logo: hondaSymbol,
  },
  {
    name: "Peugeot",
    logo: peugeotSymbol,
  },
];

export const highlightedLocations = [
  {
    cityLabel: "Hồ Chí Minh",
    citySearchValue: "Ho Chi Minh",
    carCountLabel: "500+ xe",
    image: hoChiMinhCityImage,
  },
  {
    cityLabel: "Đà Nẵng",
    citySearchValue: "Da Nang",
    carCountLabel: "100+ xe",
    image: daNangCityImage,
  },
  {
    cityLabel: "Hà Nội",
    citySearchValue: "Ha Noi",
    carCountLabel: "150+ xe",
    image: haNoiCityImage,
  },
  {
    cityLabel: "Bình Dương",
    citySearchValue: "Binh Duong",
    carCountLabel: "150+ xe",
    image: binhDuongCityImage,
  },
  {
    cityLabel: "Khánh Hòa",
    citySearchValue: "Khanh Hoa",
    carCountLabel: "100+ xe",
    image: khanhHoaCityImage,
  },
  {
    cityLabel: "Cần Thơ",
    citySearchValue: "Can Tho",
    carCountLabel: "80+ xe",
    image: canThoCityImage,
  },
  {
    cityLabel: "Đà Lạt",
    citySearchValue: "Da Lat",
    carCountLabel: "90+ xe",
    image: daLatCityImage,
  },
];
