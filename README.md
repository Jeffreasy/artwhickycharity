# Art Whisky Charity

Een moderne, interactieve website voor het Art Whisky Charity project, gebouwd met Next.js 14, TailwindCSS, en React. Deze site combineert kunst, whisky en liefdadigheid in een stijlvolle digitale ervaring die bezoekers inspireert om deel te nemen en te doneren.

## 🌟 Functionaliteiten

### Website Architectuur
- **Next.js 14 App Router**: Moderne routing met server components
- **Responsive Design**: Volledig responsief ontwerp voor alle apparaten
- **Server Components**: Verbeterde prestaties door server-side rendering
- **Optimale Laadtijden**: Met ingebouwde loading states en suspense
- **SEO Optimalisatie**: Geoptimaliseerd voor zoekmachines
- **Error Handling**: Graceful error afhandeling met custom error pages

### Gebruikerservaring
- **Interactieve UI**: Met animaties en vloeiende overgangen
- **Whisky Showcase**: Uitgebreide whisky galerij met details
- **Kunst Galerij**: Showcasing van kunstwerken met Cloudinary integratie
- **Liefdadigheidsinfo**: Overzicht van liefdadigheidsinitiatieven
- **Shop Functionaliteit**: E-commerce functionaliteit met winkelwagen
- **GDPR Compliant**: Met cookie consent banner en privacybeleid

### Analytics & Monitoring
- **Vercel Analytics**: Geïntegreerde website metrics
- **Google Analytics**: Uitgebreide gebruikersanalyse
- **Sentry Integration**: Error tracking en performance monitoring
- **GDPR-Compliant**: Cookie consent en data privacy controls

### Technische Features
- **TypeScript**: Volledig getypeerd voor betere ontwikkelingservaring
- **Tailwind CSS**: Moderne en flexibele styling
- **Responsive Design**: Werkt op alle apparaten en schermformaten
- **Animation Libraries**: GSAP en Framer Motion voor hoogwaardige animaties
- **Cloudinary Integration**: Voor afbeeldingenbeheer en optimalisatie
- **Supabase**: Voor database en serverless functies

## 📋 Vereisten

- Node.js 18.17 of hoger
- npm of yarn
- Git

## 🚀 Installatie

Clone de repository:
```bash
git clone https://github.com/Jeffreasy/artwhickycharity.git
cd artwhickycharity
```

Installeer dependencies:
```bash
npm install
# of
yarn install
```

Kopieer het voorbeeld configuratie bestand:
```bash
cp .env.example .env.local
```

Configureer de omgevingsvariabelen in `.env.local`:
```
# Supabase configuratie
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary configuratie
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Sentry configuratie
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# Analytics configuratie
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# WFC Email Service configuratie
WFC_BACKEND_URL=https://dklemailservice.onrender.com
WFC_API_KEY=your_wfc_api_key
WFC_ADMIN_EMAIL=admin@whiskyforcharity.com
WFC_SITE_URL=https://whiskyforcharity.com

# PDF Service configuratie
HTML_TO_PDF_API_KEY=your_html2pdf_api_key
```

## 🏃‍♂️ Gebruik

### Development Server Starten

```bash
npm run dev
# of
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser om de development versie te bekijken.

### Productie Build

```bash
npm run build
# of
yarn build
```

### Productie Server Starten

```bash
npm run start
# of
yarn start
```

## 🧩 Projectstructuur

```
artwhickycharity/
├── .next/               # Next.js build output
├── app/                 # App router pagina's en routes
│   ├── about/           # Over ons pagina
│   ├── api/             # API routes
│   ├── art/             # Kunstwerken pagina
│   ├── charity/         # Liefdadigheid pagina
│   ├── components/      # App-specifieke componenten
│   ├── config/          # App configuraties
│   ├── gegevenspage/    # Gegevens pagina
│   ├── home/            # Homepage componenten
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility bibliotheken
│   ├── shop/            # Shop pagina
│   ├── types/           # TypeScript type definities
│   ├── whisky/          # Whisky pagina
│   ├── favicon.ico      # Site favicon
│   ├── global-error.tsx # Global error component
│   ├── globals.css      # Global styling
│   ├── layout.tsx       # Root layout
│   ├── loading.tsx      # Loading component
│   ├── not-found.tsx    # 404 pagina
│   └── page.tsx         # Homepage
├── components/          # Gedeelde React componenten
├── contexts/            # React context providers
│   ├── CartContext.tsx  # Winkelwagen context
│   └── MenuContext.tsx  # Menu state context
├── globalComponents/    # Globale UI componenten
│   ├── admin/           # Admin componenten
│   └── ui/              # UI componenten
│       ├── CartButton/      # Winkelwagen button
│       ├── CookieConsent/   # Cookie consent banner
│       ├── Footer/          # Website footer
│       ├── FullscreenMenu/  # Fullscreen menu
│       ├── Homebutton/      # Home navigatie button
│       ├── Loading/         # Loading indicators
│       ├── Modal/           # Modale dialogen
│       └── Navigation/      # Navigatiebalk
├── lib/                 # Library code en utilities
├── scripts/             # Build en deployment scripts
├── types/               # Globale TypeScript types
├── utils/               # Utility functies
├── .env                 # Environment variabelen
├── .eslintrc.json      # ESLint configuratie
├── .gitignore          # Git ignore bestand
├── instrumentation.ts  # Next.js instrumentatie
├── next-env.d.ts       # Next.js TypeScript types
├── next.config.js      # Next.js configuratie
├── package.json        # Project afhankelijkheden
├── postcss.config.js   # PostCSS configuratie
├── sentry.client.config.ts  # Sentry client configuratie
├── sentry.edge.config.ts    # Sentry edge configuratie
├── sentry.server.config.ts  # Sentry server configuratie
├── tailwind.config.ts  # Tailwind CSS configuratie
├── tsconfig.json       # TypeScript configuratie
└── vercel.json         # Vercel configuratie
```

## 📧 Email Service

De applicatie maakt gebruik van een custom email service genaamd Whisky For Charity (WFC) Email Service voor het versturen van orderbevestigingen en administratieve notificaties.

### Email Architectuur
- **Dual Email Service**: De applicatie ondersteunt zowel de WFC Email Service als een legacy DKL Email Service
- **Modulaire Opzet**: Email functionaliteit is geïsoleerd in dedicated API routes voor eenvoudige uitbreidbaarheid
- **Template-Based**: Emails worden gegenereerd met HTML templates voor consistente styling
- **Error Handling**: Uitgebreide error handling en logging voor betrouwbare email operaties
- **Admin Notificaties**: Zowel klanten als administrators ontvangen notificaties bij nieuwe bestellingen

### WFC Email Service
- **API Routes**:
  - `/api/orders/send-emails-wfc`: Primaire route voor het versturen van orderbevestigingen
  - `/api/test-wfc-email`: Test endpoint voor het testen van de email service
  
- **Data Flow**:
  1. Bij bestelling wordt `CheckoutModal` component geactiveerd
  2. Formuliergegevens worden verzameld en opgeslagen in Supabase
  3. De email service wordt aangeroepen met order ID en klantgegevens
  4. Volledige ordergegevens worden opgehaald uit Supabase
  5. Data wordt geformatteerd volgens backend specificaties (snake_case)
  6. Request wordt verzonden naar de WFC backend service
  7. Backend genereert en verzendt emails op basis van HTML templates
  8. Ordergegevens worden gemarkeerd als 'emails_sent' in de database

- **Configuratie**:
  - WFC_BACKEND_URL: URL van de WFC email service backend
  - WFC_API_KEY: Authenticatie sleutel voor de WFC API
  - WFC_ADMIN_EMAIL: Email voor administratieve notificaties
  - WFC_SITE_URL: Website URL voor linkgeneratie in emails

- **Email Templates**:
  - Customer Template: `wfc_order_confirmation.html`
  - Admin Template: `wfc_order_admin.html`
  - Beide templates ondersteunen dynamische data en responsive design

- **Security Features**:
  - API Key authenticatie via headers
  - Timeout mechanisme voor request beveiliging (10 seconden)
  - Build-time skipping voor Vercel deployment integriteit

### Email Service Integratie
- **Supabase Integratie**: Email service haalt order- en productgegevens op uit Supabase
- **Vercel Compatibiliteit**: Speciale afhandeling voor build-time en productie-omgevingen
- **Queue Mechanisme**: Asynchroon versturen van emails om UI responsiviteit te behouden
- **Email Status Tracking**: Frontend geeft emailstatus weer aan gebruikers

### Email Interface
- **Gebruikersweergave**: Succes/fout meldingen in de UI na bestelling
- **Admin Dashboard**: Toegang tot emailstatus en verzendhistorie
- **Debugging Tools**: Logging en error informatie voor ontwikkeling

## 🛠️ Belangrijkste Technologieën

- **Frontend**:
  - [Next.js 14](https://nextjs.org/) - React framework met App Router
  - [React 18](https://reactjs.org/) - JavaScript library voor UI
  - [TypeScript](https://www.typescriptlang.org/) - JavaScript met types
  - [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Framer Motion](https://www.framer.com/motion/) - Animatie library
  - [GSAP](https://greensock.com/gsap/) - Professionele animatie library
  - [Swiper](https://swiperjs.com/) - Modern mobile touch slider

- **Analytics & Monitoring**:
  - [Vercel Analytics](https://vercel.com/analytics) - Geïntegreerde web analytics
  - [Google Analytics](https://analytics.google.com/) - Uitgebreide gebruikersanalyse
  - [Sentry](https://sentry.io/) - Error tracking en performance monitoring

- **Hosting & Infrastructuur**:
  - [Vercel](https://vercel.com/) - Hosting platform
  - [Supabase](https://supabase.io/) - Open source Firebase alternatief

- **Media Management**:
  - [Cloudinary](https://cloudinary.com/) - Cloud-based afbeeldingenbeheer

## 🖼️ Pagina's

- **Home**: Hoofdpagina met interactieve secties en hero
- **Art**: Kunstgalerij met afbeeldingen en details
- **Whisky**: Showcase van whiskies met informatie
- **Charity**: Informatie over liefdadigheidsinitiatieven
- **Shop**: E-commerce functionaliteit
- **About**: Over het project en het team

## 🔍 Gebruikersflows

1. **Home Verkenning**:
   - Landing op homepage
   - Interactieve hero bekijken
   - Navigeren naar secties via menu

2. **Whisky Ontdekking**:
   - Browsen door whisky collectie
   - Bekijken van whisky details
   - Toevoegen aan winkelwagen

3. **Kunst Verkenning**:
   - Browsen door kunstgalerij
   - Bekijken van kunstwerk details
   - Leren over de kunstenaars

4. **Liefdadigheid Leren**:
   - Informatie over verbonden goede doelen
   - Impact van donaties begrijpen
   - Mogelijkheden tot bijdragen ontdekken

5. **Winkelen**:
   - Producten toevoegen aan winkelwagen
   - Winkelwagen bekijken en bewerken
   - Afronden van bestelling

6. **Bestelproces & Bevestiging**:
   - Invoeren van klantgegevens in checkout modal
   - Bevestigen van bestelling
   - Ontvangen van bevestigingsemail
   - Bekijken en downloaden van factuur als PDF
   - Email ontvangstbevestiging voor klant en admin

## 📱 Responsive Design

De website is volledig responsief en geoptimaliseerd voor:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobiel (320px - 767px)

## 🔄 State Management

- **CartContext**: Beheer van winkelwagen state
- **MenuContext**: Beheer van menu en navigatie state
- **React Hooks**: Component-specifieke state

## 🛣️ Routing

De applicatie gebruikt Next.js 14 App Router met de volgende routes:

- `/` - Homepage
- `/about` - Over ons
- `/art` - Kunstgalerij
- `/whisky` - Whisky showcase
- `/charity` - Liefdadigheids informatie
- `/shop` - Winkel
- `/gegevenspage` - Gebruikersgegevens

## 🔧 API Routes

De applicatie bevat API routes onder `/app/api/`:

- `/api/social` - Sociale media integratie
- `/api/about-content` - Content voor about pagina
- `/api/checkout` - E-commerce checkout functionaliteit
- `/api/circle-hero` - Data voor hero sectie
- `/api/orders/send-emails-wfc` - WFC Email Service voor orderbevestigingen
- `/api/orders/send-emails-dkl` - Legacy DKL Email Service (backup)
- `/api/test-wfc-email` - Test endpoint voor de WFC Email Service
- `/api/generate-pdf` - PDF generatie voor facturen

## 📊 Analytics & Monitoring

De website is uitgerust met moderne monitoring tools:

1. **Vercel Analytics**:
   - Pageviews tracking
   - User journey analyses
   - Performance metrics

2. **Google Analytics**:
   - Gedetailleerde gebruikersgegevens
   - Conversion tracking
   - Event monitoring

3. **Sentry**:
   - Error tracking
   - Performance monitoring
   - Issue alerts

## 🔒 Privacy & Compliance

De website is GDPR-compliant met:

- Cookie consent banner
- Privacy policy
- Data tracking controls
- Opt-out mogelijkheden

## 🧪 Browser Support

De website is getest op en ondersteunt:

- Chrome (laatste 2 versies)
- Firefox (laatste 2 versies)
- Safari (laatste 2 versies)
- Edge (laatste 2 versies)
- iOS Safari
- Android Chrome

## 🤝 Bijdragen

Bijdragen aan het project zijn welkom! Volg deze stappen:

1. Fork de repository
2. Maak een feature branch:
   ```bash
   git checkout -b feature/nieuwe-feature
   ```
3. Commit je wijzigingen:
   ```bash
   git commit -m 'Voeg nieuwe feature toe'
   ```
4. Push naar de branch:
   ```bash
   git push origin feature/nieuwe-feature
   ```
5. Open een Pull Request

### Ontwikkelingsrichtlijnen

- Volg de bestaande codeerstijl
- Voeg tests toe voor nieuwe functionaliteit waar mogelijk
- Zorg voor responsieve designs voor alle nieuwe UI componenten
- Update documentatie waar nodig

## 📝 Licentie

Copyright © 2025 Art Whisky Charity. Alle rechten voorbehouden.

## 👥 Team

- Jeffrey - Frontend Developer en Project Lead
- [Toevoegen van andere teamleden indien van toepassing]

## 🔒 Admin Dashboard

De applicatie bevat een beveiligde admin dashboard die toegankelijk is via een login-systeem. De admin sectie is gebouwd met Supabase Auth voor veilige authenticatie.

### Admin Architectuur
- **Supabase Auth**: Veilige authenticatie met email/wachtwoord
- **Middleware Protection**: Beveiligde routes via Next.js middleware
- **AuthProvider Context**: React context voor authenticatiestatus
- **Dashboard Interface**: Overzicht van orders, producten en statistieken

### Admin Routes
- `/admin/login`: Login pagina voor administrators
- `/admin/dashboard`: Hoofddashboard met overzichten
- `/admin/*`: Alle admin routes zijn beveiligd

### Admin Setup
1. Maak een gebruiker aan in Supabase Authentication
2. Ken admin rechten toe aan de gebruiker
3. Gebruik de login pagina om toegang te krijgen tot het dashboard

### Admin Features
- **Orders Beheer**: Bekijk en beheer bestellingen
- **Product Management**: Producten toevoegen en bewerken
- **Statistieken**: Dashboard met belangrijke statistieken
- **Beveiligde Toegang**: Alleen voor geautoriseerde gebruikers

### Admin Configuratie
Om de admin functionaliteit te configureren, voeg de volgende omgevingsvariabelen toe:
```
# Supabase Auth configuratie
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

Gebouwd met ❤️ voor Art Whisky Charity 