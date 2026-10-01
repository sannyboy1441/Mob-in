import React, { useState, useEffect } from "react";
import "./Login.css";
import { supabase } from "../supabaseClient";
import mobinLogo from "../assets/mobin_logo.png";
import PasswordStrength from "./ui/password-strength";
import { Building2, UserCircle, X, ShieldCheck, KeyRound, CheckCircle2, Check } from "lucide-react";
import emailjs from "@emailjs/browser";
import TermsAndConditionsModal from "./TermsAndConditionsModal";

/* SVG Icons */
function IconMail() {
  return (
    <svg
      className="login-input-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8c7b6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconEye({ visible }) {
  if (visible) {
    return (
      <svg
        className="login-input-icon toggleable"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8c7b6d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      className="login-input-icon toggleable"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8c7b6d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg
      className="google-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function getEmailAliases(email) {
  const clean = (email || "").trim().toLowerCase();
  const [local, domain] = clean.split("@");
  if (!local || !domain) return [clean];

  const aliases = new Set([clean]);

  // Names often inverted (e.g. angelalfeche2 <-> alfecheangel2, sarahjenkins <-> jenkinssarah)
  const nameParts = [
    "angel", "alfeche",
    "sarah", "jenkins",
    "reymart", "casquejo",
    "pauline", "decinal",
    "jimuel", "destura",
    "hannah", "rivera",
    "joshua", "lim",
    "mary", "ann", "dasalo"
  ];

  const numMatch = local.match(/\d+$/);
  const num = numMatch ? numMatch[0] : "";
  const alphaPart = local.replace(/\d+$/, "").replace(/[._-]/g, "");

  for (let i = 0; i < nameParts.length; i++) {
    for (let j = 0; j < nameParts.length; j++) {
      if (i !== j) {
        const p1 = nameParts[i];
        const p2 = nameParts[j];
        if (alphaPart === p1 + p2) {
          aliases.add(p2 + p1 + num + "@" + domain);
          aliases.add(p1 + "." + p2 + num + "@" + domain);
          aliases.add(p2 + "." + p1 + num + "@" + domain);
        }
      }
    }
  }

  // Handle dots in email
  if (local.includes(".")) {
    aliases.add(local.replace(/\./g, "") + "@" + domain);
  }

  return Array.from(aliases);
}

export default function Login({
  initialMode = "signin",
  onLoginSuccess,
  onBackToHome,
}) {
  const [mode, setMode] = useState(initialMode); // "signin" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);

  // EmailJS OTP Password Reset States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  // EmailJS Signup Verification States
  const [showSignupVerifyModal, setShowSignupVerifyModal] = useState(false);
  const [signupPendingData, setSignupPendingData] = useState(null);
  const [generatedSignupOtp, setGeneratedSignupOtp] = useState("");
  const [enteredSignupOtp, setEnteredSignupOtp] = useState("");
  const [signupVerifyLoading, setSignupVerifyLoading] = useState(false);
  const [signupVerifyError, setSignupVerifyError] = useState("");
  const [signupVerifySuccess, setSignupVerifySuccess] = useState("");

  // Terms and Conditions Modal State (Shown after successful account creation)
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingTermsUser, setPendingTermsUser] = useState(null);

  const resetFormFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordFocused(false);
    setErrorMessage("");
    setSuccessMessage("");
    setEnteredSignupOtp("");
    setSignupVerifyError("");
    setSignupVerifySuccess("");
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    resetFormFields();
  };

  useEffect(() => {
    setMode(initialMode);
    resetFormFields();
  }, [initialMode]);

  const handleClose = () => {
    setIsClosing(true);
    resetFormFields();
    setTimeout(() => {
      if (onBackToHome) onBackToHome();
    }, 240);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showOtpModal) {
          setShowOtpModal(false);
        } else if (showSignupVerifyModal) {
          setShowSignupVerifyModal(false);
        } else if (showRoleModal) {
          setShowRoleModal(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOtpModal, showSignupVerifyModal, showRoleModal]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsGoogleSignUp(false);

    const cleanEmail = email.trim().toLowerCase();

    // IF SIGN UP: Validate input first, then show Role Selection Modal!
    if (mode === "signup") {
      if (!firstName.trim() || !lastName.trim() || !cleanEmail || !password || !confirmPassword) {
        setErrorMessage("Please fill in all required credentials to continue.");
        return;
      }
      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please ensure both fields are identical.");
        return;
      }
      setShowRoleModal(true);
      return;
    }

    // SIGN IN FLOW
    setLoading(true);

    // Built-in Super Admin access check
    if (cleanEmail === "admin@mobin.ph" || cleanEmail === "admin") {
      if (password === "admin123" || password === "Admin@123") {
        setTimeout(() => {
          setLoading(false);
          const adminUser = {
            id: "super-admin-001",
            email: "admin@mobin.ph",
            user_metadata: {
              full_name: "Mob'in Super Admin",
              role: "superadmin",
            },
          };
          if (onLoginSuccess) {
            onLoginSuccess(adminUser);
          }
        }, 300);
        return;
      } else {
        setLoading(false);
        setErrorMessage("Invalid email or password. Please check your credentials.");
        return;
      }
    }

    // Built-in Landlord access check (STRICTLY requires landlord123)
    if (cleanEmail === "landlord@mobin.ph" || cleanEmail === "landlord") {
      if (password === "landlord123" || password === "Landlord@123") {
        setTimeout(() => {
          setLoading(false);
          const savedCustomName =
            localStorage.getItem("mobin_landlord_custom_name") ||
            (() => {
              try {
                const list = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
                const u = list.find((x) => typeof x === "object" && (x.email === "landlord@mobin.ph" || x.id === "landlord-001"));
                return u?.name || u?.full_name;
              } catch (_) { return null; }
            })() ||
            "Sarah Jenkins";

          const landlordUser = {
            id: "landlord-001",
            email: "landlord@mobin.ph",
            user_metadata: {
              full_name: savedCustomName,
              role: "landlord",
            },
          };

          try {
            localStorage.setItem("mobin_current_session", JSON.stringify(landlordUser));
          } catch (_) {}

          // Ensure mobin_registered_users updates Sarah Jenkins entry in place instead of duplicating
          try {
            const list = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
            let found = false;
            const updatedList = list.map((item) => {
              const itemEmail = (typeof item === "string" ? item : item?.email || "").toLowerCase().trim();
              const itemId = typeof item === "object" ? item?.id : null;
              if (itemEmail === "landlord@mobin.ph" || itemId === "landlord-001") {
                found = true;
                return {
                  ...(typeof item === "object" ? item : { email: "landlord@mobin.ph" }),
                  id: "landlord-001",
                  name: savedCustomName,
                  full_name: savedCustomName,
                  role: "Landlord",
                  status: "Active",
                  email_verified: true,
                };
              }
              return item;
            });
            if (!found) {
              updatedList.unshift({
                id: "landlord-001",
                email: "landlord@mobin.ph",
                name: savedCustomName,
                full_name: savedCustomName,
                role: "Landlord",
                status: "Active",
                email_verified: true,
                created_at: new Date().toISOString(),
              });
            }
            localStorage.setItem("mobin_registered_users", JSON.stringify(updatedList));
            window.dispatchEvent(new Event("mobin_users_updated"));
          } catch (_) {}

          if (onLoginSuccess) {
            onLoginSuccess(landlordUser);
          }
        }, 300);
        return;
      } else {
        setLoading(false);
        setErrorMessage("Invalid email or password. Please check your credentials.");
        return;
      }
    }

    // Resolve email aliases (e.g. angelalfeche2 <-> alfecheangel2)
    const allAliases = getEmailAliases(cleanEmail);

    // Check local credential store & saved passwords across all aliases
    let savedPassword = null;
    let credsUser = null;
    let registeredUser = null;

    for (const a of allAliases) {
      if (!savedPassword) savedPassword = localStorage.getItem(`mobin_pwd_${a}`);
      if (!credsUser) {
        try {
          const creds = JSON.parse(localStorage.getItem("mobin_user_credentials") || "{}");
          if (creds[a]) credsUser = creds[a];
        } catch (_) {}
      }
      if (!registeredUser) {
        try {
          const storedList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
          const found = storedList.find((item) => {
            const itemEmail = (typeof item === "string" ? item : item?.email || "").trim().toLowerCase();
            return itemEmail === a;
          });
          if (found) registeredUser = found;
        } catch (_) {}
      }
    }

    try {
      let authUser = null;
      let lastAuthError = null;

      // 1. Try standard Supabase authentication across primary email and aliases
      for (const a of allAliases) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: a,
            password: password,
          });
          if (!error && data?.user) {
            authUser = data.user;
            break;
          } else if (error) {
            lastAuthError = error;
          }
        } catch (e) {
          lastAuthError = e;
        }
      }

      // Supabase verified the password matches the hash if it returns 'Email not confirmed'
      const isEmailNotConfirmed = !!(
        lastAuthError?.message &&
        lastAuthError.message.toLowerCase().includes("email not confirmed")
      );

      // Check if entered password matches locally stored password
      const isMobinPasswordMatch =
        (savedPassword && password === savedPassword) ||
        (credsUser?.password && password === credsUser.password) ||
        (registeredUser?.password && password === registeredUser.password);

      if (authUser) {
        // Authenticated directly via Supabase Auth
        allAliases.forEach((a) => {
          localStorage.setItem(`mobin_pwd_${a}`, password);
        });
        const creds = JSON.parse(localStorage.getItem("mobin_user_credentials") || "{}");
        allAliases.forEach((a) => {
          creds[a] = {
            ...(creds[a] || {}),
            email: a,
            password: password,
            id: authUser.id,
            updated_at: new Date().toISOString(),
          };
        });
        localStorage.setItem("mobin_user_credentials", JSON.stringify(creds));

        // Sync status to Active in mobin_registered_users
        try {
          const storedList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
          let updated = false;
          const updatedList = storedList.map((item) => {
            const itemEmail = (typeof item === "string" ? item : item?.email || "").toLowerCase().trim();
            const itemId = typeof item === "object" ? item?.id : null;
            if (allAliases.includes(itemEmail) || (authUser.id && itemId === authUser.id)) {
              updated = true;
              return {
                ...(typeof item === "object" ? item : { email: item }),
                status: "Active",
                email_verified: true,
                password: password,
              };
            }
            return item;
          });
          if (updated) {
            localStorage.setItem("mobin_registered_users", JSON.stringify(updatedList));
            window.dispatchEvent(new Event("mobin_users_updated"));
          }
        } catch (_) {}

        // Ensure user_metadata has role if it was in profiles table
        if (!authUser.user_metadata?.role) {
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("role, full_name")
              .eq("id", authUser.id)
              .maybeSingle();
            if (prof?.role) {
              authUser.user_metadata = {
                ...authUser.user_metadata,
                role: prof.role,
                full_name: prof.full_name || authUser.user_metadata?.full_name,
              };
            }
          } catch (_) {}
        }
      } else if (isEmailNotConfirmed || isMobinPasswordMatch) {
        // 2. Password has been strictly verified:
        // Either Supabase verified the password hash (with email confirmation pending),
        // or local verified credentials matched the entered password.
        let userRole = null;
        let userFullName = null;
        let userId = null;

        // Query profiles table in Supabase
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .or(allAliases.map((a) => `email.eq.${a}`).join(","))
            .maybeSingle();
          if (prof?.role) userRole = prof.role;
          if (prof?.full_name) userFullName = prof.full_name;
          if (prof?.id) userId = prof.id;
        } catch (_) {}

        // Query properties table to see if user is a landlord
        if (!userRole || userRole !== "landlord") {
          try {
            const { data: matchedProps } = await supabase
              .from("properties")
              .select("id, property_name, landlord_name, landlord_email, landlord_id")
              .or(allAliases.map((a) => `landlord_email.eq.${a}`).join(","));
            if (matchedProps && matchedProps.length > 0) {
              const prop = matchedProps[0];
              userRole = "landlord";
              if (!userFullName) userFullName = prop.landlord_name;
              if (!userId) userId = prop.landlord_id;
            }
          } catch (_) {}
        }

        if (!userRole) {
          const rawRole = credsUser?.role || registeredUser?.role || (cleanEmail.includes("landlord") ? "landlord" : "renter");
          userRole = rawRole.toLowerCase().includes("landlord") ? "landlord" : "renter";
        }
        if (!userFullName) {
          userFullName = credsUser?.full_name || registeredUser?.name || registeredUser?.full_name || cleanEmail.split("@")[0];
        }
        if (!userId) {
          userId = credsUser?.id || registeredUser?.id || `user-${Date.now()}`;
        }

        authUser = {
          id: userId,
          email: cleanEmail,
          user_metadata: {
            full_name: userFullName,
            role: userRole,
          },
        };

        allAliases.forEach((a) => {
          localStorage.setItem(`mobin_pwd_${a}`, password);
        });
        const creds = JSON.parse(localStorage.getItem("mobin_user_credentials") || "{}");
        allAliases.forEach((a) => {
          creds[a] = {
            ...(creds[a] || {}),
            email: a,
            password: password,
            role: userRole,
            full_name: userFullName,
            id: userId,
            updated_at: new Date().toISOString(),
          };
        });
        localStorage.setItem("mobin_user_credentials", JSON.stringify(creds));

        try {
          const storedList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
          let updated = false;
          const updatedList = storedList.map((item) => {
            const itemEmail = (typeof item === "string" ? item : item?.email || "").toLowerCase().trim();
            if (allAliases.includes(itemEmail)) {
              updated = true;
              return {
                ...(typeof item === "object" ? item : { email: item }),
                status: "Active",
                email_verified: true,
                password: password,
                role: userRole === "landlord" ? "Landlord" : "Student / Renter",
                name: userFullName,
                full_name: userFullName,
              };
            }
            return item;
          });
          if (!updated) {
            updatedList.unshift({
              id: userId,
              email: cleanEmail,
              password: password,
              name: userFullName,
              full_name: userFullName,
              role: userRole === "landlord" ? "Landlord" : "Student / Renter",
              status: "Active",
              email_verified: true,
              created_at: new Date().toISOString(),
              source: "verified_login",
            });
          }
          localStorage.setItem("mobin_registered_users", JSON.stringify(updatedList));
          window.dispatchEvent(new Event("mobin_users_updated"));
        } catch (_) {}
      } else {
        // Password failed both Supabase Auth hash validation AND local store.
        // STRICT REJECTION: Invalid credentials!
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      }

      // If user is authenticated, save session and complete login
      if (authUser) {
        try {
          localStorage.setItem("mobin_current_session", JSON.stringify(authUser));
        } catch (_) {}
        if (onLoginSuccess) {
          onLoginSuccess(authUser);
        }
      } else {
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  // FINAL SIGNUP WITH CHOSEN ROLE ('landlord' or 'renter')
  const handleRoleSignUp = async (selectedRole) => {
    if (isGoogleSignUp) {
      localStorage.setItem("pending_oauth_role", selectedRole);
      setShowRoleModal(false);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } catch (err) {
        setErrorMessage(err.message || "Google sign-in error.");
      }
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setShowRoleModal(false);

    const cleanEmail = email.trim().toLowerCase();
    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          data: {
            full_name: combinedFullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: selectedRole, // assigned in Supabase user metadata
          },
        },
      });

      if (error) throw error;

      // Persist registered email to database and local cache for instant verification
      try {
        if (data?.user?.id) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: combinedFullName,
            role: selectedRole,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (_) {}

      // Persist password to local credentials store across email aliases
      try {
        const aliases = getEmailAliases(cleanEmail);
        aliases.forEach((a) => {
          localStorage.setItem(`mobin_pwd_${a}`, password);
        });
        const creds = JSON.parse(localStorage.getItem("mobin_user_credentials") || "{}");
        aliases.forEach((a) => {
          creds[a] = {
            email: a,
            password: password,
            role: selectedRole,
            full_name: combinedFullName,
            id: data?.user?.id || `usr-${Date.now()}`,
            created_at: new Date().toISOString(),
          };
        });
        localStorage.setItem("mobin_user_credentials", JSON.stringify(creds));
      } catch (_) {}

      try {
        const storedList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
        const roleLabel = selectedRole === "landlord" ? "Landlord" : "Student / Renter";
        const userObj = {
          id: data?.user?.id || `usr-${Date.now()}`,
          email: cleanEmail,
          password: password,
          name: combinedFullName || cleanEmail.split("@")[0],
          full_name: combinedFullName || cleanEmail.split("@")[0],
          role: roleLabel,
          status: "Pending Verification",
          phone: "",
          dateJoined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          created_at: new Date().toISOString(),
          source: "registration",
        };

        const existingIdx = storedList.findIndex((item) => {
          const itemEmail = (typeof item === "string" ? item : item?.email || "").trim().toLowerCase();
          const itemId = typeof item === "object" ? item?.id : null;
          return itemEmail === cleanEmail || (data?.user?.id && itemId === data.user.id);
        });

        if (existingIdx >= 0) {
          storedList[existingIdx] = {
            ...(typeof storedList[existingIdx] === "object" ? storedList[existingIdx] : {}),
            ...userObj,
          };
        } else {
          storedList.unshift(userObj);
        }
        localStorage.setItem("mobin_registered_users", JSON.stringify(storedList));
        window.dispatchEvent(new Event("mobin_users_updated"));
      } catch (_) {}

      const roleName = selectedRole === "landlord" ? "Landlord" : "Renter";
      const verifyOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedSignupOtp(verifyOtp);
      setEnteredSignupOtp("");
      setSignupVerifyError("");
      setSignupVerifySuccess("");
      setSignupPendingData({
        email: cleanEmail,
        password: password,
        role: selectedRole,
        roleName: roleName,
        fullName: combinedFullName,
        userObj: data?.user,
      });

      // Dispatch verification email via EmailJS directly to user's inbox
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_vr0gcbr";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_stpsf94";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "LBV7JYBqE6IsIz6R8";

      try {
        await emailjs.send(
          serviceId,
          templateId,
          {
            to_email: cleanEmail,
            email: cleanEmail,
            user_email: cleanEmail,
            recipient: cleanEmail,
            to_name: combinedFullName || cleanEmail,
            user_name: combinedFullName || cleanEmail,
            role: roleName,
            otp_code: verifyOtp,
            code: verifyOtp,
            message: `Account created for ${roleName}! Please check your email to verify and complete your registration. Your 6-digit verification code is: ${verifyOtp}`,
          },
          publicKey
        );
      } catch (emailErr) {
        console.warn("EmailJS signup dispatch error:", emailErr);
      }

      setShowSignupVerifyModal(true);
      setSuccessMessage(
        `Account created for ${roleName}! Please check your email (${cleanEmail}) to verify and complete your registration.`
      );
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  // HELPER TO FINALIZE REGISTRATION UPON VERIFICATION (VIA OTP OR LINK)
  const completeVerifiedRegistration = async (userObj = null) => {
    setSignupVerifyLoading(true);
    const cleanEmail = signupPendingData?.email || email.trim().toLowerCase();
    const userRole = signupPendingData?.role || "renter";
    const roleName = userRole === "landlord" ? "Landlord" : "Renter";
    const fullName = signupPendingData?.fullName || `${firstName.trim()} ${lastName.trim()}`.trim();

    let verifiedUser = userObj;
    if (!verifiedUser) {
      try {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: signupPendingData?.password || password,
        });
        if (signInData?.user) {
          verifiedUser = signInData.user;
        }
      } catch (_) {}
    }

    if (!verifiedUser) {
      verifiedUser = signupPendingData?.userObj || {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        user_metadata: {
          full_name: fullName,
          role: userRole,
        },
      };
    }

    // Persist verified profile in Supabase & Local Cache
    try {
      await supabase.from("profiles").upsert({
        id: verifiedUser.id,
        email: cleanEmail,
        full_name: fullName,
        role: userRole,
        updated_at: new Date().toISOString(),
      });
    } catch (_) {}

    const userPwd = signupPendingData?.password || password;
    if (userPwd) {
      try {
        const aliases = getEmailAliases(cleanEmail);
        aliases.forEach((a) => {
          localStorage.setItem(`mobin_pwd_${a}`, userPwd);
        });
        const creds = JSON.parse(localStorage.getItem("mobin_user_credentials") || "{}");
        aliases.forEach((a) => {
          creds[a] = {
            email: a,
            password: userPwd,
            role: userRole,
            full_name: fullName,
            id: verifiedUser?.id || `usr-${Date.now()}`,
            updated_at: new Date().toISOString(),
          };
        });
        localStorage.setItem("mobin_user_credentials", JSON.stringify(creds));
      } catch (_) {}
    }

    try {
      const storedList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
      const roleLabel = userRole === "landlord" ? "Landlord" : "Student / Renter";
      const verifiedRecord = {
        id: verifiedUser.id,
        email: cleanEmail,
        password: userPwd,
        name: fullName,
        full_name: fullName,
        role: roleLabel,
        status: "Active",
        phone: "",
        dateJoined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        updated_at: new Date().toISOString(),
        source: "verified_registration",
      };

      const existingIdx = storedList.findIndex((item) => {
        const itemEmail = (typeof item === "string" ? item : item?.email || "").trim().toLowerCase();
        const itemId = typeof item === "object" ? item?.id : null;
        return itemEmail === cleanEmail || (verifiedUser?.id && itemId === verifiedUser.id);
      });

      if (existingIdx >= 0) {
        storedList[existingIdx] = {
          ...(typeof storedList[existingIdx] === "object" ? storedList[existingIdx] : {}),
          ...verifiedRecord,
        };
      } else {
        storedList.unshift(verifiedRecord);
      }
      localStorage.setItem("mobin_registered_users", JSON.stringify(storedList));
      window.dispatchEvent(new Event("mobin_users_updated"));
    } catch (_) {}

    setSignupVerifySuccess(`Email verified for ${roleName}! Account created successfully.`);

    const finalSessionUser = {
      ...verifiedUser,
      email: cleanEmail,
      name: fullName,
      user_metadata: {
        ...verifiedUser.user_metadata,
        role: userRole,
        full_name: fullName,
      },
    };

    try {
      localStorage.setItem("mobin_current_session", JSON.stringify(finalSessionUser));
    } catch (_) {}

    // Present Terms & Conditions immediately after successful account creation
    setTimeout(() => {
      setShowSignupVerifyModal(false);
      setPendingTermsUser(finalSessionUser);
      setShowTermsModal(true);
    }, 600);
  };

  const handleAcceptTermsModal = (updatedUser) => {
    setShowTermsModal(false);
    setPendingTermsUser(null);
    if (onLoginSuccess) {
      onLoginSuccess(updatedUser);
    }
  };

  const handleDeclineTermsModal = () => {
    setShowTermsModal(false);
    setPendingTermsUser(null);
    try {
      localStorage.removeItem("mobin_current_session");
    } catch (_) {}
    resetFormFields();
    setMode("signin");
    setErrorMessage(
      "Terms & Conditions declined. You can sign in and accept them anytime to activate your account."
    );
  };

  // VERIFY SIGNUP OTP AND COMPLETE REGISTRATION
  const handleVerifySignupOtp = async (e) => {
    if (e) e.preventDefault();
    setSignupVerifyError("");
    setSignupVerifySuccess("");
    setSignupVerifyLoading(true);

    const cleanEmail = signupPendingData?.email || email.trim().toLowerCase();
    const token = enteredSignupOtp.trim();

    // 1. Try Supabase verifyOtp first (supports real 6-digit OTP code)
    try {
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token,
        type: "signup",
      });
      if (!verifyErr && verifyData?.user) {
        await completeVerifiedRegistration(verifyData.user);
        return;
      }
    } catch (_) {}

    // 2. Try type 'email'
    try {
      const { data: verifyData2, error: verifyErr2 } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token,
        type: "email",
      });
      if (!verifyErr2 && verifyData2?.user) {
        await completeVerifiedRegistration(verifyData2.user);
        return;
      }
    } catch (_) {}

    // 3. Fallback matching with local generated OTP if matched
    if (generatedSignupOtp && token === generatedSignupOtp.trim()) {
      await completeVerifiedRegistration();
      return;
    }

    // 4. Check if account is already confirmed (e.g. user clicked confirmation link in Gmail)
    try {
      const { data: signInData, error: signErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: signupPendingData?.password || password,
      });
      if (!signErr && signInData?.user) {
        await completeVerifiedRegistration(signInData.user);
        return;
      }
    } catch (_) {}

    setSignupVerifyError("Invalid verification code. Please check your 6-digit code and try again.");
    setSignupVerifyLoading(false);
  };

  // RESEND SIGNUP OTP & CONFIRMATION EMAIL
  const handleResendSignupOtp = async () => {
    if (!signupPendingData?.email) return;
    setSignupVerifyError("");
    setSignupVerifySuccess("");
    setSignupVerifyLoading(true);

    const cleanEmail = signupPendingData.email;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedSignupOtp(newCode);

    let sentViaSupabase = false;

    // 1. Resend real confirmation email via Supabase Auth
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      if (!resendErr) {
        sentViaSupabase = true;
      }
    } catch (_) {}

    // 2. Also try EmailJS as backup
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_vr0gcbr";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_stpsf94";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "LBV7JYBqE6IsIz6R8";
    const roleName = signupPendingData.role === "landlord" ? "Landlord" : "Renter";

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: cleanEmail,
          email: cleanEmail,
          user_email: cleanEmail,
          recipient: cleanEmail,
          to_name: signupPendingData.fullName || cleanEmail,
          user_name: signupPendingData.fullName || cleanEmail,
          role: roleName,
          otp_code: newCode,
          code: newCode,
          message: `Account created for ${roleName}! Please check your email to verify and complete your registration. Your verification code is: ${newCode}`,
        },
        publicKey
      );
    } catch (_) {}

    setSignupVerifySuccess(`Confirmation email resent to ${cleanEmail}. Please check your inbox or spam folder.`);
    setSignupVerifyLoading(false);
  };

  // Auto-detect when user confirms their email via the link sent to their Gmail
  useEffect(() => {
    if (!showSignupVerifyModal) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const pendingEmail = signupPendingData?.email?.toLowerCase().trim();
      const currentEmail = session?.user?.email?.toLowerCase().trim();

      const isConfirmed = !!(session?.user?.email_confirmed_at || session?.user?.confirmed_at || event === "SIGNED_IN");
      if (session?.user && (!pendingEmail || pendingEmail === currentEmail) && isConfirmed) {
        await completeVerifiedRegistration(session.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [showSignupVerifyModal, signupPendingData]);

  const handleGoogleBtnClick = async () => {
    setErrorMessage("");
    if (mode === "signup") {
      // PROMPT ROLE MODAL FIRST FOR GOOGLE SIGN UP!
      setIsGoogleSignUp(true);
      setShowRoleModal(true);
    } else {
      // DIRECT SIGN IN
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } catch (err) {
        setErrorMessage(err.message || "Google sign-in error.");
      }
    }
  };

  // SEND 6-DIGIT OTP VIA EMAILJS (service_vr0gcbr, template_stpsf94, LBV7JYBqE6IsIz6R8)
  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address in the field above to reset your password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setOtpError("");
    setOtpSuccess("");

    // Generate 6-digit OTP code for password recovery
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_vr0gcbr";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_stpsf94";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "LBV7JYBqE6IsIz6R8";

      const templateParams = {
        to_email: cleanEmail,
        email: cleanEmail,
        user_email: cleanEmail,
        recipient: cleanEmail,
        to_name: cleanEmail.split("@")[0],
        user_name: cleanEmail.split("@")[0],
        otp_code: otpCode,
        code: otpCode,
        message: `Your Mob'in password reset verification code is: ${otpCode}. Please enter this 6-digit code to create your new password.`,
      };

      const emailResponse = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log("EmailJS send success:", emailResponse);

      setShowOtpModal(true);
      setSuccessMessage(`A 6-digit verification code has been sent to ${cleanEmail}.`);

      // Also trigger Supabase built-in reset email as background sync
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}`,
        });
      } catch (_) {}
    } catch (err) {
      console.error("EmailJS sending error details:", err);
      const errorDetail = err?.text || err?.message || JSON.stringify(err);

      // Attempt Supabase built-in reset email as backup
      let supabaseSent = false;
      try {
        const { error: sbErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}`,
        });
        if (!sbErr) {
          supabaseSent = true;
          setShowOtpModal(true);
          setSuccessMessage(`A password reset verification link has been sent to ${cleanEmail}.`);
        }
      } catch (_) {}

      if (!supabaseSent) {
        // Still allow OTP modal with local generated code if offline/rate-limited
        setShowOtpModal(true);
        setSuccessMessage(`Verification code generated for ${cleanEmail}. Check your inbox or enter code.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP AND SET NEW PASSWORD
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError("Invalid verification code. Please enter the 6-digit code sent to your email.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setOtpError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setOtpError("Passwords do not match. Please ensure both fields match.");
      return;
    }

    setOtpLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Save new password to reset store & local credentials
      try {
        localStorage.setItem(`mobin_pwd_${cleanEmail}`, newPassword);
        const creds = JSON.parse(localStorage.getItem("mobin_user_credentials") || "{}");
        if (creds[cleanEmail]) {
          creds[cleanEmail].password = newPassword;
          creds[cleanEmail].updated_at = new Date().toISOString();
        } else {
          creds[cleanEmail] = {
            email: cleanEmail,
            password: newPassword,
            updated_at: new Date().toISOString(),
          };
        }
        localStorage.setItem("mobin_user_credentials", JSON.stringify(creds));

        const storedList = JSON.parse(localStorage.getItem("mobin_registered_users") || "[]");
        const updatedList = storedList.map((item) => {
          const itemEmail = (typeof item === "string" ? item : item?.email || "").toLowerCase().trim();
          if (itemEmail === cleanEmail && typeof item === "object") {
            return { ...item, password: newPassword };
          }
          return item;
        });
        localStorage.setItem("mobin_registered_users", JSON.stringify(updatedList));
      } catch (_) {}

      // 2. Try Supabase direct password update
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (_) {}

      setOtpSuccess("Password updated successfully!");
      setTimeout(() => {
        setShowOtpModal(false);
        setPassword(newPassword);
        setSuccessMessage("Your password has been reset! You can now sign in with your new password.");
        setMode("signin");
        setEnteredOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
      }, 1000);
    } catch (err) {
      setOtpError(err.message || "Failed to update password.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      {/* CENTER AUTH MODAL OVERLAY */}
      <div
        className={`login-modal-overlay ${isClosing ? "fade-out" : "fade-in"}`}
        onClick={handleClose}
      >
        <div
          className={`login-modal-card ${isClosing ? "scale-out" : "scale-in"}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          {/* TOP RIGHT CLOSE BUTTON */}
          <button
            type="button"
            className="login-modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="login-form-container">
            <div className="login-logo-wrap">
              <img src={mobinLogo} alt="Mob'in" className="login-brand-logo" />
            </div>
            <h1 id="login-modal-title" className="login-heading">
              {mode === "signin" ? "Welcome Back!" : "Create an Account"}
            </h1>
            <p className="login-subheading">
              {mode === "signin"
                ? "Log in to continue your Mob'in journey."
                : "Sign up to start your Mob'in journey."}
            </p>

          {/* TAB SWITCHER */}
          <div className="login-tabs-capsule">
            <button
              type="button"
              className={`login-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => handleSwitchMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`login-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => handleSwitchMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* FEEDBACK MESSAGES */}
          {errorMessage && (
            <div className="login-alert error">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="login-alert success">{successMessage}</div>
          )}

          {/* AUTH FORM */}
          <form onSubmit={handleAuthSubmit} className="login-form" autoComplete="off">
            {mode === "signup" && (
              <div className="login-row-2col">
                <div className="login-field-group">
                  <label>
                    First Name
                    {!firstName.trim() && (
                      <span className="input-required-tag">*</span>
                    )}
                  </label>
                  <div
                    className={`login-input-wrapper ${
                      !firstName.trim() && errorMessage ? "input-has-error" : ""
                    }`}
                  >
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="login-field-group">
                  <label>
                    Last Name
                    {!lastName.trim() && (
                      <span className="input-required-tag">*</span>
                    )}
                  </label>
                  <div
                    className={`login-input-wrapper ${
                      !lastName.trim() && errorMessage ? "input-has-error" : ""
                    }`}
                  >
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="login-field-group">
              <label>
                Email
                {mode === "signup" && !email.trim() && (
                  <span className="input-required-tag">*</span>
                )}
              </label>
              <div
                className={`login-input-wrapper ${
                  mode === "signup" && !email.trim() && errorMessage
                    ? "input-has-error"
                    : ""
                }`}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
                <IconMail />
              </div>
            </div>

            <div className="login-field-group">
              <label>
                Password
                {mode === "signup" && !password && (
                  <span className="input-required-tag">*</span>
                )}
              </label>
              <div
                className={`login-input-wrapper ${
                  mode === "signup" && !password && errorMessage
                    ? "input-has-error"
                    : ""
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    if (!password) setPasswordFocused(false);
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <IconEye visible={showPassword} />
                </button>
              </div>

              {mode === "signup" && passwordFocused && (
                <div className="mt-2.5">
                  <PasswordStrength value={password} />
                </div>
              )}
            </div>

            {mode === "signup" && (
              <div className="login-field-group">
                <label>
                  Confirm Password
                  {!confirmPassword && (
                    <span className="input-required-tag">*</span>
                  )}
                </label>
                <div
                  className={`login-input-wrapper ${
                    !confirmPassword && errorMessage ? "input-has-error" : ""
                  }`}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    <IconEye visible={showConfirmPassword} />
                  </button>
                </div>
              </div>
            )}

            {mode === "signin" && (
              <div className="login-options-row">
                <label className="remember-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading
                ? mode === "signin"
                  ? "Logging in..."
                  : "Creating account..."
                : mode === "signin"
                ? "Login"
                : "Sign Up"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="login-divider">
            <span className="divider-line"></span>
            <span className="divider-text">OR</span>
            <span className="divider-line"></span>
          </div>

          {/* GOOGLE SIGN IN */}
          <button
            type="button"
            className="google-signin-btn"
            onClick={handleGoogleBtnClick}
          >
            <IconGoogle />
            <span>
              {mode === "signin" ? "Sign In with Google" : "Sign Up with Google"}
            </span>
          </button>
        </div>
      </div>
    </div>

      {/* =====================================================
          ROLE SELECTION POPUP MODAL (STEP 2 OF SIGNUP)
      ===================================================== */}
      {showRoleModal && (
        <div className="role-modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="role-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="role-modal-close-icon"
              onClick={() => setShowRoleModal(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="role-modal-header-block">
              <span className="role-step-pill">ACCOUNT TYPE</span>
              <h2 className="role-modal-headline">Choose Your Role</h2>
              <p className="role-modal-tagline">
                Welcome to Mob'in, <strong>{firstName || "there"}</strong>! Select how you plan to use the platform.
              </p>
            </div>

            <div className="role-cards-selection-row">
              {/* LANDLORD OPTION */}
              <div
                className="role-option-card landlord-theme"
                onClick={() => handleRoleSignUp("landlord")}
              >
                <div className="role-card-icon-badge">
                  <Building2 size={32} />
                </div>
                <span className="role-intent-badge">Property Owner</span>
                <h3 className="role-card-title">Landlord</h3>
                <p className="role-card-description">
                  List and advertise dormitories, boarding houses, and apartments. Manage bookings and direct renter inquiries.
                </p>
                <button
                  type="button"
                  className="role-confirm-btn landlord"
                  disabled={loading}
                >
                  Sign Up as Landlord →
                </button>
              </div>

              {/* RENTER OPTION */}
              <div
                className="role-option-card renter-theme"
                onClick={() => handleRoleSignUp("renter")}
              >
                <div className="role-card-icon-badge">
                  <UserCircle size={32} />
                </div>
                <span className="role-intent-badge">Student / Worker</span>
                <h3 className="role-card-title">Renter / Rental</h3>
                <p className="role-card-description">
                  Explore verified accommodations, compare prices and amenities, save favorite properties, and message landlords.
                </p>
                <button
                  type="button"
                  className="role-confirm-btn renter"
                  disabled={loading}
                >
                  Sign Up as Renter →
                </button>
              </div>
            </div>

            <div className="role-modal-bottom-bar">
              <button
                type="button"
                className="role-back-link"
                onClick={() => setShowRoleModal(false)}
              >
                ← Back to edit credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EMAILJS OTP PASSWORD RESET MODAL
      ===================================================== */}
      {showOtpModal && (
        <div className="role-modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="role-modal-container otp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="role-modal-close-icon"
              onClick={() => setShowOtpModal(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="role-modal-header-block">
              <span className="role-step-pill">PASSWORD RECOVERY</span>
              <h2 className="role-modal-headline">Enter Verification Code</h2>
              <p className="role-modal-tagline">
                We sent a 6-digit code to <strong>{email}</strong>. Enter the code and your new password below.
              </p>
            </div>

            {otpError && <div className="login-alert error mb-4">{otpError}</div>}
            {otpSuccess && <div className="login-alert success mb-4">{otpSuccess}</div>}

            <form onSubmit={handleVerifyOtpAndReset} className="otp-reset-form">
              {/* 6-DIGIT OTP CODE INPUT */}
              <div className="login-field-group">
                <label>6-Digit Verification Code</label>
                <div className="login-input-wrapper">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    className="otp-code-input"
                    autoFocus
                  />
                  <KeyRound className="login-input-icon" />
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="login-field-group">
                <label>New Password</label>
                <div className="login-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Enter new password (min. 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <IconEye visible={showNewPassword} />
                  </button>
                </div>
                <div className="mt-2.5">
                  <PasswordStrength value={newPassword} />
                </div>
              </div>

              {/* CONFIRM NEW PASSWORD */}
              <div className="login-field-group">
                <label>Confirm New Password</label>
                <div className="login-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading || enteredOtp.length < 6}
                className="login-submit-btn"
                style={{ marginTop: "12px" }}
              >
                {otpLoading ? "Updating Password..." : "Reset Password & Continue"}
              </button>

              <div className="otp-resend-row">
                <span>Didn't receive the code?</span>{" "}
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EMAILJS SIGNUP EMAIL VERIFICATION MODAL
      ===================================================== */}
      {showSignupVerifyModal && (
        <div className="role-modal-overlay" onClick={() => setShowSignupVerifyModal(false)}>
          <div className="role-modal-container otp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="role-modal-close-icon"
              onClick={() => setShowSignupVerifyModal(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="role-modal-header-block">
              <span className="role-step-pill">EMAIL VERIFICATION</span>
              <h2 className="role-modal-headline">Verify Your Registration</h2>
              <p className="role-modal-tagline">
                Account created for <strong>{signupPendingData?.roleName || "User"}</strong>! We sent a 6-digit verification code to <strong>{signupPendingData?.email || email}</strong>.
                Please enter the code below to complete your registration.
              </p>
            </div>

            {signupVerifyError && <div className="login-alert error mb-4">{signupVerifyError}</div>}
            {signupVerifySuccess && <div className="login-alert success mb-4">{signupVerifySuccess}</div>}

            <form onSubmit={handleVerifySignupOtp} className="otp-reset-form">
              <div className="login-field-group">
                <label>6-Digit Verification Code</label>
                <div className="login-input-wrapper">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={enteredSignupOtp}
                    onChange={(e) => setEnteredSignupOtp(e.target.value.replace(/\D/g, ""))}
                    className="otp-code-input"
                    autoFocus
                  />
                  <KeyRound className="login-input-icon" />
                </div>
              </div>

              <button
                type="submit"
                disabled={signupVerifyLoading || enteredSignupOtp.length < 6}
                className="login-submit-btn"
                style={{ marginTop: "14px" }}
              >
                {signupVerifyLoading ? "Verifying..." : "Verify Code & Complete Registration →"}
              </button>

              <div className="otp-resend-row" style={{ marginTop: "16px" }}>
                <span>Didn't receive the email?</span>{" "}
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleResendSignupOtp}
                  disabled={signupVerifyLoading}
                >
                  Resend Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          TERMS & CONDITIONS MODAL (AFTER SUCCESSFUL ACCOUNT CREATION)
      ===================================================== */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        user={pendingTermsUser}
        onAccept={handleAcceptTermsModal}
        onDecline={handleDeclineTermsModal}
      />
    </>
  );
}
