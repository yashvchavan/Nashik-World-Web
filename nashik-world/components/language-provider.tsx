"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "hi" | "mr"

type Translations = {
  [key: string]: {
    [key in Language]: string
  }
}

const translations: Translations = {
  home: {
    en: "Home",
    hi: "होम",
    mr: "मुख्यपृष्ठ",
  },
  reportIssue: {
    en: "Report Issue",
    hi: "समस्या रिपोर्ट करें",
    mr: "समस्या नोंदवा",
  },
  issueDashboard: {
    en: "Issue Dashboard",
    hi: "समस्या डैशबोर्ड",
    mr: "समस्या डॅशबोर्ड",
  },
  transparencyDashboard: {
    en: "Transparency",
    hi: "पारदर्शिता",
    mr: "पारदर्शकता",
  },
  gamification: {
    en: "Civic Points",
    hi: "नागरिक अंक",
    mr: "नागरी गुण",
  },
  profile: {
    en: "Profile",
    hi: "प्रोफाइल",
    mr: "प्रोफाइल",
  },
  navigation: {
    en: "Navigation",
    hi: "नेविगेशन",
    mr: "नेव्हिगेशन",
  },
  logout: {
    en: "Logout",
    hi: "लॉग आउट",
    mr: "बाहेर पडा",
  },
  language: {
    en: "Language",
    hi: "भाषा",
    mr: "भाषा",
  },
  english: {
    en: "English",
    hi: "अंग्रेज़ी",
    mr: "इंग्रजी",
  },
  hindi: {
    en: "Hindi",
    hi: "हिंदी",
    mr: "हिंदी",
  },
  marathi: {
    en: "Marathi",
    hi: "मराठी",
    mr: "मराठी",
  },
  heroTitle: {
    en: "Make Nashik Better Together",
    hi: "नासिक को एक साथ बेहतर बनाएं",
    mr: "नाशिक एकत्र सुधारूया",
  },
  heroSubtitle: {
    en: "Report civic issues, track their resolution, and earn civic points",
    hi: "नागरिक समस्याओं की रिपोर्ट करें, उनके समाधान को ट्रैक करें, और नागरिक अंक अर्जित करें",
    mr: "नागरी समस्या नोंदवा, त्यांचे निराकरण ट्रॅक करा, आणि नागरी गुण मिळवा",
  },
  reportNow: {
    en: "Report Now",
    hi: "अभी रिपोर्ट करें",
    mr: "आता नोंदवा",
  },
  viewDashboard: {
    en: "View Dashboard",
    hi: "डैशबोर्ड देखें",
    mr: "डॅशबोर्ड पहा",
  },
  issueType: {
    en: "Issue Type",
    hi: "समस्या का प्रकार",
    mr: "समस्येचा प्रकार",
  },
  description: {
    en: "Description",
    hi: "विवरण",
    mr: "वर्णन",
  },
  location: {
    en: "Location",
    hi: "स्थान",
    mr: "स्थान",
  },
  uploadPhoto: {
    en: "Upload Photo",
    hi: "फोटो अपलोड करें",
    mr: "फोटो अपलोड करा",
  },
  submit: {
    en: "Submit",
    hi: "जमा करें",
    mr: "सबमिट करा",
  },
  pothole: {
    en: "Pothole",
    hi: "गड्ढा",
    mr: "खड्डा",
  },
  waterLeak: {
    en: "Water Leak",
    hi: "पानी का रिसाव",
    mr: "पाणी गळती",
  },
  garbage: {
    en: "Garbage",
    hi: "कचरा",
    mr: "कचरा",
  },
  fallenTree: {
    en: "Fallen Tree",
    hi: "गिरा हुआ पेड़",
    mr: "पडलेले झाड",
  },
  streetlight: {
    en: "Streetlight Failure",
    hi: "स्ट्रीटलाइट विफलता",
    mr: "स्ट्रीटलाइट बिघाड",
  },
  disaster: {
    en: "Disaster Damage",
    hi: "आपदा क्षति",
    mr: "आपत्ती नुकसान",
  },
  useCurrentLocation: {
    en: "Use Current Location",
    hi: "वर्तमान स्थान का उपयोग करें",
    mr: "वर्तमान स्थान वापरा",
  },
  enterManually: {
    en: "Enter Manually",
    hi: "मैन्युअल रूप से दर्ज करें",
    mr: "स्वतः प्रविष्ट करा",
  },
  describeIssue: {
    en: "Describe the issue in detail",
    hi: "समस्या का विस्तार से वर्णन करें",
    mr: "समस्येचे सविस्तर वर्णन करा",
  },
  dragAndDrop: {
    en: "Drag and drop or click to upload",
    hi: "खींचें और छोड़ें या अपलोड करने के लिए क्लिक करें",
    mr: "ड्रॅग अँड ड्रॉप किंवा अपलोड करण्यासाठी क्लिक करा",
  },
  issuesList: {
    en: "Issues List",
    hi: "समस्याओं की सूची",
    mr: "समस्यांची यादी",
  },
  mapView: {
    en: "Map View",
    hi: "मानचित्र दृश्य",
    mr: "नकाशा दृश्य",
  },
  filter: {
    en: "Filter",
    hi: "फ़िल्टर",
    mr: "फिल्टर",
  },
  status: {
    en: "Status",
    hi: "स्थिति",
    mr: "स्थिती",
  },
  category: {
    en: "Category",
    hi: "श्रेणी",
    mr: "श्रेणी",
  },
  radius: {
    en: "Radius",
    hi: "त्रिज्या",
    mr: "त्रिज्या",
  },
  open: {
    en: "Open",
    hi: "खुला",
    mr: "खुले",
  },
  inProgress: {
    en: "In Progress",
    hi: "प्रगति पर",
    mr: "प्रगतीपथावर",
  },
  resolved: {
    en: "Resolved",
    hi: "हल किया गया",
    mr: "सोडवले",
  },
  assignedTo: {
    en: "Assigned To",
    hi: "को सौंपा गया",
    mr: "नियुक्त",
  },
  timeline: {
    en: "Timeline",
    hi: "समयरेखा",
    mr: "कालरेषा",
  },
  civicPoints: {
    en: "Civic Points",
    hi: "नागरिक अंक",
    mr: "नागरी गुण",
  },
  leaderboard: {
    en: "Leaderboard",
    hi: "लीडरबोर्ड",
    mr: "लीडरबोर्ड",
  },
  upcomingDrives: {
    en: "Upcoming Community Drives",
    hi: "आगामी सामुदायिक अभियान",
    mr: "आगामी सामुदायिक उपक्रम",
  },
  yourIssues: {
    en: "Your Issues",
    hi: "आपकी समस्याएँ",
    mr: "तुमच्या समस्या",
  },
  pointsEarned: {
    en: "Points Earned",
    hi: "अर्जित अंक",
    mr: "मिळवलेले गुण",
  },
  verifyResolution: {
    en: "Verify Resolution",
    hi: "समाधान सत्यापित करें",
    mr: "निराकरण सत्यापित करा",
  },
  voiceInput: {
    en: "Voice Input",
    hi: "आवाज इनपुट",
    mr: "आवाज इनपुट",
  },
  reportedOn: {
    en: "Reported On",
    hi: "पर रिपोर्ट किया गया",
    mr: "रिपोर्ट केले",
  },
  viewDetails: {
    en: "View Details",
    hi: "विवरण देखें",
    mr: "तपशील पहा",
  },
  selectCategory: {
    en: "Select Category",
    hi: "श्रेणी चुनें",
    mr: "श्रेणी निवडा",
  },
  preview: {
    en: "Preview",
    hi: "पूर्वावलोकन",
    mr: "पूर्वावलोकन",
  },
  back: {
    en: "Back",
    hi: "वापस",
    mr: "मागे",
  },
  next: {
    en: "Next",
    hi: "अगला",
    mr: "पुढे",
  },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found`)
      return key
    }
    return translations[key][language]
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}
