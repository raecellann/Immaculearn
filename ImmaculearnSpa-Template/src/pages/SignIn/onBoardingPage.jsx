import React, { useState } from "react";
import InputField from "@/pages/component/InputField";
// import Button from "../../pages/component/Button";
import { Eye, EyeOff, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useUser } from "../../contexts/user/useUser";
import {
  departmentOptions,
  genderOptions,
  yearLevelOptions,
} from "../component/enumOptions";
import Button from "../component/Button";

// ─── Password requirement rules ───────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  {
    id: "uppercase",
    label: "At least one uppercase letter (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "At least one number (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "At least one special character (!@#$…)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

const getPasswordStrength = (password) => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1)
    return { label: "Very Weak", color: "#ef4444", width: "20%" };
  if (passed === 2) return { label: "Weak", color: "#f97316", width: "40%" };
  if (passed === 3) return { label: "Fair", color: "#eab308", width: "60%" };
  if (passed === 4) return { label: "Strong", color: "#22c55e", width: "80%" };
  return { label: "Very Strong", color: "#16a34a", width: "100%" };
};

// ─── PasswordChecklist sub-component ──────────────────────────────────────────
const PasswordChecklist = ({ password }) => {
  if (!password) return null;
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-1.5">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <div key={rule.id} className="flex items-center gap-2 text-sm">
            {ok ? (
              <CheckCircle2
                size={15}
                className="flex-shrink-0"
                style={{ color: "#16a34a" }}
              />
            ) : (
              <XCircle
                size={15}
                className="flex-shrink-0"
                style={{ color: "#9ca3af" }}
              />
            )}
            <span style={{ color: ok ? "#16a34a" : "#6b7280" }}>
              {rule.label}
            </span>
          </div>
        );
      })}
      {/* Strength bar */}
      {(() => {
        const strength = getPasswordStrength(password);
        return (
          <div className="mt-1.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Password strength</span>
              <span
                className="text-xs font-semibold"
                style={{ color: strength.color }}
              >
                {strength.label}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: strength.width,
                  backgroundColor: strength.color,
                }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ─── Step 2 field validation ───────────────────────────────────────────────────
const validateStep2 = (role, fields) => {
  const errors = {};
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;

  if (role === "student") {
    if (!fields.studentFn.trim()) errors.studentFn = "First name is required";
    else if (!nameRegex.test(fields.studentFn.trim()))
      errors.studentFn = "Enter a valid first name";

    if (!fields.studentLn.trim()) errors.studentLn = "Last name is required";
    else if (!nameRegex.test(fields.studentLn.trim()))
      errors.studentLn = "Enter a valid last name";

    if (!fields.studentBd) errors.studentBd = "Birthdate is required";
    else {
      const age = Math.floor(
        (Date.now() - new Date(fields.studentBd)) / (365.25 * 24 * 3600 * 1000),
      );
      if (age < 10 || age > 100) errors.studentBd = "Enter a valid birthdate";
    }

    if (!fields.studentCourse)
      errors.studentCourse = "Please select a department";
    if (!fields.studentYrLvl)
      errors.studentYrLvl = "Please select a year level";
    if (!fields.studentGender) errors.studentGender = "Please select a gender";
  }

  if (role === "professor") {
    if (!fields.profFn.trim()) errors.profFn = "First name is required";
    else if (!nameRegex.test(fields.profFn.trim()))
      errors.profFn = "Enter a valid first name";

    if (!fields.profLn.trim()) errors.profLn = "Last name is required";
    else if (!nameRegex.test(fields.profLn.trim()))
      errors.profLn = "Enter a valid last name";

    if (!fields.profDept) errors.profDept = "Please select a department";

    if (!fields.profBd) errors.profBd = "Birthdate is required";
    else {
      const age = Math.floor(
        (Date.now() - new Date(fields.profBd)) / (365.25 * 24 * 3600 * 1000),
      );
      if (age < 18 || age > 100) errors.profBd = "Enter a valid birthdate";
    }

    if (!fields.profGender) errors.profGender = "Please select a gender";
  }

  return errors;
};

// ─── Main component ────────────────────────────────────────────────────────────
const OnBoarding = () => {
  const { createAccount, isLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");

  // Step 1 fields
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Student fields
  const [studentFn, setStudentFn] = useState("");
  const [studentLn, setStudentLn] = useState("");
  const [studentBd, setStudentBd] = useState("");
  const [studentGender, setStudentGender] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentYrLvl, setStudentYrLvl] = useState("");

  // Professor fields
  const [profFn, setProfFn] = useState("");
  const [profLn, setProfLn] = useState("");
  const [profBd, setProfBd] = useState("");
  const [profGender, setProfGender] = useState("");
  const [profDept, setProfDept] = useState("");

  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  // Step 2 field-level errors
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Step 1 next handler ──
  const handleNext = () => {
    if (!password || !passwordConfirm) {
      setPasswordError("Both fields are required");
      return;
    }

    const allPassed = PASSWORD_RULES.every((r) => r.test(password));
    if (!allPassed) {
      setPasswordError("Password does not meet all requirements");
      setShowChecklist(true);
      return;
    }

    if (password !== passwordConfirm) {
      setPasswordError("Passwords do not match!");
      return;
    }

    setPasswordError("");
    setStep(2);
  };

  const handlePrev = () => setStep(step - 1);

  // ── Step 2 submit handler ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateStep2(role, {
      studentFn,
      studentLn,
      studentBd,
      studentGender,
      studentCourse,
      studentYrLvl,
      profFn,
      profLn,
      profBd,
      profGender,
      profDept,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = {
      role,
      password,
      ...(role === "student"
        ? {
            first_name: studentFn,
            last_name: studentLn,
            birthdate: studentBd,
            gender: studentGender,
            course: studentCourse,
            year_level: studentYrLvl,
          }
        : {
            first_name: profFn,
            last_name: profLn,
            birthdate: profBd,
            gender: profGender,
            department: profDept,
          }),
    };

    try {
      setIsSubmitting(true);
      const success = await createAccount(payload);
      if (success) {
        role === "professor" ? navigate("/prof/home") : navigate("/home");
      } else {
      }
    } catch (err) {
      alert("Account creation failed. Please try again.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Confirm password match indicator ──
  const confirmMatchState =
    confirmTouched && passwordConfirm
      ? password === passwordConfirm
        ? "match"
        : "mismatch"
      : null;

  // ── Helper: field error message ──
  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>
    ) : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden px-4"
      style={{ backgroundColor: "#FDFBEE" }}
    >
      {/* Decorative Images */}
      <img
        src="https://res.cloudinary.com/diws5bcu6/image/upload/v1761577252/freepik__background__93517_1_ww82rt.png"
        alt="Left"
        className="absolute bottom-0 left-4  w-100 md:w-100 hidden md:block"
      />
      <img
        src="https://res.cloudinary.com/diws5bcu6/image/upload/v1761577536/download_1_t1ahpa.png"
        alt="Right"
        className="absolute bottom-0 right-4 w-100 md:w-100 hidden md:block"
      />

      <div className="bg-white shadow-lg rounded-lg p-8 md:p-10 w-full max-w-md relative z-10 border border-gray-200">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  backgroundColor: step >= s ? "#0066D2" : "#e5e7eb",
                  color: step >= s ? "#fff" : "#9ca3af",
                }}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className="h-0.5 w-10 rounded transition-all duration-300"
                  style={{ backgroundColor: step > 1 ? "#0066D2" : "#e5e7eb" }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          {step === 1
            ? "Step 1: Set Your Password"
            : "Step 2: Complete Profile"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              {/* Password field */}
              <div>
                <div className="relative w-full">
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setShowChecklist(true);
                      if (passwordError) setPasswordError("");
                    }}
                    onFocus={() => setShowChecklist(true)}
                    className="w-full border rounded-lg px-4 py-2 pr-10 border-gray-300"
                  />
                  <div
                    className="absolute text-black top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
                {showChecklist && <PasswordChecklist password={password} />}
              </div>

              {/* Confirm password field */}
              <div>
                <div className="relative w-full">
                  <InputField
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      setConfirmTouched(true);
                      if (passwordError) setPasswordError("");
                    }}
                    onBlur={() => setConfirmTouched(true)}
                    className={`w-full border rounded-lg px-4 py-2 pr-10 ${
                      confirmMatchState === "mismatch"
                        ? "border-red-500"
                        : confirmMatchState === "match"
                          ? "border-green-500"
                          : passwordError
                            ? "border-red-500"
                            : "border-gray-300"
                    }`}
                  />
                  <div
                    className="absolute text-black top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {!showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>

                {/* Inline confirm feedback */}
                {confirmMatchState === "match" && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 size={13} style={{ color: "#16a34a" }} />
                    <span className="text-xs" style={{ color: "#16a34a" }}>
                      Passwords match
                    </span>
                  </div>
                )}
                {confirmMatchState === "mismatch" && (
                  <div className="flex items-center gap-1 mt-1">
                    <XCircle size={13} style={{ color: "#ef4444" }} />
                    <span className="text-xs" style={{ color: "#ef4444" }}>
                      Passwords do not match
                    </span>
                  </div>
                )}
              </div>

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}

              <Button
                type="button"
                style={{
                  width: "50%",
                  margin: "0 auto",
                  marginTop: "16px",
                  padding: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  backgroundColor: "#0066D2",
                  color: "#fff",
                }}
                onClick={handleNext}
              >
                Next
              </Button>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              {role === "student" && (
                <>
                  {/* First Name + Last Name — equal-width side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        First Name
                      </label>
                      <InputField
                        type="text"
                        placeholder="First Name"
                        value={studentFn}
                        onChange={(e) => {
                          setStudentFn(e.target.value);
                          setFieldErrors((p) => ({ ...p, studentFn: "" }));
                        }}
                        className={`w-full ${fieldErrors.studentFn ? "border-red-500" : ""}`}
                      />
                      <FieldError name="studentFn" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Last Name
                      </label>
                      <InputField
                        type="text"
                        placeholder="Last Name"
                        value={studentLn}
                        onChange={(e) => {
                          setStudentLn(e.target.value);
                          setFieldErrors((p) => ({ ...p, studentLn: "" }));
                        }}
                        className={`w-full ${fieldErrors.studentLn ? "border-red-500" : ""}`}
                      />
                      <FieldError name="studentLn" />
                    </div>
                  </div>

                  {/* Birthdate — full width with label */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Birthdate
                    </label>
                    <InputField
                      type="date"
                      placeholder="Birthdate"
                      value={studentBd}
                      onChange={(e) => {
                        setStudentBd(e.target.value);
                        setFieldErrors((p) => ({ ...p, studentBd: "" }));
                      }}
                      className={`w-full ${fieldErrors.studentBd ? "border-red-500" : ""}`}
                    />
                    <FieldError name="studentBd" />
                  </div>

                  {/* Department dropdown */}
                  <div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`border rounded-lg px-4 py-2 w-full text-gray-900 bg-white flex items-center justify-between hover:bg-gray-50 transition ${fieldErrors.studentCourse ? "border-red-500" : "border-black"}`}
                        onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                      >
                        <span className="text-gray-900">
                          {studentCourse
                            ? departmentOptions.find(
                                (d) => d.code === studentCourse,
                              )?.name || "Select Department"
                            : "Select Department"}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${showDeptDropdown ? "rotate-180" : ""}`}
                        />
                      </button>
                      {showDeptDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {departmentOptions.map((dept) => (
                            <button
                              key={dept.code}
                              type="button"
                              className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition border-b border-gray-200 last:border-b-0 bg-white"
                              onClick={() => {
                                setStudentCourse(dept.code);
                                setShowDeptDropdown(false);
                                setFieldErrors((p) => ({
                                  ...p,
                                  studentCourse: "",
                                }));
                              }}
                            >
                              <span className="font-medium">{dept.code}:</span>{" "}
                              {dept.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <FieldError name="studentCourse" />
                  </div>

                  <div>
                    <select
                      className={`border rounded-lg px-4 py-2 w-full text-black ${fieldErrors.studentYrLvl ? "border-red-500" : "border-black"}`}
                      value={studentYrLvl}
                      onChange={(e) => {
                        setStudentYrLvl(e.target.value);
                        setFieldErrors((p) => ({ ...p, studentYrLvl: "" }));
                      }}
                    >
                      <option value="" className="text-black">
                        Select Year Level
                      </option>
                      {yearLevelOptions.map((yearLevel) => (
                        <option
                          key={yearLevel.code}
                          value={yearLevel.code}
                          className="text-black"
                        >
                          {yearLevel.name}
                        </option>
                      ))}
                    </select>
                    <FieldError name="studentYrLvl" />
                  </div>

                  <div>
                    <select
                      className={`border rounded-lg px-4 py-2 w-full text-black ${fieldErrors.studentGender ? "border-red-500" : "border-black"}`}
                      value={studentGender}
                      onChange={(e) => {
                        setStudentGender(e.target.value);
                        setFieldErrors((p) => ({ ...p, studentGender: "" }));
                      }}
                    >
                      <option value="" className="text-black">
                        Select Gender
                      </option>
                      {genderOptions.map((gender) => (
                        <option
                          key={gender.code}
                          value={gender.code}
                          className="text-black"
                        >
                          {gender.name}
                        </option>
                      ))}
                    </select>
                    <FieldError name="studentGender" />
                  </div>
                </>
              )}

              {role === "professor" && (
                <>
                  {/* First Name + Last Name — equal-width side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        First Name
                      </label>
                      <InputField
                        type="text"
                        placeholder="First Name"
                        value={profFn}
                        onChange={(e) => {
                          setProfFn(e.target.value);
                          setFieldErrors((p) => ({ ...p, profFn: "" }));
                        }}
                        className={`w-full ${fieldErrors.profFn ? "border-red-500" : ""}`}
                      />
                      <FieldError name="profFn" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Last Name
                      </label>
                      <InputField
                        type="text"
                        placeholder="Last Name"
                        value={profLn}
                        onChange={(e) => {
                          setProfLn(e.target.value);
                          setFieldErrors((p) => ({ ...p, profLn: "" }));
                        }}
                        className={`w-full ${fieldErrors.profLn ? "border-red-500" : ""}`}
                      />
                      <FieldError name="profLn" />
                    </div>
                  </div>

                  {/* Professor department dropdown */}
                  <div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`border rounded-lg px-4 py-2 w-full text-gray-900 bg-white flex items-center justify-between hover:bg-gray-50 transition ${fieldErrors.profDept ? "border-red-500" : "border-black"}`}
                        onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                      >
                        <span className="text-gray-900">
                          {profDept
                            ? departmentOptions.find((d) => d.code === profDept)
                                ?.name || "Select Department"
                            : "Select Department"}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${showDeptDropdown ? "rotate-180" : ""}`}
                        />
                      </button>
                      {showDeptDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {departmentOptions.map((dept) => (
                            <button
                              key={dept.code}
                              type="button"
                              className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition border-b border-gray-200 last:border-b-0 bg-white"
                              onClick={() => {
                                setProfDept(dept.code);
                                setShowDeptDropdown(false);
                                setFieldErrors((p) => ({ ...p, profDept: "" }));
                              }}
                            >
                              <span className="font-medium">{dept.code}:</span>{" "}
                              {dept.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <FieldError name="profDept" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Birthdate
                    </label>
                    <InputField
                      type="date"
                      placeholder="Birthdate"
                      value={profBd}
                      onChange={(e) => {
                        setProfBd(e.target.value);
                        setFieldErrors((p) => ({ ...p, profBd: "" }));
                      }}
                      className={`w-full ${fieldErrors.profBd ? "border-red-500" : ""}`}
                    />
                    <FieldError name="profBd" />
                  </div>

                  <div>
                    <select
                      className={`border rounded-lg px-4 py-2 w-full text-black ${fieldErrors.profGender ? "border-red-500" : "border-black"}`}
                      value={profGender}
                      onChange={(e) => {
                        setProfGender(e.target.value);
                        setFieldErrors((p) => ({ ...p, profGender: "" }));
                      }}
                    >
                      <option value="" className="text-black">
                        Select Gender
                      </option>
                      {genderOptions.map((gender) => (
                        <option
                          key={gender.code}
                          value={gender.code}
                          className="text-black"
                        >
                          {gender.name}
                        </option>
                      ))}
                    </select>
                    <FieldError name="profGender" />
                  </div>
                </>
              )}

              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#9CA3AF",
                    color: "#fff",
                    border: "none",
                  }}
                  onClick={handlePrev}
                >
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "#0066D2",
                    color: "#fff",
                  }}
                >
                  {isLoading ? "Submitting…" : "Submit"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default OnBoarding;
