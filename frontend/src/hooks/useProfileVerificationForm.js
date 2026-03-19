import { useMemo, useState } from "react";

const namePattern = /^[a-zA-Z\s'.-]{2,}$/;
const phonePattern = /^\+?[0-9\s()-]{9,15}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const validateFieldValue = (field, value) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Please fill in this field.";
  }

  if (field === "fullName" && !namePattern.test(trimmed)) {
    return "Please enter a valid full name.";
  }

  if (field === "dob" && !datePattern.test(trimmed)) {
    return "Please use date format YYYY-MM-DD.";
  }

  if (field === "phone" && !phonePattern.test(trimmed)) {
    return "Please enter a valid phone number.";
  }

  return "";
};

const useProfileVerificationForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const isValid = useMemo(
    () => Object.values(errors).every((value) => !value),
    [errors],
  );

  const setFieldValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateFieldValue(field, value),
    }));
  };

  const validateAll = () => {
    const nextErrors = {
      fullName: validateFieldValue("fullName", values.fullName ?? ""),
      dob: validateFieldValue("dob", values.dob ?? ""),
      phone: validateFieldValue("phone", values.phone ?? ""),
      nationality: validateFieldValue("nationality", values.nationality ?? ""),
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  };

  return {
    values,
    errors,
    isValid,
    setFieldValue,
    validateAll,
  };
};

export default useProfileVerificationForm;
