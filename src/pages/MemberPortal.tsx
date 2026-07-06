import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FolderOpen, ArrowLeft, Eye, ShieldCheck, Download, Search, LogOut, Edit, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { memberService } from '../services/memberService';
import type { MemberProfileResponse, FamilyMemberResponse } from '../services/memberService';
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

interface MemberPortalProps {
  isLoggedIn?: boolean;
  setIsLoggedIn?: (login: boolean) => void;
}

export const MemberPortal: React.FC<MemberPortalProps> = () => {
  const { isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const [portalTab, setPortalTab] = useState<'home' | 'directory' | 'reports'>('home');
  
  // User Profile and Family state from backend APIs
  const [profileData, setProfileData] = useState<MemberProfileResponse | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberResponse[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
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
      const [profRes, famRes] = await Promise.all([
        memberService.getProfile(),
        memberService.getFamilyMembers()
      ]);
      setProfileData(profRes);
      setFamilyMembers(famRes);
      
      const spouseMember = famRes.find(m => m.relation.toLowerCase() === 'spouse');
      setEditForm({
        name: profRes.full_name,
        spouse: spouseMember ? spouseMember.name : '',
        village: profRes.village,
        city: 'Ahmedabad',
        contact: profRes.mobile,
        email: profRes.email || '',
        occupation: 'Business / Professional',
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

  const spouseMember = familyMembers.find(m => m.relation.toLowerCase() === 'spouse');
  const profile: FamilyHead = profileData ? {
    id: `SSPV-${profileData.id}`,
    name: profileData.full_name,
    city: editForm.city || 'Ahmedabad',
    membersCount: familyMembers.length,
    spouse: spouseMember ? spouseMember.name : (editForm.spouse || 'N/A'),
    village: profileData.village,
    contact: profileData.mobile,
    email: profileData.email || '',
    occupation: editForm.occupation || 'Business / Professional',
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
  const [signupTerms, setSignupTerms] = useState(false);

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

  // 12 Surnames with Mock Family Counts
  const surnamesList = [
    { name: 'Kukadiya', count: 142 },
    { name: 'Chandegra', count: 98 },
    { name: 'Vavadiya', count: 120 },
    { name: 'Gohil', count: 110 },
    { name: 'Parmar', count: 215 },
    { name: 'Chauhan', count: 185 },
    { name: 'Mistry', count: 130 },
    { name: 'Prajapati', count: 320 },
    { name: 'Solanki', count: 115 },
    { name: 'Chavda', count: 94 },
    { name: 'Vaghela', count: 88 },
    { name: 'Rathod', count: 104 },
  ];

  // Mock Family Heads Database
  const familyHeadsData: Record<string, FamilyHead[]> = {
    Parmar: [
      {
        id: 'SSPV-4829',
        name: 'Rajesh Parmar',
        city: 'Ahmedabad',
        membersCount: 4,
        spouse: 'Sneha Parmar',
        village: 'Junagadh',
        contact: '+91 98765 43210',
        email: 'rajesh.parmar@sspv.org',
        occupation: 'Business Owner',
        address: '42, Heritage Enclave, Vastrapur, Ahmedabad - 380015',
        members: [
          { name: 'Rajesh Parmar', relation: 'Self (Head)', age: 48, occupation: 'Business Owner', education: 'B.Com' },
          { name: 'Sneha Parmar', relation: 'Spouse', age: 44, occupation: 'Homemaker', education: 'B.A.' },
          { name: 'Rahul Parmar', relation: 'Son', age: 22, occupation: 'Software Engineer', education: 'B.Tech IT' },
          { name: 'Aarti Parmar', relation: 'Daughter', age: 18, occupation: 'Student', education: 'Undergrad Commerce' },
        ]
      },
      {
        id: 'SSPV-4830',
        name: 'Mahesh Parmar',
        city: 'Rajkot',
        membersCount: 3,
        spouse: 'Lilaben Parmar',
        village: 'Somnath',
        contact: '+91 98765 43211',
        email: 'mahesh.parmar@sspv.org',
        occupation: 'Architectural Consultant',
        address: '102, Shrinathji Complex, Kalawad Road, Rajkot - 360005',
        members: [
          { name: 'Mahesh Parmar', relation: 'Self (Head)', age: 52, occupation: 'Architectural Consultant', education: 'B.Arch' },
          { name: 'Lilaben Parmar', relation: 'Spouse', age: 48, occupation: 'Interior Designer', education: 'Diploma Arts' },
          { name: 'Karan Parmar', relation: 'Son', age: 24, occupation: 'Civil Engineer', education: 'M.Tech Structural' },
        ]
      },
      {
        id: 'SSPV-4831',
        name: 'Suresh Parmar',
        city: 'Surat',
        membersCount: 3,
        spouse: 'Kirtidaben Parmar',
        village: 'Veraval',
        contact: '+91 98765 43212',
        email: 'suresh.parmar@sspv.org',
        occupation: 'Diamond Merchant',
        address: 'A-304, Green Heights, Adajan, Surat - 395009',
        members: [
          { name: 'Suresh Parmar', relation: 'Self (Head)', age: 50, occupation: 'Diamond Merchant', education: 'High School' },
          { name: 'Kirtidaben Parmar', relation: 'Spouse', age: 45, occupation: 'Boutique Owner', education: 'B.A.' },
          { name: 'Pooja Parmar', relation: 'Daughter', age: 20, occupation: 'Student', education: 'B.Des Fashion' },
        ]
      }
    ],
    Kukadiya: [
      {
        id: 'SSPV-3012',
        name: 'Jayesh Kukadiya',
        city: 'Ahmedabad',
        membersCount: 5,
        spouse: 'Savitaben Kukadiya',
        village: 'Keshod',
        contact: '+91 94260 11223',
        email: 'jayesh.k@sspv.org',
        occupation: 'Manufacturing Business',
        address: 'Block-D, 401, Rivera Heights, Gota, Ahmedabad - 382481',
        members: [
          { name: 'Jayesh Kukadiya', relation: 'Self (Head)', age: 55, occupation: 'Manufacturing Business', education: 'D.M.E' },
          { name: 'Savitaben Kukadiya', relation: 'Spouse', age: 51, occupation: 'Homemaker', education: 'High School' },
          { name: 'Hardik Kukadiya', relation: 'Son', age: 27, occupation: 'Production Manager', education: 'B.E. Mechanical' },
          { name: 'Dr. Riddhi Kukadiya', relation: 'Daughter-in-law', age: 26, occupation: 'Dentist', education: 'B.D.S' },
          { name: 'Dharaben Kukadiya', relation: 'Daughter', age: 21, occupation: 'Student', education: 'M.B.A Finance' },
        ]
      }
    ],
    Prajapati: [
      {
        id: 'SSPV-1048',
        name: 'Mansukhbhai Prajapati',
        city: 'Ahmedabad',
        membersCount: 4,
        spouse: 'Kamlaben Prajapati',
        village: 'Wankaner',
        contact: '+91 99240 88776',
        email: 'mansukh.clay@sspv.org',
        occupation: 'Clay Earthenware Pioneer',
        address: 'ClayTech Villa, Near Science City, Ahmedabad - 380060',
        members: [
          { name: 'Mansukhbhai Prajapati', relation: 'Self (Head)', age: 60, occupation: 'Clay Earthenware Pioneer', education: 'Primary Education' },
          { name: 'Kamlaben Prajapati', relation: 'Spouse', age: 56, occupation: 'Quality Auditor', education: 'High School' },
          { name: 'Vijay Prajapati', relation: 'Son', age: 32, occupation: 'R&D Lead', education: 'B.Tech Ceramic Eng' },
          { name: 'Bhumika Prajapati', relation: 'Daughter', age: 25, occupation: 'Marketing Executive', education: 'M.B.A Marketing' },
        ]
      }
    ]
  };

  const getFamilyHeadsForSurname = (surnameName: string): FamilyHead[] => {
    const defaultList = familyHeadsData[surnameName] || [
      {
        id: `SSPV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `Kishorbhai ${surnameName}`,
        city: 'Ahmedabad',
        membersCount: 4,
        spouse: `Manjuben ${surnameName}`,
        village: 'Gir-Gadhada',
        contact: '+91 98000 00000',
        email: `kishor.${surnameName.toLowerCase()}@sspv.org`,
        occupation: 'Retired Government Officer',
        address: `12, Somnath Society, Satellite, Ahmedabad - 380015`,
        members: [
          { name: `Kishorbhai ${surnameName}`, relation: 'Self (Head)', age: 56, occupation: 'Retired Government Officer', education: 'M.A.' },
          { name: `Manjuben ${surnameName}`, relation: 'Spouse', age: 52, occupation: 'Homemaker', education: 'High School' },
          { name: `Pratik ${surnameName}`, relation: 'Son', age: 28, occupation: 'Civil Architect', education: 'B.Arch' },
          { name: `Neha ${surnameName}`, relation: 'Daughter', age: 24, occupation: 'Chartered Accountant', education: 'C.A.' },
        ]
      }
    ];

    if (surnameName === 'Parmar') {
      return defaultList.map(head => head.id === profile.id ? { ...head, ...profile } : head);
    }
    return defaultList;
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
      setLoginError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setLoginError('');
    try {
      await login({ email, password });
      setEditForm({
        name: profile.name,
        spouse: profile.spouse,
        village: profile.village,
        city: profile.city,
        contact: profile.contact,
        email: profile.email,
        occupation: profile.occupation,
        address: profile.address
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Invalid credentials. Please verify your email and password.';
      setLoginError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupMobile) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!signupTerms) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }
    alert(`Registration request submitted for verification!\nFamily Head Name: ${signupName}\nMobile: +91 ${signupMobile}\nWe will contact you shortly after community verification.`);
    // Reset signup form
    setSignupName('');
    setSignupMobile('');
    setSignupTerms(false);
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
                      <label className="login-form-label" htmlFor="login-email">Registered Mobile or Email</label>
                      <input 
                        id="login-email"
                        className="login-form-input"
                        type="text" 
                        placeholder="e.g. 98765 43210"
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
                          onClick={() => alert("Demo Password Reset: To reset, please contact IT desk at info@sorathiyaprajapati.org.")}
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
                        Email: <code>admin@example.com</code> / Password: <code>adminpassword</code>
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

                    <button type="submit" className="login-submit-button" id="signup-submit-btn">
                      <span>Request Registration</span>
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
                            full_name: editForm.name,
                            village: editForm.village,
                            address: editForm.address,
                            mobile: cleanMobile
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

                  {/* Right Column: Notices & Quick Logout */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="dashboard-notices card card-primary" style={{ height: '100%', margin: 0 }}>
                      <h3 style={{ fontSize: '18px', color: 'var(--color-text-dark)', marginBottom: '12px' }}>Important Announcements</h3>
                      <ul className="notice-list" style={{ gap: '10px' }}>
                        <li style={{ fontSize: '13px', lineHeight: '1.4' }}>
                          <strong>Samuh Lagan Registration:</strong> Deadline is December 1, 2026.
                        </li>
                        <li style={{ fontSize: '13px', lineHeight: '1.4' }}>
                          <strong>Scholarship applications</strong> are now active. Submissions accepted under the education panel.
                        </li>
                        <li style={{ fontSize: '13px', lineHeight: '1.4' }}>
                          <strong>Audited Accounts of FY 2025-26</strong> are available in the Reports directory.
                        </li>
                      </ul>
                    </div>

                    <button 
                      className="btn btn-outline"
                      onClick={async () => {
                        await logout();
                        setPortalTab('home');
                        const homeTabLink = document.getElementById('nav-link-home');
                        if (homeTabLink) homeTabLink.click();
                      }}
                      style={{
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-primary)',
                        padding: '12px',
                        fontWeight: 'bold',
                        width: '100%'
                      }}
                    >
                      <LogOut size={16} /> Logout from Portal
                    </button>
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

                <div className="reports-list">
                  <div className="report-row-card">
                    <div className="report-icon-block">PDF</div>
                    <div className="report-info-block">
                      <h3>Audited Balance Sheet FY 2025-2026</h3>
                      <p>Approved statement of trust assets, bank accounts, and educational welfare disbursement registers.</p>
                    </div>
                    <button className="btn btn-secondary btn-download" onClick={() => alert('Downloading Report...')} id="download-report-btn-1">
                      <Download size={16} /> Download
                    </button>
                  </div>

                  <div className="report-row-card" style={{ marginTop: '16px' }}>
                    <div className="report-icon-block">PDF</div>
                    <div className="report-info-block">
                      <h3>Annual General Meeting (AGM) Minutes 2025</h3>
                      <p>Resolutions approved by the general assembly including amendments to Stepwell Restoration fundings.</p>
                    </div>
                    <button className="btn btn-secondary btn-download" onClick={() => alert('Downloading AGM Minutes...')} id="download-report-btn-2">
                      <Download size={16} /> Download
                    </button>
                  </div>

                  <div className="report-row-card" style={{ marginTop: '16px' }}>
                    <div className="report-icon-block">PDF</div>
                    <div className="report-info-block">
                      <h3>Education Fund Merit Scholars List 2025</h3>
                      <p>Complete directory of students funded under the SSPV merit scholarship program for academic degrees.</p>
                    </div>
                    <button className="btn btn-secondary btn-download" onClick={() => alert('Downloading Scholar List...')} id="download-report-btn-3">
                      <Download size={16} /> Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      
    </div>
  );
};
