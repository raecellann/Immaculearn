import React, { useState } from "react";
import { FiLink, FiCopy, FiX } from "react-icons/fi";
import { useSpace } from "../../contexts/space/useSpace";
import { useNotification } from "../../contexts/notification/notificationContextProvider";
import isValidEmail from "../../utils/isValidEmail.js";

const AddMember = ({ 
  currentSpace, 
  showInvitePopup, 
  setShowInvitePopup,
  customStyles = {} 
}) => {
  const [copyFeedback, setCopyFeedback] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const { inviteUser } = useSpace();
  const { addNotification } = useNotification();

  const handleCopyLink = (space_link) => {
    navigator.clipboard
      .writeText(space_link)
      .then(() => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setCopyFeedback("Error!");
        setTimeout(() => setCopyFeedback(""), 2000);
      });
  };

  const sendInvite = async () => {
    const email = inviteEmail.trim();
    
    if (!email) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid Gmail address");
      return;
    }

    setIsSending(true);
    
    try {
      const result = await inviteUser(currentSpace?.space_uuid, email);
      
      if (result.success) {
        addNotification({
          type: "success",
          title: "Invitation Sent",
          message: `Invitation has been sent to ${email}`,
          duration: 3000,
        });
        setInviteEmail("");
        setEmailError("");
        setShowInvitePopup(false);
      } else {
        setEmailError(result.message || "Failed to send invitation");
      }
    } catch (error) {
      setEmailError("Failed to send invitation. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      setEmailError("");
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid Gmail address");
    } else {
      setEmailError("");
    }
  };

  const defaultStyles = {
    popupOverlay: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4",
    popupContainer: "bg-gradient-to-br from-[#2A2F3A] to-[#1E222A] rounded-2xl w-full max-w-md mx-auto p-4 sm:p-6 shadow-2xl border border-gray-700",
    header: "flex items-center justify-between mb-4 sm:mb-6",
    iconContainer: "w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center",
    sectionTitle: "flex items-center gap-2 mb-3",
    indicator: "w-2 h-2 bg-blue-500 rounded-full",
    title: "text-xs sm:text-sm font-medium text-white",
    inputContainer: "bg-gray-800/50 border border-gray-600 rounded-lg p-3",
    emailInput: "flex-1 bg-[#1E222A] border rounded-lg px-3 py-2 text-white text-xs sm:text-sm outline-none transition-colors",
    errorContainer: "flex items-center gap-2 text-red-400 text-xs",
    errorIndicator: "w-1 h-1 bg-red-400 rounded-full",
    buttonContainer: "flex gap-2 flex-col sm:flex-row",
    sendButton: "px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto",
    linkContainer: "bg-gray-800/50 border border-gray-600 rounded-lg p-3",
    linkText: "text-xs text-gray-300 truncate flex-1 mr-2",
    copyButton: "text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all transform hover:scale-105 w-fit mx-auto sm:mx-0",
    infoSection: "bg-gray-800/30 border border-gray-700 rounded-lg p-3 sm:p-4",
    infoContent: "flex items-start gap-3",
    infoIconContainer: "w-6 h-6 sm:w-8 sm:h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
    closeButton: "text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
  };

  const styles = { ...defaultStyles, ...customStyles };

  if (!showInvitePopup) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <FiLink size={16} className="sm:size-4 text-white" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Add Member
          </h2>
          <button
            onClick={() => setShowInvitePopup(false)}
            className={styles.closeButton}
          >
            <FiX size={16} className="sm:size-4" />
          </button>
        </div>

        {/* EMAIL INVITATION */}
        <div className="mb-4 sm:mb-6">
          <div className={styles.sectionTitle}>
            <div className={styles.indicator} />
            <p className={styles.title}>
              Invite by Email
            </p>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.buttonContainer}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                placeholder="Enter email address"
                className={`${styles.emailInput} ${
                  emailError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-blue-500'
                }`}
              />
              <button
                onClick={sendInvite}
                disabled={!inviteEmail.trim() || !!emailError || isSending}
                className={`${styles.sendButton} ${
                  !inviteEmail.trim() || !!emailError || isSending
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSending ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
            {emailError && (
              <div className={styles.errorContainer}>
                <div className={styles.errorIndicator} />
                <span className="text-xs">{emailError}</span>
              </div>
            )}
          </div>
        </div>

        {/* INVITATION LINK */}
        <div className="mb-4 sm:mb-6">
          <div className={styles.sectionTitle}>
            <div className={styles.indicator} />
            <p className={styles.title}>
              Share Invitation Link
            </p>
          </div>
          <div className={styles.linkContainer}>
            <div className="flex flex-col gap-2">
              <span className={styles.linkText}>
                {currentSpace?.space_link}
              </span>
              <div className="flex justify-center">
                <button
                  onClick={() => handleCopyLink(currentSpace?.space_link)}
                  className={`${styles.copyButton} ${
                    copyFeedback
                      ? copyFeedback === "Copied!"
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                        : "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <FiCopy size={12} className="sm:size-4" />
                    <span>{copyFeedback || "Copy"}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INFO SECTION */}
        <div className={styles.infoSection}>
          <div className={styles.infoContent}>
            <div className={styles.infoIconContainer}>
              <FiLink size={12} className="sm:size-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-white mb-1">
                How to invite members
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Copy invitation link above and share it with people
                you want to add to this space. They can join using this
                link.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
