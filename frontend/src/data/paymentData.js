export const paymentData = {
  brand: "GreenRide",
  pageTitle: "Confirm & Pay",
  secureText: "Payments are secure and encrypted",
  methods: [
    {
      id: "vnpay",
      title: "VNPay QR",
      description: "Scan to pay instantly",
      icon: "qr_code_scanner",
      defaultChecked: true,
    },
    {
      id: "momo",
      title: "MoMo E-Wallet",
      description: "Fast e-wallet connection",
      icon: "account_balance_wallet",
    },
    {
      id: "card",
      title: "Credit / Debit Card",
      description: "Visa, Mastercard, JCB",
      icon: "credit_card",
    },
  ],
  booking: {
    carName: "Tesla Model 3",
    className: "Economy Class",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBLS3bp9clS9Sd7GOqy60CxCXZc_mNe6JhjPmiYtFuMZccc5cKoTHkHrqTfFfaB0xVQ12FQLmfVX06r2RAfcNI2Mr-d4vT_L-JYmksJYeN9XXxFUOfZL1TZ1u5aeE7rF07AJUbe25Orcr2UEWP6OsYVBv2Gwkq9S5GmEh35wxPI0DbS-Hb0eN1fE20T7HSOpCdnWFx3JIiz3NHg8Af5BxwTWnrkAKaOGeV653yKReSw78BITbQ26LDh5IEnvqLKljErwYLk0Nt_lvs",
    pickup: "Fri, Oct 24 • 10:00 AM",
    dropoff: "Mon, Oct 27 • 10:00 AM",
    location: "SFO Airport, Terminal 3",
    breakdown: [
      { label: "Car rental fee (3 days)", value: "$450.00" },
      { label: "Full Coverage Insurance", value: "$30.00" },
      { label: "Service Fee", value: "$15.00" },
      { label: "Green Discount", value: "-$25.00", isDiscount: true },
    ],
    total: "$470.00",
  },
};
