import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FolderOpen, ArrowLeft, Eye, ShieldCheck, Download, Search, Edit, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { memberService } from '../services/memberService';
import { publicService } from '../services/publicService';
import type { MemberProfileResponse, FamilyMemberResponse, DirectorySurnameGroup, MemberAnnouncement } from '../services/memberService';
import type { AnnualReportResponse } from '../services/publicService';
import './MemberPortal.css';

interface FamilyMember {
  id?: number;
  name: string;
  relation: string;
  age: number;
  occupation: string;
  education: string;
}

interface FamilyHead {
  id: string;
  name: string;
  surname?: string;
  city: string;
  membersCount: number;
  spouse: string;
  village: string;
  contact: string;
  email: string;
  occupation: string;
  address: string;
  members: FamilyMember[];
}

export const MemberPortal: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [portalTab, setPortalTab] = useState<'home' | 'directory' | 'reports'>('home');
  
  // User Profile and Family state from backend APIs
  const [profileData, setProfileData] = useState<MemberProfileResponse | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberResponse[]>([]);
  const [directoryGroups, setDirectoryGroups] = useState<DirectorySurnameGroup[]>([]);
  const [memberAnnouncements, setMemberAnnouncements] = useState<MemberAnnouncement[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const [annualReports, setAnnualReports] = useState<AnnualReportResponse[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);


  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    surname: 'General',
    spouse: '',
    village: '',
    city: 'Ahmedabad',
    contact: '',
    email: '',
    occupation: 'Business / Professional',
    address: ''
  });
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  const fetchPortalData = async () => {
    if (!isAuthenticated) return;
    setPortalLoading(true);
    setPortalError(null);
    try {
      const [profRes, famRes, dirRes, annRes] = await Promise.all([
        memberService.getProfile(),
        memberService.getFamilyMembers(),
        memberService.getDirectory().catch(() => []),
        memberService.getAnnouncements().catch(() => [])
      ]);
      setProfileData(profRes);
      setFamilyMembers(famRes);
      setDirectoryGroups(dirRes || []);
      setMemberAnnouncements(annRes || []);
      
      const spouseMember = famRes.find(m => m.relation.toLowerCase() === 'spouse');
      setEditForm({
        name: profRes.full_name,
        surname: profRes.surname || 'General',
        spouse: spouseMember ? spouseMember.name : '',
        village: profRes.village,
        city: profRes.city || 'Ahmedabad',
        contact: profRes.mobile,
        email: profRes.email || '',
        occupation: profRes.occupation || 'Business / Professional',
        address: profRes.address
      });
    } catch (err: any) {
      console.error("Failed to fetch portal data:", err);
      const detail = err.response?.data?.detail || "Could not load profile data from server.";
      setPortalError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchPortalData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchAnnualReports = async () => {
    setReportsLoading(true);
    try {
      const res = await publicService.getAnnualReports();
      setAnnualReports(res);
    } catch (err) {
      console.error("Failed to fetch annual reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (portalTab === 'reports') {
      fetchAnnualReports();
    }
  }, [portalTab]);


  const spouseMember = familyMembers.find(m => m.relation.toLowerCase() === 'spouse');
  const profile: FamilyHead = profileData ? {
    id: `SSPV-${profileData.id}`,
    name: profileData.full_name,
    surname: profileData.surname || 'General',
    city: profileData.city || editForm.city || 'Ahmedabad',
    membersCount: familyMembers.length,
    spouse: spouseMember ? spouseMember.name : (editForm.spouse || 'N/A'),
    village: profileData.village,
    contact: profileData.mobile,
    email: profileData.email || '',
    occupation: profileData.occupation || editForm.occupation || 'Business / Professional',
    address: profileData.address,
    members: familyMembers.map(m => ({
      id: m.id,
      name: m.name,
      relation: m.relation,
      age: m.age,
      occupation: m.occupation || '',
      education: m.education || ''
    }))
  } : {
    id: 'SSPV-0000',
    name: 'Loading Member...',
    surname: 'General',
    city: 'Ahmedabad',
    membersCount: 0,
    spouse: 'Loading...',
    village: 'Loading...',
    contact: 'Loading...',
    email: 'Loading...',
    occupation: 'Loading...',
    address: 'Loading...',
    members: []
  };

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redesigned signup form states and tab state
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupTerms, setSignupTerms] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  // Forgot Password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Family Member Management State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [memberForm, setMemberForm] = useState<FamilyMember>({
    name: '',
    relation: 'Son',
    age: 18,
    occupation: '',
    education: ''
  });

  // Directory Drill-Down State
  const [directoryLevel, setDirectoryLevel] = useState<'surnames' | 'heads' | 'details'>('surnames');
  const [selectedSurname, setSelectedSurname] = useState<string | null>(null);
  const [selectedHeadId, setSelectedHeadId] = useState<string | null>(null);
  
  // Search query for directory
  const [searchQuery, setSearchQuery] = useState('');

  // Live Surnames list derived from directory API
  const surnamesList = directoryGroups.map(group => ({
    name: group.surname,
    count: group.count
  }));

  const getFamilyHeadsForSurname = (surnameName: string): FamilyHead[] => {
    const group = directoryGroups.find(g => g.surname === surnameName);
    if (!group) return [];
    return group.heads as FamilyHead[];
  };

  const handleSurnameClick = (surname: string) => {
    setSelectedSurname(surname);
    setDirectoryLevel('heads');
  };

  const handleHeadClick = (id: string) => {
    setSelectedHeadId(id);
    setDirectoryLevel('details');
  };

  const handleBackToSurnames = () => {
    setSelectedSurname(null);
    setDirectoryLevel('surnames');
  };

  const handleBackToHeads = () => {
    setSelectedHeadId(null);
    setDirectoryLevel('heads');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter your Registered Mobile Number and Password.');
      return;
    }
    setIsSubmitting(true);
    setLoginError('');
    try {
      await login({ mobile: email, password });
      setEditForm({
        name: profile.name,
        surname: profile.surname || 'General',
        spouse: profile.spouse,
        village: profile.village,
        city: profile.city,
        contact: profile.contact,
        email: profile.email,
        occupation: profile.occupation,
        address: profile.address
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Invalid credentials. Please verify your Mobile Number and Password.';
      setLoginError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    if (!signupName || !signupMobile || !signupPassword || !signupConfirmPassword) {
      setSignupError("Please fill in all required fields.");
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters long.");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (!signupTerms) {
      setSignupError("Please accept the terms and conditions to proceed.");
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.register({
        full_name: signupName,
        mobile: signupMobile,
        password: signupPassword,
        confirm_password: signupConfirmPassword,
        village: "Ahmedabad"
      });
      setSignupSuccess(`Registration request submitted successfully! Your account is pending review and will become active once approved by an administrator.`);
      setSignupName('');
      setSignupMobile('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupTerms(false);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to submit registration request.";
      setSignupError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password modal handlers
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotMobile || forgotMobile.length < 10) {
      setForgotError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.requestForgotPasswordOtp(forgotMobile);
      setForgotStep('verify');
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Could not send OTP. Please try again.";
      setForgotError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length !== 6) {
      setForgotError("Please enter the 6-digit OTP received via SMS.");
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await authService.verifyForgotPasswordOtp(forgotMobile, forgotOtp);
      setForgotResetToken(res.reset_token);
      setForgotStep('reset');
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Invalid or expired OTP.";
      setForgotError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      setForgotError("New password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("New Password and Confirm Password do not match.");
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.resetForgotPassword(
        forgotMobile,
        forgotResetToken,
        forgotNewPassword,
        forgotConfirmPassword
      );
      setForgotStep('success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Could not reset password. Please try again.";
      setForgotError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setForgotLoading(false);
    }
  };


  // Filtered Heads
  const activeHeads = selectedSurname ? getFamilyHeadsForSurname(selectedSurname) : [];
  const filteredHeads = activeHeads.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selected Detail
  const selectedFamily = activeHeads.find(h => h.id === selectedHeadId);

  // NOT LOGGED IN VIEW: Render Redesigned Premium Split Layout Login Portal
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: '#d97706', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="login-portal-section" id="login-form-view">
        {/* Full-bleed Background */}
        <div className="fixed-bg-container">
          <div className="fixed-bg-image"></div>
          <div className="fixed-bg-overlay"></div>
        </div>

        <main className="login-main-layout">
          <div className="login-inner-container">
            {/* Left Panel: Welcome Text (Heritage Visual Showcase) */}
            <motion.div 
              className="login-welcome-panel"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="login-welcome-brand">
                <span className="material-symbols-outlined login-welcome-brand-icon" style={{ fontVariationSettings: "'FILL' 1" }}>castle</span>
                <h2 className="login-welcome-brand-title">SSPV Mandala</h2>
              </div>
              <h1 className="login-welcome-headline">Preserving our <br /><span>shared heritage</span>.</h1>
              <p className="login-welcome-desc">
                A warm welcome back to your roots. Join our community in Gujarat to celebrate legacy, connection, and shared progress.
              </p>
              <div className="login-welcome-footer-decoration">
                <div className="login-welcome-footer-decoration-line"></div>
                <p className="login-welcome-footer-decoration-text">Ahmedabad Community Portal</p>
              </div>
            </motion.div>

            {/* Right Panel: Floating Login Card */}
            <motion.div 
              className="login-card-panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {/* Mobile Brand Header */}
              <div className="login-mobile-header">
                <span className="material-symbols-outlined login-mobile-header-icon" style={{ fontVariationSettings: "'FILL' 1" }}>castle</span>
                <h2 className="login-mobile-header-title">SSPV Mandala</h2>
              </div>

              {/* Sliding Tab Toggle */}
              <div className="login-tab-toggle-container">
                <div className={`login-tab-indicator ${authTab === 'signup' ? 'signup-active' : ''}`}></div>
                <button 
                  className={`login-tab-btn ${authTab === 'login' ? 'active' : 'inactive'}`} 
                  onClick={() => setAuthTab('login')}
                  id="login-tab-button"
                  type="button"
                >
                  Login
                </button>
                <button 
                  className={`login-tab-btn ${authTab === 'signup' ? 'active' : 'inactive'}`} 
                  onClick={() => setAuthTab('signup')}
                  id="signup-tab-button"
                  type="button"
                >
                  Create Account
                </button>
              </div>

              <div className="login-form-container-relative">
                {/* Login Form */}
                <div className={`login-form-sliding ${authTab === 'login' ? 'visible' : 'hidden-left'}`}>
                  <div className="login-form-title-block">
                    <h3>Welcome Back</h3>
                    <p>Please enter your details to access the portal.</p>
                  </div>

                  {loginError && <div className="profile-success-msg" style={{ backgroundColor: '#fce8e6', color: '#b7221b', border: '1px solid rgba(183, 34, 27, 0.2)', marginBottom: '20px' }}>{loginError}</div>}

                  <form onSubmit={handleLoginSubmit} className="login-fields-form">
                    <div className="login-form-group">
                      <label className="login-form-label" htmlFor="login-email">Mobile Number</label>
                      <input 
                        id="login-email"
                        className="login-form-input"
                        type="text" 
                        placeholder="98765 43210"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="login-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label className="login-form-label" htmlFor="login-password">Password</label>
                        <button 
                          type="button" 
                          className="login-forgot-link"
                          onClick={() => {
                            setForgotError('');
                            setForgotStep('request');
                            setShowForgotPasswordModal(true);
                          }}
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="login-password-input-container">
                        <input 
                          id="login-password"
                          className="login-form-input"
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button"
                          className="login-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="login-form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="login-checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)} 
                        />
                        <span>Remember me on this device</span>
                      </label>
                    </div>

                    <button type="submit" className="login-submit-button" id="login-submit-btn" disabled={isSubmitting}>
                      <span>{isSubmitting ? 'Authenticating...' : 'Access Portal'}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </button>

                    <div className="login-demo-card">
                      <span>
                        <strong>Demo Credentials:</strong><br />
                        Mobile Number: <code>9999999999</code> / Password: <code>987654</code>
                      </span>
                    </div>
                  </form>
                </div>

                {/* Signup Form */}
                <div className={`login-form-sliding ${authTab === 'signup' ? 'visible' : 'hidden-right'}`}>
                  <div className="login-form-title-block">
                    <h3>New Membership</h3>
                    <p>Join the Ahmedabad Community Portal.</p>
                  </div>

                  <div className="login-signup-banner">
                    <span className="material-symbols-outlined login-signup-banner-icon">verified</span>
                    <span className="login-signup-banner-text">Community Verification Required</span>
                  </div>

                  {signupError && (
                    <div className="profile-success-msg" style={{ backgroundColor: '#fce8e6', color: '#b7221b', border: '1px solid rgba(183, 34, 27, 0.2)', marginBottom: '16px' }}>
                      {signupError}
                    </div>
                  )}

                  {signupSuccess && (
                    <div className="profile-success-msg" style={{ backgroundColor: '#e6f4ea', color: '#137333', border: '1px solid rgba(19, 115, 51, 0.2)', marginBottom: '16px' }}>
                      {signupSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSignupSubmit} className="login-fields-form">
                    <div className="login-form-group">
                      <label className="login-form-label" htmlFor="signup-name">Family Head Name</label>
                      <input 
                        id="signup-name"
                        className="login-form-input"
                        type="text" 
                        placeholder="As per records"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="login-form-group">
                      <label className="login-form-label" htmlFor="signup-mobile">Mobile Number</label>
                      <div className="login-tel-input-wrapper">
                        <span className="login-tel-prefix">+91</span>
                        <input 
                          id="signup-mobile"
                          className="login-form-input"
                          type="tel" 
                          placeholder="98765 43210"
                          value={signupMobile}
                          onChange={(e) => setSignupMobile(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label className="login-form-label" htmlFor="signup-password">Password</label>
                      <div className="login-password-input-container">
                        <input 
                          id="signup-password"
                          className="login-form-input"
                          type={signupShowPassword ? 'text' : 'password'} 
                          placeholder="Min 6 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button"
                          className="login-password-toggle"
                          onClick={() => setSignupShowPassword(!signupShowPassword)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {signupShowPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="login-form-group">
                      <label className="login-form-label" htmlFor="signup-confirm-password">Confirm Password</label>
                      <input 
                        id="signup-confirm-password"
                        className="login-form-input"
                        type={signupShowPassword ? 'text' : 'password'} 
                        placeholder="Re-enter password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="login-form-group">
                      <label className="login-checkbox-label" htmlFor="terms-checkbox">
                        <input 
                          id="terms-checkbox"
                          type="checkbox" 
                          checked={signupTerms}
                          onChange={(e) => setSignupTerms(e.target.checked)}
                          required
                        />
                        <span>
                          I confirm membership in the SSPV Ahmedabad Mandala and agree to the{' '}
                          <a href="#" onClick={(e) => { e.preventDefault(); alert("Privacy Policy Details: Your family data is encrypted and visible only to verified members."); }}>
                            Privacy Policy
                          </a>.
                        </span>
                      </label>
                    </div>

                    <button type="submit" className="login-submit-button" id="signup-submit-btn" disabled={isSubmitting}>
                      <span>{isSubmitting ? 'Submitting...' : 'Request Registration'}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>how_to_reg</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="login-footer-links">
                <div className="login-footer-links-row">
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Privacy Policy Details: Your family data is encrypted and visible only to verified members."); }}>Privacy</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Terms of Use: This portal is strictly for SSPV Mandala members."); }}>Terms of Use</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Contact: Contact IT desk at info@sorathiyaprajapati.org."); }}>Contact</a>
                </div>
                <span>© 2024 SSPV Mandala</span>
              </div>
            </motion.div>
          </div>

          {/* Forgot Password Modal */}
          {showForgotPasswordModal && (
            <div className="modal-overlay" style={{ zIndex: 9999 }}>
              <div className="modal-card" style={{ maxWidth: '440px', width: '100%' }}>
                <div className="modal-header">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Password Reset</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#5f6368' }}>Secure SMS verification via MSG91</p>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setShowForgotPasswordModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body" style={{ padding: '24px' }}>
                  {forgotError && (
                    <div className="profile-success-msg" style={{ backgroundColor: '#fce8e6', color: '#b7221b', border: '1px solid rgba(183, 34, 27, 0.2)', marginBottom: '16px' }}>
                      {forgotError}
                    </div>
                  )}

                  {forgotStep === 'request' && (
                    <form onSubmit={handleForgotRequestOtp}>
                      <p style={{ fontSize: '0.925rem', color: '#3c4043', marginBottom: '16px' }}>
                        Enter your registered 10-digit mobile number. We will send a 6-digit verification code to your phone.
                      </p>
                      <div className="login-form-group">
                        <label className="login-form-label" htmlFor="forgot-mobile">Mobile Number</label>
                        <div className="login-tel-input-wrapper">
                          <span className="login-tel-prefix">+91</span>
                          <input
                            id="forgot-mobile"
                            className="login-form-input"
                            type="tel"
                            placeholder="98765 43210"
                            value={forgotMobile}
                            onChange={(e) => setForgotMobile(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setShowForgotPasswordModal(false)}
                          style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #dadce0', background: '#fff', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="login-submit-button"
                          disabled={forgotLoading}
                          style={{ width: 'auto', padding: '10px 24px' }}
                        >
                          <span>{forgotLoading ? 'Sending...' : 'Send OTP'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {forgotStep === 'verify' && (
                    <form onSubmit={handleForgotVerifyOtp}>
                      <p style={{ fontSize: '0.925rem', color: '#3c4043', marginBottom: '16px' }}>
                        Enter the 6-digit OTP sent to <strong>+91 {forgotMobile}</strong>. Code expires in 5 minutes.
                      </p>
                      <div className="login-form-group">
                        <label className="login-form-label" htmlFor="forgot-otp">6-Digit OTP</label>
                        <input
                          id="forgot-otp"
                          className="login-form-input"
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          required
                          style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                        <button
                          type="button"
                          onClick={handleForgotRequestOtp}
                          style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Resend OTP
                        </button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            type="submit"
                            className="login-submit-button"
                            disabled={forgotLoading}
                            style={{ width: 'auto', padding: '10px 24px' }}
                          >
                            <span>{forgotLoading ? 'Verifying...' : 'Verify Code'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {forgotStep === 'reset' && (
                    <form onSubmit={handleForgotResetPassword}>
                      <p style={{ fontSize: '0.925rem', color: '#3c4043', marginBottom: '16px' }}>
                        Set a new password for your account.
                      </p>
                      <div className="login-form-group">
                        <label className="login-form-label" htmlFor="forgot-new-password">New Password</label>
                        <input
                          id="forgot-new-password"
                          className="login-form-input"
                          type="password"
                          placeholder="Min 6 characters"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="login-form-group">
                        <label className="login-form-label" htmlFor="forgot-confirm-password">Confirm New Password</label>
                        <input
                          id="forgot-confirm-password"
                          className="login-form-input"
                          type="password"
                          placeholder="Re-enter new password"
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <button
                          type="submit"
                          className="login-submit-button"
                          disabled={forgotLoading}
                          style={{ width: 'auto', padding: '10px 24px' }}
                        >
                          <span>{forgotLoading ? 'Resetting...' : 'Save New Password'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {forgotStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#137333', marginBottom: '12px' }}>check_circle</span>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#202124' }}>Password Reset Successfully</h4>
                      <p style={{ fontSize: '0.9rem', color: '#5f6368', marginBottom: '24px' }}>
                        You can now log in using your registered mobile number and your new password.
                      </p>
                      <button
                        type="button"
                        className="login-submit-button"
                        onClick={() => {
                          setShowForgotPasswordModal(false);
                          setForgotStep('request');
                        }}
                      >
                        <span>Return to Login</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // LOGGED IN VIEW: Render Directory, Dashboard & Reports
  return (
    <div className="portal-container" id="member-portal-wrapper">
      <div className="container">
        <div className="grid grid-12 portal-layout">
          {/* Sidebar Menu */}
          <aside className="portal-sidebar col-span-3">
            <div className="sidebar-profile">
              <div className="sidebar-avatar">{profile.name.split(' ').map(n => n[0]).join('')}</div>
              <div className="sidebar-info">
                <h3>{profile.name}</h3>
                <p>{profile.id} • Family Head</p>
              </div>
            </div>
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-nav-btn ${portalTab === 'home' ? 'active' : ''}`}
                onClick={() => setPortalTab('home')}
                id="portal-tab-home"
              >
                <FolderOpen size={18} /> Home (Profile)
              </button>
              <button 
                className={`sidebar-nav-btn ${portalTab === 'directory' ? 'active' : ''}`}
                onClick={() => { setPortalTab('directory'); handleBackToSurnames(); }}
                id="portal-tab-directory"
              >
                <Users size={18} /> Digital Directory
              </button>
              <button 
                className={`sidebar-nav-btn ${portalTab === 'reports' ? 'active' : ''}`}
                onClick={() => setPortalTab('reports')}
                id="portal-tab-reports"
              >
                <BookOpen size={18} /> Annual Reports
              </button>
            </nav>
            <div className="portal-security-note">
              <ShieldCheck size={16} />
              <span>Private Member Encrypted Portal</span>
            </div>
          </aside>

          {/* Main Panel Content */}
          <main className="portal-main-panel col-span-9" id="portal-main-panel">
            {/* TAB: HOME & PROFILE */}
            {portalTab === 'home' && (
              <div className="dashboard-view animate-fade">
                {portalLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading member profile and family tree...</span>
                  </div>
                ) : portalError ? (
                  <div className="profile-success-msg" style={{ backgroundColor: '#fce8e6', color: '#b7221b', border: '1px solid rgba(183, 34, 27, 0.2)', padding: '16px', borderRadius: '8px', margin: '20px 0' }}>
                    <strong>Error loading portal data:</strong> {portalError}
                    <button className="btn btn-secondary" onClick={fetchPortalData} style={{ marginTop: '12px', display: 'block' }}>Retry</button>
                  </div>
                ) : (
                  <>
                    <header className="panel-header">
                      <h1>Welcome back, {profile.name.split(' ')[0]}</h1>
                      <p>Manage your family profile, edit credentials, register family members, and download logs.</p>
                    </header>

                {showUpdateSuccess && (
                  <div className="profile-success-msg">
                    ✓ Profile updated successfully! Changes reflect immediately in the Directory.
                  </div>
                )}

                <div className="grid grid-2 portal-home-grid" style={{ gap: '30px', marginBottom: '30px' }}>
                  {/* Left Column: Profile Card */}
                  <div className="profile-details-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--color-text-dark)' }}>My Profile Details</h3>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          if (isEditingProfile) {
                            setIsEditingProfile(false);
                          } else {
                            setEditForm({
                              name: profile.name,
                              surname: profile.surname || 'General',
                              spouse: profile.spouse,
                              village: profile.village,
                              city: profile.city,
                              contact: profile.contact,
                              email: profile.email,
                              occupation: profile.occupation,
                              address: profile.address
                            });
                            setIsEditingProfile(true);
                            setShowUpdateSuccess(false);
                          }
                        }}
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit size={14} /> {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const cleanMobile = editForm.contact.replace(/\D/g, '');
                        if (!/^\d{10}$/.test(cleanMobile)) {
                          alert('Please enter a valid 10-digit mobile number without spaces or country code (e.g., 9876543210).');
                          return;
                        }
                        setIsSavingProfile(true);
                        try {
                          await memberService.updateProfile({
                            surname: editForm.surname,
                            full_name: editForm.name,
                            village: editForm.village,
                            city: editForm.city,
                            address: editForm.address,
                            mobile: cleanMobile,
                            occupation: editForm.occupation
                          });
                          const existingSpouse = familyMembers.find(m => m.relation.toLowerCase() === 'spouse');
                          if (editForm.spouse.trim()) {
                            if (existingSpouse && existingSpouse.name !== editForm.spouse.trim()) {
                              await memberService.updateFamilyMember(existingSpouse.id, { name: editForm.spouse.trim() });
                            } else if (!existingSpouse) {
                              await memberService.createFamilyMember({ name: editForm.spouse.trim(), relation: 'Spouse', age: 35 });
                            }
                          }
                          setIsEditingProfile(false);
                          setShowUpdateSuccess(true);
                          setTimeout(() => setShowUpdateSuccess(false), 5000);
                          await fetchPortalData();
                        } catch (err: any) {
                          const errorMsg = err.response?.data?.detail || "Failed to update profile.";
                          alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
                        } finally {
                          setIsSavingProfile(false);
                        }
                      }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="grid grid-2" style={{ gap: '12px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Surname *</label>
                            <input 
                              type="text" 
                              value={editForm.surname} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, surname: e.target.value }))}
                              required
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Full Name *</label>
                            <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              required
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Spouse Name</label>
                          <input 
                            type="text" 
                            value={editForm.spouse} 
                            onChange={(e) => setEditForm(prev => ({ ...prev, spouse: e.target.value }))}
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                          />
                        </div>
                        <div className="grid grid-2" style={{ gap: '12px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Native Village *</label>
                            <input 
                              type="text" 
                              value={editForm.village} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, village: e.target.value }))}
                              required
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Current City *</label>
                            <input 
                              type="text" 
                              value={editForm.city} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                              required
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-2" style={{ gap: '12px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Phone / Contact *</label>
                            <input 
                              type="text" 
                              value={editForm.contact} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, contact: e.target.value }))}
                              required
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Email Address *</label>
                            <input 
                              type="email" 
                              value={editForm.email} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                              required
                              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Occupation *</label>
                          <input 
                            type="text" 
                            value={editForm.occupation} 
                            onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
                            required
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Residential Address *</label>
                          <textarea 
                            value={editForm.address} 
                            onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                            required
                            rows={2}
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', fontFamily: 'var(--font-body)', resize: 'vertical' }}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px', fontSize: '13px' }} disabled={isSavingProfile}>
                          {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                        </button>
                      </form>
                    ) : (
                      <div className="profile-read-only">
                        <div>
                          <span className="profile-lbl">Member ID</span>
                          <strong>{profile.id}</strong>
                        </div>
                        <div className="grid grid-2" style={{ gap: '12px' }}>
                          <div>
                            <span className="profile-lbl">Spouse Name</span>
                            <strong>{profile.spouse || 'N/A'}</strong>
                          </div>
                          <div>
                            <span className="profile-lbl">Phone / Contact</span>
                            <strong>{profile.contact}</strong>
                          </div>
                        </div>
                        <div className="grid grid-2" style={{ gap: '12px' }}>
                          <div>
                            <span className="profile-lbl">Native Village</span>
                            <strong>{profile.village}</strong>
                          </div>
                          <div>
                            <span className="profile-lbl">Current City</span>
                            <strong>{profile.city}</strong>
                          </div>
                        </div>
                        <div className="grid grid-2" style={{ gap: '12px' }}>
                          <div>
                            <span className="profile-lbl">Email Address</span>
                            <strong>{profile.email}</strong>
                          </div>
                          <div>
                            <span className="profile-lbl">Occupation</span>
                            <strong>{profile.occupation}</strong>
                          </div>
                        </div>
                        <div>
                          <span className="profile-lbl">Residential Address</span>
                          <strong>{profile.address}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Important Announcements */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="dashboard-notices card card-primary" style={{ height: '100%', margin: 0 }}>
                      <h3 style={{ fontSize: '18px', color: 'var(--color-text-dark)', marginBottom: '12px' }}>Important Announcements</h3>
                      {memberAnnouncements.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--color-text-light)', margin: 0 }}>No important announcements at this time.</p>
                      ) : (
                        <ul className="notice-list" style={{ gap: '10px' }}>
                          {memberAnnouncements.map(ann => (
                            <li key={ann.id} style={{ fontSize: '13px', lineHeight: '1.4' }}>
                              <strong>{ann.title}:</strong> {ann.content}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Family Members Register Table */}
                <div className="profile-members-table-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: '0', fontSize: '18px', color: 'var(--color-text-dark)' }}>Registered Family Members ({profile.members.length})</h3>
                    {!isAddingMember && editingMemberIndex === null && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setMemberForm({ name: '', relation: 'Son', age: 18, occupation: '', education: '' });
                          setIsAddingMember(true);
                          setEditingMemberIndex(null);
                          setEditingMemberId(null);
                        }}
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add Member
                      </button>
                    )}
                  </div>

                  {/* Add/Edit Inline Form */}
                  {(isAddingMember || editingMemberIndex !== null) && (
                    <motion.div 
                      className="member-form-inline"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        backgroundColor: 'var(--bg-sand-low)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px'
                      }}
                    >
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--color-text-dark)' }}>
                        {editingMemberIndex !== null ? 'Edit Family Member Details' : 'Add New Family Member'}
                      </h4>
                      <div className="grid grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Name *</label>
                          <input 
                            type="text" 
                            value={memberForm.name} 
                            onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter full name"
                            required
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', background: 'white' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Relation *</label>
                          <select
                            value={memberForm.relation}
                            onChange={(e) => setMemberForm(prev => ({ ...prev, relation: e.target.value }))}
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', background: 'white' }}
                          >
                            <option>Self (Head)</option>
                            <option>Spouse</option>
                            <option>Son</option>
                            <option>Daughter</option>
                            <option>Father</option>
                            <option>Mother</option>
                            <option>Brother</option>
                            <option>Sister</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-3" style={{ gap: '12px', marginBottom: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Age *</label>
                          <input 
                            type="number" 
                            value={memberForm.age} 
                            onChange={(e) => setMemberForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                            required
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', background: 'white' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Occupation</label>
                          <input 
                            type="text" 
                            value={memberForm.occupation} 
                            onChange={(e) => setMemberForm(prev => ({ ...prev, occupation: e.target.value }))}
                            placeholder="e.g. Architect"
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', background: 'white' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Education</label>
                          <input 
                            type="text" 
                            value={memberForm.education} 
                            onChange={(e) => setMemberForm(prev => ({ ...prev, education: e.target.value }))}
                            placeholder="e.g. B.Tech"
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', background: 'white' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                          onClick={() => {
                            setIsAddingMember(false);
                            setEditingMemberIndex(null);
                            setEditingMemberId(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                          disabled={isSavingMember}
                          onClick={async () => {
                            if (!memberForm.name.trim()) {
                              alert('Please enter a name');
                              return;
                            }
                            if (memberForm.age < 0 || memberForm.age > 120) {
                              alert('Please enter a valid age between 0 and 120');
                              return;
                            }
                            setIsSavingMember(true);
                            try {
                              if (editingMemberId !== null) {
                                await memberService.updateFamilyMember(editingMemberId, {
                                  name: memberForm.name,
                                  relation: memberForm.relation,
                                  age: memberForm.age,
                                  occupation: memberForm.occupation || undefined,
                                  education: memberForm.education || undefined
                                });
                              } else {
                                await memberService.createFamilyMember({
                                  name: memberForm.name,
                                  relation: memberForm.relation,
                                  age: memberForm.age,
                                  occupation: memberForm.occupation || undefined,
                                  education: memberForm.education || undefined
                                });
                              }
                              setIsAddingMember(false);
                              setEditingMemberIndex(null);
                              setEditingMemberId(null);
                              await fetchPortalData();
                            } catch (err: any) {
                              const errorMsg = err.response?.data?.detail || "Failed to save family member.";
                              alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
                            } finally {
                              setIsSavingMember(false);
                            }
                          }}
                        >
                          {isSavingMember ? 'Saving...' : 'Save Member'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <table className="family-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Relation</th>
                        <th>Age</th>
                        <th>Occupation</th>
                        <th>Education</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.members.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                            No registered family members yet. Click 'Add Member' above to register family relatives.
                          </td>
                        </tr>
                      ) : (
                        profile.members.map((member, mIdx) => (
                          <tr key={member.id || mIdx}>
                            <td><strong>{member.name}</strong></td>
                            <td>{member.relation}</td>
                            <td>{member.age} yrs</td>
                            <td>{member.occupation || 'N/A'}</td>
                            <td>{member.education || 'N/A'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 10px', fontSize: '12px' }}
                                  onClick={() => {
                                    setMemberForm(member);
                                    setEditingMemberIndex(mIdx);
                                    setEditingMemberId(member.id !== undefined ? member.id : null);
                                    setIsAddingMember(false);
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-outline" 
                                  style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-error)', borderColor: 'var(--color-outline-variant)' }}
                                  onClick={async () => {
                                    if (confirm(`Remove ${member.name} from family unit?`)) {
                                      if (member.id !== undefined) {
                                        try {
                                          await memberService.deleteFamilyMember(member.id);
                                          await fetchPortalData();
                                        } catch (err: any) {
                                          alert("Failed to delete member: " + (err.response?.data?.detail || err.message));
                                        }
                                      }
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: DIGITAL DIRECTORY */}
            {portalTab === 'directory' && (
              <div className="directory-view animate-fade" id="drilldown-directory">
                <header className="panel-header" style={{ marginBottom: '20px' }}>
                  <h1>Digital Family Directory</h1>
                  <p>Drill down by surname to locate family units, occupations, and contact details.</p>
                </header>

                {/* LEVEL 1: Surnames Grid */}
                {directoryLevel === 'surnames' && (
                  <div className="surnames-directory-level animate-fade">
                    <div className="directory-intro-badge">
                      <Users size={16} />
                      <span>Select Surname to View Registered Family Units</span>
                    </div>
                    <div className="grid grid-3 surnames-grid">
                      {surnamesList.map((item, idx) => (
                        <button
                           key={idx}
                           className="directory-surname-card"
                           onClick={() => handleSurnameClick(item.name)}
                           id={`surname-drilldown-${item.name.toLowerCase()}`}
                        >
                          <span className="surname-letter">{item.name[0]}</span>
                          <span className="surname-name">{item.name}</span>
                          <span className="surname-count">{item.count} Families</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* LEVEL 2: Family Heads List */}
                {directoryLevel === 'heads' && selectedSurname && (
                  <div className="heads-directory-level animate-fade">
                    <div className="directory-breadcrumbs">
                      <button className="btn-back" onClick={handleBackToSurnames}>
                        <ArrowLeft size={16} /> Back to Surnames
                      </button>
                      <span className="breadcrumb-current"> / Surname: {selectedSurname}</span>
                    </div>

                    <div className="directory-search-wrapper">
                      <Search size={18} className="search-icon-inside" />
                      <input 
                        type="text"
                        placeholder="Search family head, native village, or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="directory-search-field"
                        id="directory-head-search"
                      />
                    </div>

                    <div className="family-heads-list">
                      {filteredHeads.map((head) => (
                        <div key={head.id} className="family-head-row-card">
                          <div className="head-initials-badge">{head.name[0]}</div>
                          <div className="head-row-info">
                            <h3>{head.name}</h3>
                            <p>City: {head.city} • Native Village: {head.village} • Size: {head.membersCount} Members</p>
                          </div>
                          <button 
                            className="btn btn-secondary btn-view-family"
                            onClick={() => handleHeadClick(head.id)}
                            id={`view-family-btn-${head.id}`}
                          >
                            <Eye size={16} /> View Profile
                          </button>
                        </div>
                      ))}
                      {filteredHeads.length === 0 && (
                        <div className="no-records-card">
                          <p>No family head matches your search query.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LEVEL 3: Family Profile Details */}
                {directoryLevel === 'details' && selectedFamily && (
                  <div className="details-directory-level animate-fade" id="family-profile-details">
                    <div className="directory-breadcrumbs">
                      <button className="btn-back" onClick={handleBackToHeads}>
                        <ArrowLeft size={16} /> Back to Family Heads
                      </button>
                      <span className="breadcrumb-current"> / {selectedFamily.name} Family Details</span>
                    </div>

                    <div className="family-full-profile-card">
                      {/* Family Master Info */}
                      <div className="profile-master-header">
                        <div className="profile-badge-id">{selectedFamily.id}</div>
                        <h2>{selectedFamily.name} Family Unit</h2>
                        <div className="master-grid" style={{ marginTop: '20px' }}>
                          <div>
                            <strong>Head of Family:</strong> {selectedFamily.name}
                          </div>
                          <div>
                            <strong>Spouse Name:</strong> {selectedFamily.spouse || 'N/A'}
                          </div>
                          <div>
                            <strong>Native Village:</strong> {selectedFamily.village}
                          </div>
                          <div>
                            <strong>Current City:</strong> {selectedFamily.city}
                          </div>
                          <div>
                            <strong>Email Address:</strong> {selectedFamily.email || 'N/A'}
                          </div>
                          <div>
                            <strong>Occupation:</strong> {selectedFamily.occupation || 'N/A'}
                          </div>
                          <div className="span-all-grid-cols">
                            <strong>Contact Number:</strong> {selectedFamily.contact}
                          </div>
                          <div className="span-all-grid-cols" style={{ marginTop: '8px' }}>
                            <strong>Residential Address:</strong> {selectedFamily.address}
                          </div>
                        </div>
                      </div>

                      {/* Members Drill Down Table */}
                      <div className="profile-members-table-wrapper" style={{ marginTop: '30px' }}>
                        <h3>Family Members Register</h3>
                        <table className="family-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Relation</th>
                              <th>Age</th>
                              <th>Occupation</th>
                              <th>Education</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedFamily.members.map((member, mIdx) => (
                              <tr key={mIdx}>
                                <td><strong>{member.name}</strong></td>
                                <td>{member.relation}</td>
                                <td>{member.age} yrs</td>
                                <td>{member.occupation || 'N/A'}</td>
                                <td>{member.education || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ANNUAL REPORTS */}
            {portalTab === 'reports' && (
              <div className="reports-view animate-fade" id="annual-reports-view">
                <header className="panel-header" style={{ marginBottom: '30px' }}>
                  <h1>Annual Reports & Statements</h1>
                  <p>Download official administrative, audit, and budgetary documentation.</p>
                </header>

                {reportsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p>Loading annual reports...</p>
                  </div>
                ) : annualReports.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p>No published annual reports available at this time.</p>
                  </div>
                ) : (
                  <div className="reports-list">
                    {annualReports.map((report, idx) => (
                      <div key={report.id} className="report-row-card" style={idx > 0 ? { marginTop: '16px' } : {}}>
                        <div className="report-icon-block">PDF</div>
                        <div className="report-info-block">
                          <h3>{report.title} ({report.financial_year})</h3>
                          {report.description && <p>{report.description}</p>}
                        </div>
                        <a 
                          href={report.file_url.startsWith('http') ? report.file_url : `http://127.0.0.1:8000${report.file_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-secondary btn-download" 
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          id={`download-report-btn-${report.id}`}
                        >
                          <Download size={16} /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      
    </div>
  );
};
