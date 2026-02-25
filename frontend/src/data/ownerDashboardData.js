export const ownerDashboardData = {
  brand: "AutoRent",
  user: {
    name: "John Doe",
    role: "Super Host",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfFtbLwsLEt0WpLPPIcA9UWBkSW4wB04L9nMVAs6cXKKuT1j628pEf8oGrsLHjlgOLTPei2_VpHhyHfA0PsfIHv5v9C7kltliRK_2gpxJ7O0t3ULCH96R7JB3fPQksSF4FD5YFKiARUwyZwcXiu0z2ycyCnQJNIsQqk3sb8snB2GGWfrGa6FX0M2z9wZwmWO-rjGPPKpegvlh29EsTNBCfr3zDejioBKHknHRWZFTxFK7sql4nApZl5QaNolOg_2hYS_2e9autlG0",
  },
  stats: [
    {
      label: "Total Earnings",
      value: "$12,450",
      trend: "15%",
      icon: "attach_money",
    },
    {
      label: "Active Listings",
      value: "5",
      trend: "+1",
      icon: "directions_car",
    },
    {
      label: "Pending Requests",
      value: "3",
      trend: "Action Needed",
      icon: "pending",
    },
    { label: "Total Trips", value: "128", trend: "8%", icon: "route" },
  ],
  bookingRequests: [
    {
      id: "r1",
      car: "Tesla Model 3",
      dates: "Dec 12 - 15",
      renter: "Alex M.",
      rating: "4.9",
      earnings: "$340 est. earnings",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDNevl1HekFx9dPgmBy0qWwhr2jhDXBg3JAtLO0z44LfxFNILwhYi6ceRP5a3Gupsho_qCFFh-tsOJDHR2zpfR-Vo3mYcUNZ4TTJLm7FxLvizDFE-XFJz4LdOenDrkLpG3zbw68p3YXSdG49aIncBbKpBXHGCHFo7Vau5ejmlz_IENHv7sruDdAnbIXbxSKUxiKMprho0zxbuLC5eMZhhL_iSLgeZNMJ57Sh4xLMF1OVQ6wuCnHqJZv-8Yqp6ITkHQTi9KyeaEBYQw",
    },
    {
      id: "r2",
      car: "BMW X5",
      dates: "Dec 18 - 20",
      renter: "Sarah J.",
      rating: "5.0",
      earnings: "$410 est. earnings",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBAGiro8MuhkDbl9fOvI8CTCRgi4o8_ZCjyqnO7Pb57BP18V8sqeXOL2d7eCGEbIS4D5RsXYEarROvU_UqAWVf6zAZH4UHEstV7qURv2w3PaB7cbCzU__jLKTmMCrsd8KT-sbR1jvZ7utonwXhEhxcn0nJT6p_496gjcuAseCdlzJi4cUnF0I9GyhwOa9P-jx8HsZ_V85l_96CTBcG-wDtE9SapCQaEOcqLVSSsyJiwkva6ihZZq07COUvKNSGlGidFTJLRTuB2WNs",
    },
    {
      id: "r3",
      car: "Porsche 911",
      dates: "Today, 2:00 PM",
      renter: "Mike T.",
      rating: "4.2",
      earnings: "$120 est. earnings",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDJkUCfxACchPrFO0UONmevURcr9NrMyUtCv7cw2qAcv7npPR5nGL4lnQW0QcdKVbmTFfHBztuVrzVR4IpDDjjTdgg3oUikRjZJoXJw7i151Nr-bg6QZyBsgAHlVHOlA8SolezwQHJkPnkSxrUGWkjUrSN34GFavwqDTMQJzheWkp8faNZXoUUL-wbpLNbDfqTireq02WMJMI75HSjFb0UfooWgv9kP3Xcj16z9WTwcrJK1rO7vAgBmkRjAo7fihw7co5GHnvYi-AM",
    },
  ],
  fleet: [
    {
      id: "f1",
      name: "Tesla Model 3",
      plate: "8XF 292",
      status: "Available",
      extra: "$85/day",
    },
    {
      id: "f2",
      name: "BMW X5",
      plate: "4KL 119",
      status: "On Trip",
      extra: "Returns in 2h",
    },
    {
      id: "f3",
      name: "Porsche 911",
      plate: "9SS 881",
      status: "Offline",
      extra: "Maintenance",
    },
    {
      id: "f4",
      name: "Chevy Bolt",
      plate: "2WE 552",
      status: "Available",
      extra: "$55/day",
    },
  ],
  earnings: [
    { id: "e1", car: "BMW X5", dates: "Dec 10 - Dec 12", amount: "$280.00" },
    {
      id: "e2",
      car: "Tesla Model 3",
      dates: "Dec 08 - Dec 09",
      amount: "$150.00",
    },
    {
      id: "e3",
      car: "Porsche 911",
      dates: "Dec 05 - Dec 07",
      amount: "$450.00",
    },
  ],
};
