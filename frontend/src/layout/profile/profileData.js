export const profileData = {
  user: {
    name: "Gia Bảo",
    tier: "Khách thuê xe",
    tripCount: 0,
    points: 0,
    joinedDate: "20/03/2026",
    birthDate: "--/--/----",
    gender: "Nam",
    phone: "",
    phoneVerified: false,
    email: "giabao3620044@gmail.com",
    emailVerified: true,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbBUTIcGMqubISw9bOJ9Or0mPSzjxACeDYFn0H6ocKXbgMBvLnqw3dAUSHt6UVpuyTEyaL4Ib0kgbQkgbR0PyDN1FyZ7VgnYmKeAlxkCe3kf95QI-YRckyUNhrnqmd-mJvJN0yfG1S1DHcF0k0gqKsasNKfZH3ZrmS7DFoHh_kb1ep7pIEyu64DF6I34vDuO9veZ7v9miMNDOUmPYT02hV7ocO6dvxcfRsoXn8M7BPLt9Zzr3PBeCVQ7PGfkEJ5D9c__9Ar79cDFk",
  },
  license: {
    verified: false,
    number: "",
    fullName: "",
    birthDate: "01/01/1970",
  },
  trips: [
    {
      id: 1,
      status: "Sắp diễn ra",
      statusKey: "upcoming",
      name: "Toyota Vios 1.5G",
      category: "Sedan",
      dates: "27/03/2026 - 29/03/2026",
      location: "Quận 1, TP.HCM",
      access: "Nhận xe tự động bằng app",
      price: "1.800.000đ",
      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 2,
      status: "Hoàn thành",
      statusKey: "completed",
      name: "Mazda CX-5 Premium",
      category: "SUV",
      dates: "15/03/2026 - 17/03/2026",
      location: "Thành phố Thủ Đức",
      access: "Giao xe tận nơi",
      price: "2.450.000đ",
      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    },
  ],
};
