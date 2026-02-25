export const adminDashboardData = {
  brand: "AutoRent Admin",
  admin: {
    name: "Admin",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZA7MZgRX-dEBB9X3jJY5aLCwbv9QIISssMcIm9FuDw7dHVOT33zWqKq6_8karmo1XCtX1ctyG4llLoQq7wAnHiFcBYS5DNDjpvzqBvSA51I6fGtMxgFh-DWy0nyKXYsOAAcIyxbEIILM2wcdmDLq6vni8iScSpzkCgqctKEGT7N4pi8D4-eO4acW6vqcVIbfk6SdtNvy3kpqRC711cE2rgbEjCYKB3wo71nc1RA7cu0KxeaVD3Ax3ui59zDYm47rch3_pTFALlUc",
  },
  stats: [
    { label: "Total Users", value: "12,450", trend: "+12%", icon: "group" },
    { label: "Active Rentals", value: "843", trend: "+5%", icon: "key" },
    {
      label: "Monthly Revenue",
      value: "$145,200",
      trend: "+8%",
      icon: "attach_money",
    },
    {
      label: "Pending Approvals",
      value: "18",
      trend: "Needs Action",
      icon: "pending_actions",
      highlight: true,
    },
  ],
  approvals: [
    {
      id: "a1",
      car: "Tesla Model S Plaid",
      owner: "Sarah Jenkins",
      listedAt: "Listed 2 hours ago",
      status: "Under Review",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAbIMofpmE0CtN0Tqv25vzoPRwp6rdUCPX3epsUGcOTdsKE2aj9ilk_0QhtUT2mTQlxTP0Mtnm-R1JyejoEU1Vvsha9Mjmq9a00NpYy3Q-ZVsggMlLvGtqsRd5SjSzqQadg2kPhzAYdgEw2KYKQRXXzODhDVEseDCCnB9tRN2vrJBMWvIKY6doaraQZGRPr4f3YpkHlVrd_1OttNFfeJHA3rlqho9E0viSFw57TH9wryoFh30bWD9SS3IcuJeyRhRL1dd47bFuX5io",
      checklist: ["Reg. Docs", "Inspection", "Photos (12)"],
      primaryAction: "Approve",
      secondaryAction: "Review",
    },
    {
      id: "a2",
      car: "Lucid Air Dream Edition",
      owner: "Michael Chang",
      listedAt: "Listed 5 hours ago",
      status: "Under Review",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDvSpdPyS32OZHsFPYtPyiWyMVv_DB-swxM3o5BBQYKY6E25M8_OIu58gGBIG6xVY60pos0KLsCZZW77vhaRWzBEP91Gx1VEnkdBLdvUCiccgLesUo7Ga8vUFn8rZum2RoI4n5JyKEPwegNWaYZ6J30_B-VWNASS6MUx632exv_6iRfUgTEeZ84oemA9CXMPYUUx5APmqX1XKAk9ciXPX4Qkakg5CXY7Wq7cFsD5fivmW4kYfId42FsRAxCzdjd0l0eAHRse0vfMV8",
      checklist: ["Reg. Docs", "Incomplete Insp."],
      primaryAction: "Approve",
      secondaryAction: "Contact Owner",
      disabledPrimary: true,
    },
    {
      id: "a3",
      car: "Polestar 2",
      owner: "Emily Blunt",
      listedAt: "Listed 1 day ago",
      status: "Flagged",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAHNDrPgEopoTwohpM0n9eHNCXdDlGa2Oj28NY5fWWYgvPyCyCDaw4_oOuOq8J-Bdb_F6-6ehBXRxG_FZSpNIYOkfux0mFiR8zHklDMfUEDNl_U9OPQ91AEF_2MTfIzPkRxG05EcRQK6wSMItVvfTdDf8ML5zr7X0kRdmrbSxaN1rHTbjhtGomFL0RDyFCYSpp7D8FTOyAEauveP3uibjEe0-ZSALnX8dfFxnOpikdVIA1bKpxgE_1cRYMMDrsmDxzUC2gk_b-gSw4",
      note: "Flagged for suspicious document quality. Manual review required.",
      primaryAction: "Reject",
      secondaryAction: "Investigate",
      danger: true,
    },
  ],
  quickActions: [
    { label: "Add User", icon: "add_circle" },
    { label: "Verify ID", icon: "verified" },
    { label: "Issues (4)", icon: "warning" },
    { label: "Config", icon: "settings" },
  ],
  activityLog: [
    {
      id: "l1",
      title: "New User Registration",
      detail: "Alex M. joined the platform",
      time: "10 mins ago",
      color: "success",
    },
    {
      id: "l2",
      title: "Rental Completed",
      detail: "Booking #R4592 finished successfully",
      time: "45 mins ago",
      color: "primary",
    },
    {
      id: "l3",
      title: "Payment Issue",
      detail: "Failed transaction for User #8821",
      time: "2 hours ago",
      color: "warning",
    },
    {
      id: "l4",
      title: "System Update",
      detail: "Automated backup completed",
      time: "5 hours ago",
      color: "secondary",
    },
  ],
};
