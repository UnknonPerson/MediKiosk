import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  CalendarDays,
  MapPin,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import Button from "../../../components/ui/Button/Button";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Please enter your mobile number.";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Please select your date of birth.";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please enter your address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Patient registration:", formData);

    // Later:
    // 1. Send data to backend
    // 2. Create patient profile
    // 3. Navigate to ConsentPage
    // navigate("/patient/consent");
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <section className="min-h-screen bg-[#f4faf8]">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700">
              <CheckCircle2 size={20} className="text-white" />
            </div>

            <span className="font-bold text-slate-800">
              MediKiosk
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-5 py-10">
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <User size={30} className="text-emerald-700" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Create Your Profile
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Please provide your basic information to continue with
            your healthcare journey.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full rounded-xl border py-3 pl-12 pr-4 text-sm outline-none transition ${
                    errors.fullName
                      ? "border-red-400"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label
                htmlFor="mobile"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mobile Number
              </label>

              <div className="relative">
                <Phone
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={`w-full rounded-xl border py-3 pl-12 pr-4 text-sm outline-none transition ${
                    errors.mobile
                      ? "border-red-400"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              {errors.mobile && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Date of Birth
              </label>

              <div className="relative">
                <CalendarDays
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-3 pl-12 pr-4 text-sm outline-none transition ${
                    errors.dateOfBirth
                      ? "border-red-400"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="sm:col-span-2">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Gender
              </label>

              <div className="grid grid-cols-3 gap-3">
                {["Male", "Female", "Other"].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() =>
                      setFormData((previousData) => ({
                        ...previousData,
                        gender,
                      }))
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      formData.gender === gender
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    <UserRound size={17} />
                    {gender}
                  </button>
                ))}
              </div>

              {errors.gender && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Address
              </label>

              <div className="relative">
                <MapPin
                  size={19}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className={`w-full resize-none rounded-xl border py-3 pl-12 pr-4 text-sm outline-none transition ${
                    errors.address
                      ? "border-red-400"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              {errors.address && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.address}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <Button
              type="submit"
              className="flex w-full items-center justify-center gap-2 py-4"
            >
              Create Profile & Continue
              <ArrowRight size={19} />
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Your information will be securely used to create your
          healthcare profile.
        </p>
      </main>
    </section>
  );
};

export default RegistrationPage;