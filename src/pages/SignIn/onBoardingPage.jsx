import React, { useState } from "react";
import InputField from "@/pages/component/InputField";
import Button from "@/pages/component/Button";
import { Eye, EyeOff, ChevronDown } from "lucide-react"; 
import { useNavigate, useSearchParams } from "react-router";
import { useUser } from "../../contexts/user/useUser";

const OnBoarding = () => {

  const { createAccount, isLoading } = useUser();

  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // get role from URL params

  // console.log("role", searchParams.get("role"))

  const role = searchParams.get("role")
  // Step 1 fields
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const departments = [
    { code: "BSCS", name: "Bachelor of Science in Computer Science" },
    { code: "BSTM", name: "Bachelor of Science in Tourism Management" },
    { code: "BSBA", name: "Bachelor of Science in Business Administration" },
    { code: "BSHM", name: "Bachelor of Science in Hospitality Management" },
    { code: "BSA", name: "Bachelor of Science in Accountancy" },
    { code: "ACT", name: "Associate in Computer Technology" },
    { code: "BSNE", name: "Bachelor of Special Needs Education" },
    { code: "BEED", name: "Bachelor of Elementary Education" },
    { code: "BSED-ENG", name: "Bachelor of Secondary Education Major in English" },
    { code: "BSED-FIL", name: "Bachelor of Secondary Education Major in Filipino" }
  ];

  const handleNext = () => {
    if (!password || !passwordConfirm) {
      setPasswordError("Both fields are required");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const success = await createAccount(payload);

    if (success) {
      navigate("/home");
    } else {
      alert("Account creation failed. Please try again.");
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden px-4" style={{ backgroundColor: "#FDFBEE" }}>
      {/* Decorative Images */}
      <img src="https://res.cloudinary.com/diws5bcu6/image/upload/v1761577252/freepik__background__93517_1_ww82rt.png" alt="Left" className="absolute bottom-0 left-4 w-100 md:w-100 hidden md:block" />
      <img src="https://res.cloudinary.com/diws5bcu6/image/upload/v1761577536/download_1_t1ahpa.png" alt="Right" className="absolute bottom-0 right-4 w-100 md:w-100 hidden md:block" />

      <div className="bg-white shadow-lg rounded-lg p-8 md:p-10 w-full max-w-md relative z-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          {step === 1 ? "Step 1: Set Your Password" : "Step 2: Complete Profile"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="relative w-full">
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 pr-10 border-gray-300"
                />
                <div
                  className="absolute text-black top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>

              <div className="relative w-full">
                <InputField
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 pr-10 ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div
                  className="absolute text-black top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {!showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>

              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

              <Button
                type="button"
                style={{ width: "50%", margin: "0 auto", marginTop: "16px", padding: "10px", fontSize: "16px", fontWeight: "600", borderRadius: "8px", backgroundColor: "#0066D2", color: "#fff" }}
                onClick={handleNext}
              >
                Next
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              {role === "student" && (
                <>
                  <InputField type="text" placeholder="First Name" value={studentFn} onChange={(e) => setStudentFn(e.target.value)} />
                  <InputField type="text" placeholder="Last Name" value={studentLn} onChange={(e) => setStudentLn(e.target.value)} />
                  <InputField type="date" placeholder="Birthdate" value={studentBd} onChange={(e) => setStudentBd(e.target.value)} />
                  <div className="relative">
                    <button
                      type="button"
                      className="border border-black rounded-lg px-4 py-2 w-full text-gray-900 bg-white flex items-center justify-between hover:bg-gray-50 transition"
                      onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                    >
                      <span className="text-gray-900">
                        {studentCourse 
                          ? departments.find(d => d.code === studentCourse)?.name || "Select Department"
                          : "Select Department"
                        }
                      </span>
                      <ChevronDown size={20} className={`transition-transform ${showDeptDropdown ? "rotate-180" : ""}`} />
                    </button>
                    
                    {showDeptDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {departments.map((dept) => (
                          <button
                            key={dept.code}
                            type="button"
                            className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition border-b border-gray-200 last:border-b-0 bg-white"
                            onClick={() => {
                              setStudentCourse(dept.code);
                              setShowDeptDropdown(false);
                            }}
                          >
                            <span className="font-medium">{dept.code}:</span> {dept.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <select className="border border-black rounded-lg px-4 py-2 w-full text-black" value={studentYrLvl} onChange={(e) => setStudentYrLvl(e.target.value)}>
                    <option value="" className="text-black">Select Year Level</option>
                    <option value="1" className="text-black">1st Year</option>
                    <option value="2" className="text-black">2nd Year</option>
                    <option value="3" className="text-black">3rd Year</option>
                    <option value="4" className="text-black">4th Year</option>
                  </select>
                  <select className="border border-black rounded-lg px-4 py-2 w-full text-black" value={studentGender} onChange={(e) => setStudentGender(e.target.value)}>
                    <option value="" className="text-black">Select Gender</option>
                    <option value="Male" className="text-black">Male</option>
                    <option value="Female" className="text-black">Female</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                </>
              )}

              {role === "professor" && (
                <>
                  <InputField type="text" placeholder="First Name" value={profFn} onChange={(e) => setProfFn(e.target.value)} />
                  <InputField type="text" placeholder="Last Name" value={profLn} onChange={(e) => setProfLn(e.target.value)} />
                  <div className="relative">
                    <button
                      type="button"
                      className="border border-black rounded-lg px-4 py-2 w-full text-gray-900 bg-white flex items-center justify-between hover:bg-gray-50 transition"
                      onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                    >
                      <span className="text-gray-900">
                        {profDept 
                          ? departments.find(d => d.code === profDept)?.name || "Select Department"
                          : "Select Department"
                        }
                      </span>
                      <ChevronDown size={20} className={`transition-transform ${showDeptDropdown ? "rotate-180" : ""}`} />
                    </button>
                    
                    {showDeptDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {departments.map((dept) => (
                          <button
                            key={dept.code}
                            type="button"
                            className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition border-b border-gray-200 last:border-b-0 bg-white"
                            onClick={() => {
                              setProfDept(dept.code);
                              setShowDeptDropdown(false);
                            }}
                          >
                            <span className="font-medium">{dept.code}:</span> {dept.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <InputField type="date" placeholder="Birthdate" value={profBd} onChange={(e) => setProfBd(e.target.value)} />
                  <select className="border border-black rounded-lg px-4 py-2 w-full text-black" value={profGender} onChange={(e) => setProfGender(e.target.value)}>
                    <option value="" className="text-black">Select Gender</option>
                    <option value="Male" className="text-black">Male</option>
                    <option value="Female" className="text-black">Female</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                </>
              )}

              <div className="flex justify-between mt-4">
                <Button type="button" style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#9CA3AF", color: "fff", border: "none" }} onClick={handlePrev}>
                  Previous
                </Button>
                <Button type="submit" style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#0066D2", color: "#fff" }}>
                  Submit
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
