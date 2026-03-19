import { profileVerificationData } from "../../data/profileVerificationData";

export const getProfileVerificationInitialData = () => {
  return {
    ...profileVerificationData,
    personalInfo: { ...profileVerificationData.personalInfo },
  };
};
