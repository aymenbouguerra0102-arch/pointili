export type Language = 'ar' | 'en' | 'fr';

export interface Translations {
  // App brand & general
  appName: string;
  appTagline: string;
  wilayaName: string;
  adminPortal: string;
  installedOnDesk: string;
  addToHomeScreen: string;
  install: string;

  // Tabs
  tabCards: string;
  tabScanner: string;
  tabProfile: string;

  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  searchPlaceholder: string;
  filterAll: string;
  filterCafes: string;
  filterFood: string;
  filterReady: string;
  stampsProgress: string;
  stampsCountText: string;
  zeroStampsNotice: string;
  scanToEarn: string;
  viewOnMaps: string;
  claimReward: string;
  rewardUnlocked: string;
  stampsCompleted: string;
  noRestaurantsFound: string;
  discoverMore: string;

  // Stamp card
  circleStampBadge: string;
  freeRewardAt6: string;
  scanToFillDots: string;
  restaurantDetails: string;
  addressLabel: string;
  hoursLabel: string;
  neighborhoodLabel: string;

  // Scanner
  scannerTitle: string;
  scannerSubtitle: string;
  scanInstructions: string;
  cameraActive: string;
  pointAtQR: string;
  instantSimulate: string;
  orEnterCode: string;
  codePlaceholder: string;
  submitCode: string;
  stampSuccess: string;
  stampAddedDesc: string;
  rewardUnlockedCelebration: string;
  invalidCodeError: string;

  // Profile
  profileTitle: string;
  profileSubtitle: string;
  memberSince: string;
  loyaltyTier: string;
  stampsCollected: string;
  rewardsClaimed: string;
  languageSelect: string;
  languageSelectDesc: string;
  showHomeScreenIcon: string;
  showHomeScreenDesc: string;
  logoutButton: string;
  logoutConfirm: string;

  // Google Auth
  authHeading: string;
  authSubheading: string;
  continueWithGoogle: string;
  googleModalTitle: string;
  googleModalSubtitle: string;
  realGmailRequired: string;
  enterGmail: string;
  enterFullName: string;
  enterPassword: string;
  googleAuthorize: string;
  authenticating: string;

  // Admin
  adminTitle: string;
  adminLoginTitle: string;
  usernameLabel: string;
  passwordLabel: string;
  loginButton: string;
  overviewTab: string;
  restaurantsTab: string;
  winnersTab: string;
  usersTab: string;
  totalRegisteredUsers: string;
  totalRewardsWon: string;
  dailyScans: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: 'Pointili',
    appTagline: 'بطاقة الولاء الرقمية بنظام 6 أختام لكافيهات ومطاعم برج بوعريريج',
    wilayaName: 'ولاية برج بوعريريج (34)',
    adminPortal: 'بوابة الإدارة',
    installedOnDesk: 'تثبيت في مكتب الهاتف',
    addToHomeScreen: 'أضف Pointili إلى شاشة هاتفك الرئيسية',
    install: 'تثبيت',

    tabCards: 'بطاقاتي',
    tabScanner: 'مسح QR',
    tabProfile: 'حسابي',

    dashboardTitle: 'بطاقات ولاء مطاعم برج بوعريريج',
    dashboardSubtitle: 'امسح كود QR في كل زيارة، اجمع 6 أختام، واحصل على وجبتك أو مشروبك مجاناً!',
    searchPlaceholder: 'ابحث عن مطعم أو مقهى في برج بوعريريج...',
    filterAll: 'الكل',
    filterCafes: 'مقاهي ومحامص ☕',
    filterFood: 'مطاعم وأكلات سريعة 🍔',
    filterReady: 'مكتملة وجاهزة 🎉',
    stampsProgress: 'تقدم الأختام',
    stampsCountText: 'أختام من 6',
    zeroStampsNotice: 'حساب جديد: 0 أختام · امسح كود QR في المطعم لبدء الختم',
    scanToEarn: 'امسح كود QR لإضافة ختم',
    viewOnMaps: 'عرض في Google Maps',
    claimReward: 'استلام الجائزة المجانية',
    rewardUnlocked: '🎉 مبروك! فزت بالمكافأة المجانية',
    stampsCompleted: 'اكتملت 6/6 أختام!',
    noRestaurantsFound: 'لم يتم العثور على مطاعم تطابق بحثك في برج بوعريريج',
    discoverMore: 'استكشاف أماكن جديدة',

    circleStampBadge: '6 دوائر للختم',
    freeRewardAt6: 'عند إكمال 6 أختام تحصل على الهدية مجاناً',
    scanToFillDots: 'كل مسحة QR تملأ دائرة واحدة',
    restaurantDetails: 'تفاصيل المحل والموقع',
    addressLabel: 'العنوان',
    hoursLabel: 'ساعات العمل',
    neighborhoodLabel: 'الحي',

    scannerTitle: 'ماسح الـ QR الذكي',
    scannerSubtitle: 'وجه الكاميرا نحو ملصق QR الموضوع لدى كاشير المطعم في برج بوعريريج',
    scanInstructions: 'ثبّت الكاميرا على كود QR الخاص بالمطعم',
    cameraActive: 'الكاميرا نشطة وجاهزة للمسح',
    pointAtQR: 'ضع كود QR داخل الإطار',
    instantSimulate: 'تجربة مسح فوري للمطاعم',
    orEnterCode: 'أو أدخل كود الختم يدوياً',
    codePlaceholder: 'أدخل الكود السري للمطعم...',
    submitCode: 'تأكيد الختم',
    stampSuccess: 'تم إضافة ختم جديد بنجاح! ⭐',
    stampAddedDesc: 'تم شطب دائرة جديدة في بطاقة الولاء الخاصة بك.',
    rewardUnlockedCelebration: '🎊 رائع! اكتملت 6 أختام وتم فتح المكافأة المجانية!',
    invalidCodeError: 'كود الختم غير صحيح، يرجى التأكد وإعادة المحاولة.',

    profileTitle: 'الملف الشخصي',
    profileSubtitle: 'بيانات حسابك الحقيقي ورصيدك من الأختام والمكافآت',
    memberSince: 'عضو منذ',
    loyaltyTier: 'الفئة',
    stampsCollected: 'إجمالي الأختام',
    rewardsClaimed: 'الجوائز المجانية المستلمة',
    languageSelect: 'لغة التطبيق / Language',
    languageSelectDesc: 'اختر لغة واجهة التطبيق (عربية، إنجليزية، فرنسية)',
    showHomeScreenIcon: 'شعار التطبيق على مكتب الهاتف',
    showHomeScreenDesc: 'طريقة إضافة أيقونة Pointili إلى الشاشة الرئيسية',
    logoutButton: 'تسجيل الخروج',
    logoutConfirm: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',

    authHeading: 'بطاقتك الرقمية، بكل بساطة.',
    authSubheading: 'كافيهات ومطاعم برج بوعريريج. 6 أختام = وجبة أو مشروب مجاني.',
    continueWithGoogle: 'المتابعة باستخدام Google',
    googleModalTitle: 'تسجيل الدخول بحساب Google',
    googleModalSubtitle: 'اختر أو أدخل بريد Gmail الحقيقي للدخول إلى تطبيق Pointili',
    realGmailRequired: 'بريد Gmail حقيقي إلزامي للدخول',
    enterGmail: 'بريد Gmail الخاص بك',
    enterFullName: 'اسمك الكامل',
    enterPassword: 'كلمة مرور حساب Google للتحقق',
    googleAuthorize: 'تسجيل الدخول والدخول للتطبيق',
    authenticating: 'جاري تسجيل الدخول بحساب Google...',

    adminTitle: 'لوحة إدارة Pointili - برج بوعريريج',
    adminLoginTitle: 'بوابة الإدارة الآمنة',
    usernameLabel: 'اسم المستخدم',
    passwordLabel: 'كلمة المرور',
    loginButton: 'تسجيل الدخول للإدارة',
    overviewTab: 'نظرة عامة',
    restaurantsTab: 'مطاعم برج بوعريريج',
    winnersTab: 'سجل الفائزين',
    usersTab: 'المستخدمون المسجلون',
    totalRegisteredUsers: 'المستخدمون المسجلون',
    totalRewardsWon: 'الجوائز المستلمة',
    dailyScans: 'عمليات المسح اليومية',
  },

  fr: {
    appName: 'Pointili',
    appTagline: 'Carte de fidélité digitale à 6 tampons pour les cafés et restaurants de Bordj Bou Arreridj',
    wilayaName: 'Wilaya de Bordj Bou Arreridj (34)',
    adminPortal: 'Portail Admin',
    installedOnDesk: 'Installer sur l\'écran d\'accueil',
    addToHomeScreen: 'Ajoutez Pointili sur l\'écran d\'accueil de votre téléphone',
    install: 'Installer',

    tabCards: 'Mes Cartes',
    tabScanner: 'Scanner QR',
    tabProfile: 'Profil',

    dashboardTitle: 'Cartes de Fidélité - Bordj Bou Arreridj',
    dashboardSubtitle: 'Scannez le QR code à chaque visite, cumulez 6 tampons et gagnez votre repas ou boisson gratuite !',
    searchPlaceholder: 'Rechercher un restaurant ou café à BBA...',
    filterAll: 'Tous',
    filterCafes: 'Cafés & Torréfacteurs ☕',
    filterFood: 'Restaurants & Fast-Food 🍔',
    filterReady: 'Récompenses Prêtes 🎉',
    stampsProgress: 'Progression des tampons',
    stampsCountText: 'tampons sur 6',
    zeroStampsNotice: 'Nouveau compte : 0 tampon · Scannez le QR code au restaurant pour commencer',
    scanToEarn: 'Scanner le QR pour tamponner',
    viewOnMaps: 'Ouvrir sur Google Maps',
    claimReward: 'Réclamer le cadeau gratuit',
    rewardUnlocked: '🎉 Félicitations ! Récompense gratuite débloquée',
    stampsCompleted: '6/6 tampons complétés !',
    noRestaurantsFound: 'Aucun établissement trouvé à Bordj Bou Arreridj pour cette recherche',
    discoverMore: 'Découvrir d\'autres lieux',

    circleStampBadge: '6 cercles de fidélité',
    freeRewardAt6: 'Au 6ème tampon, profitez de votre repas ou boisson offerte',
    scanToFillDots: 'Chaque scan QR remplit un cercle',
    restaurantDetails: 'Détails et localisation du restaurant',
    addressLabel: 'Adresse',
    hoursLabel: 'Horaires',
    neighborhoodLabel: 'Quartier',

    scannerTitle: 'Scanner QR Intelligent',
    scannerSubtitle: 'Pointez votre appareil photo sur le QR code affiché à la caisse du restaurant à Bordj Bou Arreridj',
    scanInstructions: 'Alignez le QR code dans le cadre',
    cameraActive: 'Caméra active et prête',
    pointAtQR: 'Placez le QR code dans le viseur',
    instantSimulate: 'Test de scan instantané',
    orEnterCode: 'Ou saisir le code manuellement',
    codePlaceholder: 'Code secret du restaurant...',
    submitCode: 'Valider le tampon',
    stampSuccess: 'Nouveau tampon validé avec succès ! ⭐',
    stampAddedDesc: 'Un cercle supplémentaire a été rempli sur votre carte de fidélité.',
    rewardUnlockedCelebration: '🎊 Bravo ! 6 tampons atteints, votre cadeau gratuit est débloqué !',
    invalidCodeError: 'Code QR invalide, veuillez vérifier et réessayer.',

    profileTitle: 'Mon Profil',
    profileSubtitle: 'Informations de votre compte réel et solde de vos tampons',
    memberSince: 'Membre depuis',
    loyaltyTier: 'Statut',
    stampsCollected: 'Total des tampons',
    rewardsClaimed: 'Cadeaux gratuits réclamés',
    languageSelect: 'Langue de l\'application',
    languageSelectDesc: 'Choisissez votre langue préférée (Arabe, Français, Anglais)',
    showHomeScreenIcon: 'Icône sur l\'écran d\'accueil',
    showHomeScreenDesc: 'Comment ajouter le raccourci Pointili sur votre bureau mobile',
    logoutButton: 'Se déconnecter',
    logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',

    authHeading: 'Votre carte de fidélité digitale, simplifiée.',
    authSubheading: 'Cafés et restaurants de Bordj Bou Arreridj. 6 tampons = 1 cadeau offert.',
    continueWithGoogle: 'Continuer avec Google',
    googleModalTitle: 'Connexion avec Google',
    googleModalSubtitle: 'Choisissez ou saisissez votre compte Gmail réel pour accéder à Pointili',
    realGmailRequired: 'Adresse Gmail réelle requise pour accéder',
    enterGmail: 'Votre adresse Gmail',
    enterFullName: 'Votre nom complet',
    enterPassword: 'Mot de passe du compte Google',
    googleAuthorize: 'Se connecter et ouvrir l\'application',
    authenticating: 'Authentification Google en cours...',

    adminTitle: 'Administration Pointili - Bordj Bou Arreridj',
    adminLoginTitle: 'Portail d\'administration sécurisé',
    usernameLabel: 'Nom d\'utilisateur',
    passwordLabel: 'Mot de passe',
    loginButton: 'Se connecter à l\'administration',
    overviewTab: 'Aperçu général',
    restaurantsTab: 'Établissements BBA',
    winnersTab: 'Historique des Gagnants',
    usersTab: 'Utilisateurs Enregistrés',
    totalRegisteredUsers: 'Utilisateurs réels enregistrés',
    totalRewardsWon: 'Récompenses gratuites distribuées',
    dailyScans: 'Scans du jour',
  },

  en: {
    appName: 'Pointili',
    appTagline: '6-circle digital loyalty stamp cards for Bordj Bou Arreridj cafes & restaurants',
    wilayaName: 'Bordj Bou Arreridj Province (34)',
    adminPortal: 'Admin Portal',
    installedOnDesk: 'Install on Home Screen',
    addToHomeScreen: 'Add Pointili to your phone\'s home screen',
    install: 'Install',

    tabCards: 'My Cards',
    tabScanner: 'Scan QR',
    tabProfile: 'Profile',

    dashboardTitle: 'Bordj Bou Arreridj Loyalty Stamp Cards',
    dashboardSubtitle: 'Scan the QR code at each visit, collect 6 stamps, and get your free meal or drink!',
    searchPlaceholder: 'Search cafe or restaurant in Bordj Bou Arreridj...',
    filterAll: 'All',
    filterCafes: 'Cafes & Roasteries ☕',
    filterFood: 'Restaurants & Burgers 🍔',
    filterReady: 'Rewards Ready 🎉',
    stampsProgress: 'Stamps Progress',
    stampsCountText: 'stamps of 6',
    zeroStampsNotice: 'New account: 0 stamps · Scan restaurant QR to stamp your first circle',
    scanToEarn: 'Scan QR Code to Add Stamp',
    viewOnMaps: 'View on Google Maps',
    claimReward: 'Claim Free Reward',
    rewardUnlocked: '🎉 Congrats! Free Reward Unlocked',
    stampsCompleted: '6/6 stamps completed!',
    noRestaurantsFound: 'No places found matching your search in Bordj Bou Arreridj',
    discoverMore: 'Discover More Places',

    circleStampBadge: '6 Stamp Circles',
    freeRewardAt6: 'Fill 6 circles to unlock your free meal or drink',
    scanToFillDots: 'Each QR scan stamps one circle',
    restaurantDetails: 'Venue Details & Location',
    addressLabel: 'Address',
    hoursLabel: 'Hours',
    neighborhoodLabel: 'Neighborhood',

    scannerTitle: 'Smart QR Scanner',
    scannerSubtitle: 'Point your camera at the cashier QR stand at any participating BBA restaurant',
    scanInstructions: 'Align the QR code within the frame',
    cameraActive: 'Camera active & ready',
    pointAtQR: 'Place QR code inside the box',
    instantSimulate: 'Instant Restaurant Simulation',
    orEnterCode: 'Or enter stamp secret code manually',
    codePlaceholder: 'Enter restaurant secret code...',
    submitCode: 'Verify Stamp',
    stampSuccess: 'New stamp added successfully! ⭐',
    stampAddedDesc: 'One more circle has been filled on your loyalty card.',
    rewardUnlockedCelebration: '🎊 Awesome! 6 stamps completed, your free reward is unlocked!',
    invalidCodeError: 'Invalid stamp code. Please verify and try again.',

    profileTitle: 'My Profile',
    profileSubtitle: 'Your authentic Google account and loyalty stamp balance',
    memberSince: 'Member since',
    loyaltyTier: 'Loyalty Tier',
    stampsCollected: 'Total Stamps Collected',
    rewardsClaimed: 'Free Rewards Claimed',
    languageSelect: 'App Language',
    languageSelectDesc: 'Select your preferred language (Arabic, French, English)',
    showHomeScreenIcon: 'Home Screen Desktop Icon',
    showHomeScreenDesc: 'How to install Pointili on your mobile home screen',
    logoutButton: 'Sign Out',
    logoutConfirm: 'Are you sure you want to sign out?',

    authHeading: 'Your digital stamp card, simplified.',
    authSubheading: 'Bordj Bou Arreridj cafes & restaurants. 6 stamps = Free meal or drink.',
    continueWithGoogle: 'Continue with Google',
    googleModalTitle: 'Sign in with Google',
    googleModalSubtitle: 'Choose or enter your real Gmail account to enter Pointili',
    realGmailRequired: 'Real Gmail address required for access',
    enterGmail: 'Your Gmail address',
    enterFullName: 'Your full name',
    enterPassword: 'Google account password for verification',
    googleAuthorize: 'Sign In and Enter App',
    authenticating: 'Authenticating with Google...',

    adminTitle: 'Pointili Administration - Bordj Bou Arreridj',
    adminLoginTitle: 'Secure Admin Portal',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    loginButton: 'Sign In to Admin',
    overviewTab: 'Overview',
    restaurantsTab: 'BBA Venues',
    winnersTab: 'Winners Log',
    usersTab: 'Registered Users',
    totalRegisteredUsers: 'Total Registered Users',
    totalRewardsWon: 'Total Free Rewards Won',
    dailyScans: 'Daily Scans Today',
  },
};
