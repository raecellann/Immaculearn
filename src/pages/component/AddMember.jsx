import React, { useState } from "react";
import { FiLink, FiCopy, FiX } from "react-icons/fi";
import { useSpace } from "../../contexts/space/useSpace";
import { useNotification } from "../../contexts/notification/notificationContextProvider";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { toast } from "react-toastify";
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
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

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
    const emailText = inviteEmail.trim();
    
    if (!emailText) {
      setEmailError("Please enter at least one email address");
      return;
    }

    // Split emails by comma and filter out empty strings
    const emails = emailText.split(',').map(email => email.trim()).filter(email => email);
    
    // Validate each email
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      setEmailError(`Invalid Gmail address(es): ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSending(true);
    
    try {
      // Send invites to all valid emails
      const results = await Promise.all(
        emails.map(email => inviteUser(currentSpace?.space_uuid, email))
      );
      
      // Check if all invites were sent successfully
      const successfulInvites = results.filter(result => result.success);
      const failedInvites = results.filter(result => !result.success);
      
      if (successfulInvites.length > 0) {
        if (emails.length === 1) {
          toast.success(`Invitation has been sent to ${emails[0]}`);
        } else {
          toast.success(`Invitations have been sent to ${emails.length} email addresses`);
        }
        setInviteEmail("");
        setEmailError("");
        setShowInvitePopup(false);
      }
      
      if (failedInvites.length > 0) {
        const failedEmails = failedInvites.map((result, index) => emails[index]).join(', ');
        setEmailError(`Failed to send invitations to: ${failedEmails}`);
      }
    } catch (error) {
      setEmailError("Failed to send invitations. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const validateEmail = (emailText) => {
    if (!emailText.trim()) {
      setEmailError("");
      return;
    }
    
    // Split emails by comma and filter out empty strings
    const emails = emailText.split(',').map(email => email.trim()).filter(email => email);
    
    if (emails.length === 0) {
      setEmailError("");
      return;
    }
    
    // Validate each email
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      if (invalidEmails.length === 1) {
        setEmailError("Please enter a valid Gmail address");
      } else {
        setEmailError(`Invalid Gmail address(es): ${invalidEmails.join(', ')}`);
      }
    } else {
      setEmailError("");
    }
  };

  const defaultStyles = {
    popupOverlay: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4",
    popupContainer: `rounded-2xl w-full max-w-md md:max-w-lg mx-auto p-4 sm:p-6 shadow-2xl border ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#2A2F3A] to-[#1E222A] border-gray-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
    }`,
    header: "flex items-center justify-between mb-4 sm:mb-6",
    iconContainer: "w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center",
    sectionTitle: "flex items-center gap-2 mb-3",
    indicator: "w-2 h-2 bg-blue-500 rounded-full",
    title: `text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`,
    inputContainer: `rounded-lg p-3 border ${
      isDarkMode 
        ? 'bg-gray-800/50 border-gray-600' 
        : 'bg-gray-100/50 border-gray-300'
    }`,
    emailInput: `flex-1 border rounded-lg px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
      isDarkMode 
        ? 'bg-[#1E222A] text-white border-gray-600 focus:border-blue-500' 
        : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
    }`,
    errorContainer: "flex items-center gap-2 text-red-400 text-xs",
    errorIndicator: "w-1 h-1 bg-red-400 rounded-full",
    buttonContainer: "flex gap-2 flex-col sm:flex-row lg:flex-row",
    sendButton: "px-3 py-2 sm:px-4 sm:py-2 lg:px-4 lg:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto lg:w-auto",
    linkContainer: `rounded-lg p-3 border ${
      isDarkMode 
        ? 'bg-gray-800/50 border-gray-600' 
        : 'bg-gray-100/50 border-gray-300'
    }`,
    linkText: `text-xs truncate flex-1 mr-2 ${
      isDarkMode ? 'text-gray-300' : 'text-gray-600'
    }`,
    copyButton: "text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all transform hover:scale-105",
    infoSection: `rounded-lg p-3 sm:p-4 border ${
      isDarkMode 
        ? 'bg-gray-800/30 border-gray-700' 
        : 'bg-gray-50/50 border-gray-200'
    }`,
    infoContent: "flex items-start gap-3",
    infoIconContainer: "w-6 h-6 sm:w-8 sm:h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
    closeButton: `p-1 rounded-lg transition-colors ${
      isDarkMode 
        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
    }`
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
          <h2 className={`text-base sm:text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
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
                placeholder="Enter email addresses (separated by commas)"
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
          {/* EMAIL INVITE INFO */}
          <div className="mt-4">
            <div className={styles.infoSection}>
              <div className={styles.infoContent}>
                <div className={styles.infoIconContainer}>
                  <span className="text-blue-400 text-xs">📧</span>
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Email Invitation
                  </p>
                  <p className={`text-xs leading-relaxed ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Enter multiple Gmail addresses separated by commas and click "Send Invite" to notify users.
                  </p>
                </div>
              </div>
            </div>
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
            <div className="flex items-center gap-2">
              <span className={styles.linkText}>
                {currentSpace?.space_link}
              </span>
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

        {/* INFO SECTION */}
        <div className={styles.infoSection}>
          <div className={styles.infoContent}>
            <div className={styles.infoIconContainer}>
              <FiLink size={12} className="sm:size-4 text-blue-400" />
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-medium mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Share Link
              </p>
              <p className={`text-xs leading-relaxed ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Copy this link and share it with people you want to invite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
