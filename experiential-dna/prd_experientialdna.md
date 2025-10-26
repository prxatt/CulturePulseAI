# **PRODUCT REQUIREMENTS DOCUMENT**
## **Experiential DNA: Brand-to-Activation Engine**

---

## **EXECUTIVE SUMMARY**

**Product Name:** Experiential DNA  
**Tagline:** "Decode Any Brand Into Experience"  
**Build Time:** 3-4 hours  
**Core Value:** Instantly analyze any brand's digital presence and generate a comprehensive "Experiential DNA" framework—the blueprint for creating on-brand activations.

---

## **1. PROBLEM STATEMENT**

### **Pain Points:**
- Jack Morton wins a new client → Takes 2-3 weeks to understand brand essence
- Creative briefs miss nuanced brand personality
- Junior creatives struggle to translate brand guidelines into experiential concepts
- Inconsistent brand interpretation across different teams
- Slow onboarding process delays pitch development

### **The Gap:**
Brand guidelines tell you logo usage and color codes. They DON'T tell you:
- What should this brand's space *feel* like?
- How should attendees emotionally experience this brand?
- What sensory elements align with brand personality?
- What cultural references resonate with this brand?

### **User Personas:**

**Persona 1: New Business Team**
- Needs: Fast brand analysis for pitch preparation
- Pain: Limited time to research before RFP response
- Goal: Sound like brand insiders from day one

**Persona 2: Creative Director**
- Needs: Framework to guide creative team
- Pain: Team interprets brand differently, lacks cohesion
- Goal: Aligned vision across all deliverables

**Persona 3: Junior Creative/Producer**
- Needs: Understand client's brand without years of exposure
- Pain: Doesn't know where to start with new client
- Goal: Create concepts that feel authentically on-brand

---

## **2. SOLUTION OVERVIEW**

### **The Process:**

```
Input: Brand Website URL + Social Handles
   ↓
AI Analysis: Scrape & analyze digital presence
   ↓
Synthesis: Extract brand personality, values, aesthetic
   ↓
Translation: Convert to experiential framework
   ↓
Output: Comprehensive "Experiential DNA" Report
```

### **Core Components of DNA Profile:**

**1. BRAND ESSENCE ANALYSIS**
- Core values (AI-extracted from content)
- Personality archetypes (Hero, Creator, Sage, etc.)
- Tone of voice spectrum
- Cultural positioning

**2. VISUAL DNA**
- Color psychology and usage patterns
- Typography character
- Imagery style and composition
- Design system principles

**3. SPATIAL TRANSLATION**
- Recommended architectural language
- Material palette
- Lighting approach
- Spatial flow philosophy

**4. SENSORY PROFILE**
- Sound/music genre recommendations
- Scent associations
- Texture and material suggestions
- Temperature and atmosphere

**5. INTERACTION STYLE**
- Engagement approach (active vs. passive)
- Technology integration level
- Social vs. solitary experience
- Formality spectrum

**6. ACTIVATION CONCEPTS**
- 3-5 AI-generated experiential ideas
- Tailored to brand DNA
- Scalable across budget levels
- Channel-specific applications

---

## **3. TECHNICAL ARCHITECTURE**

### **Data Collection (Web Scraping):**

**Sources to Analyze:**
1. **Official Website**
   - Homepage copy and messaging
   - About/Mission pages
   - Product descriptions
   - Visual asset library

2. **Social Media**
   - Instagram: Visual aesthetic, caption tone
   - LinkedIn: Professional positioning
   - Twitter/X: Brand voice and engagement style
   - TikTok: Cultural relevance and humor

3. **Recent Campaigns**
   - Press releases
   - Campaign landing pages
   - Video content analysis

### **AI Processing Pipeline:**

```javascript
// 1. Data Collection
const websiteContent = await scrapeWebsite(url);
const socialContent = await scrapeSocial(handles);
const campaignContent = await findRecentCampaigns(brand);

// 2. AI Analysis (Claude API)
const brandAnalysis = await analyzeWithClaude({
  websiteText: websiteContent.text,
  visualStyle: websiteContent.images,
  socialTone: socialContent.captions,
  campaigns: campaignContent
});

// 3. Experiential Translation
const dnaProfile = await generateExperientialDNA(brandAnalysis);

// 4. Concept Generation
const activationConcepts = await generateActivations(dnaProfile);

// 5. Output Formatting
const report = formatDNAReport(dnaProfile, activationConcepts);
```

---

## **4. BUILD APPROACH (3-4 Hours)**

### **Simplified Version for 12-Hour Build:**

**Don't build live scraping—pre-generate 3 profiles**

### **3 Jack Morton Client Profiles to Include:**

**1. META/FACEBOOK**
**2. CADILLAC**
**3. ESPN**

### **Manual Research Process (Per Brand):**

**30 minutes per brand = 1.5 hours total**

1. Visit website, read About/Mission (10 min)
2. Analyze Instagram feed (last 20 posts) (10 min)
3. Watch 2-3 recent campaign videos (5 min)
4. Note colors, typography, messaging themes (5 min)

Then use Claude to synthesize into DNA profile.

---

## **5. VISUAL DESIGN SYSTEM**

### **Design Philosophy:**
- **Diagnostic Report Aesthetic**: Feels like genetic analysis/medical report
- **Data Visualization Heavy**: Charts, graphs, color swatches
- **Modular Cards**: Each DNA component is scannable
- **Professional + Scientific**: Jack Morton can show clients

### **Color Palette:**
```css
Primary: #2563eb (Blue - Professional)
Secondary: #8b5cf6 (Purple - Creative)
Accent: #10b981 (Green - Positive insight)
Background: #f8fafc (Off-white)
Surface: #ffffff (White cards)
Text: #1e293b (Dark slate)
Border: #e2e8f0 (Light gray)
```

### **Layout Structure:**

**LANDING PAGE:**
```
┌─────────────────────────────────────────┐
│     EXPERIENTIAL DNA                    │
│     Decode Any Brand Into Experience    │
│                                         │
│  "Every brand has unique DNA. We decode│
│   it into actionable experiential      │
│   frameworks."                         │
│                                         │
│  [View Sample Profiles]                │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │Meta │ │Cadil│ │ESPN │              │
│  │     │ │lac  │ │     │              │
│  └─────┘ └─────┘ └─────┘              │
└─────────────────────────────────────────┘
```

**DNA PROFILE PAGE:**
```
┌─────────────────────────────────────────┐
│ [← Back] EXPERIENTIAL DNA PROFILE       │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │  META                               ││
│ │  Technology • Social Connection     ││
│ │  ────────────────────────────────── ││
│ │  Generated: Oct 2025                ││
│ └─────────────────────────────────────┘│
│                                         │
│ BRAND ESSENCE                           │
│ ┌─────────────────────────────────────┐│
│ │ Core Values:                        ││
│ │ • Connection                        ││
│ │ • Innovation                        ││
│ │ • Community                         ││
│ │ • Accessibility                     ││
│ │                                     ││
│ │ Personality Archetype: THE CONNECTOR││
│ │ Tone: Optimistic, Inclusive, Forward││
│ │ Cultural Position: Progressive Tech ││
│ └─────────────────────────────────────┘│
│                                         │
│ VISUAL DNA                              │
│ ┌─────────────────────────────────────┐│
│ │ Color Palette:                      ││
│ │ ▀▀ ▀▀ ▀▀ ▀▀ ▀▀                     ││
│ │ Blue Primary, White, Cool Grays     ││
│ │                                     ││
│ │ Typography: Sans-serif, Clean       ││
│ │ Imagery: People-first, Authentic    ││
│ │ Design: Modern, Accessible          ││
│ └─────────────────────────────────────┘│
│                                         │
│ SPATIAL TRANSLATION                     │
│ ┌─────────────────────────────────────┐│
│ │ Architectural Language:             ││
│ │ → Open, flowing spaces              ││
│ │ → Circular/curved elements          ││
│ │ → Multiple "connection points"      ││
│ │                                     ││
│ │ Materials: Glass, light wood, fabric││
│ │ Lighting: Soft, warm, inviting      ││
│ │ Flow: Non-linear, exploratory       ││
│ └─────────────────────────────────────┘│
│                                         │
│ SENSORY PROFILE                         │
│ ┌─────────────────────────────────────┐│
│ │ Sound: Upbeat electronic, diverse   ││
│ │ Scent: Clean linen, subtle freshness││
│ │ Texture: Smooth tech + soft fabric  ││
│ │ Atmosphere: Energized but comfortable││
│ └─────────────────────────────────────┘│
│                                         │
│ INTERACTION STYLE                       │
│ ┌─────────────────────────────────────┐│
│ │ Engagement: Active, participatory   ││
│ │ Technology: High integration        ││
│ │ Social: Communal experiences        ││
│ │ Formality: Casual, approachable     ││
│ └─────────────────────────────────────┘│
│                                         │
│ ACTIVATION CONCEPTS                     │
│ ┌─────────────────────────────────────┐│
│ │ 1. "Connection Pods"                ││
│ │    Intimate spaces for 2-4 people   ││
│ │    to share stories via VR          ││
│ │                                     ││
│ │ 2. "Community Canvas"               ││
│ │    Collaborative art wall where     ││
│ │    attendees build shared vision    ││
│ │                                     ││
│ │ 3. "Future Forum"                   ││
│ │    Circular theater showcasing      ││
│ │    community-driven content         ││
│ │                                     ││
│ │ [View Full Concepts →]              ││
│ └─────────────────────────────────────┘│
│                                         │
│ [Download PDF] [Share] [Generate More] │
└─────────────────────────────────────────┘
```

---

## **6. SAMPLE DNA PROFILES (Content Ready to Use)**

### **PROFILE 1: META/FACEBOOK**

**BRAND ESSENCE**
- **Core Values:** Connection, Innovation, Community, Openness
- **Personality Archetype:** The Connector (brings people together)
- **Tone:** Optimistic, Inclusive, Forward-thinking, Approachable
- **Cultural Position:** Progressive technology enabling human connection

**VISUAL DNA**
- **Color Palette:** Meta Blue (#0866FF), White, Cool Grays, Gradient accents
- **Typography:** Clean sans-serif (Optimistic Display), highly readable
- **Imagery Style:** Diverse people, authentic moments, technology enhancing life
- **Design Principles:** Accessible, modern, emotionally resonant

**SPATIAL TRANSLATION**
- **Architectural Language:** Open flowing spaces, circular/curved elements suggesting connection
- **Materials:** Glass (transparency), light wood (warmth), soft fabrics (comfort), sleek tech
- **Lighting:** Soft ambient with accent spotlights, creating warm gathering atmosphere
- **Spatial Flow:** Non-linear exploration, multiple "conversation" zones, no dead ends

**SENSORY PROFILE**
- **Sound:** Upbeat electronic, diverse global music, conversational ambient noise
- **Scent:** Clean linen, subtle freshness (like new technology unboxing)
- **Texture:** Smooth screens + soft textiles, warm to touch
- **Atmosphere:** Energized but comfortable, inviting participation

**INTERACTION STYLE**
- **Engagement:** Highly interactive, participatory experiences
- **Technology:** Seamlessly integrated (AR/VR), feels natural not forced
- **Social Dynamic:** Designed for groups, encourages conversation
- **Formality:** Casual and approachable, removes barriers

**ACTIVATION CONCEPTS**
1. **"Connection Pods"** - Intimate VR spaces for 2-4 people to share stories from different parts of the world
2. **"Community Canvas"** - Large-scale collaborative digital art wall where attendees co-create
3. **"Future Forum"** - Circular theater showcasing user-generated content and innovation
4. **"Portal Rooms"** - Step through doorways to experience different global communities
5. **"Shared Reality Lab"** - Hands-on AR experiences showing how technology connects people

---

### **PROFILE 2: CADILLAC**

**BRAND ESSENCE**
- **Core Values:** American Luxury, Innovation, Heritage, Bold Confidence
- **Personality Archetype:** The Leader (sophisticated authority)
- **Tone:** Aspirational, Confident, Refined, Progressive
- **Cultural Position:** American luxury redefined for electric future

**VISUAL DNA**
- **Color Palette:** Black, Metallic Silver/Gold, Deep Burgundy, Electric Blue accents
- **Typography:** Bold serif + modern sans combination, strong hierarchy
- **Imagery Style:** Dramatic angles, cinematic lighting, architectural elements
- **Design Principles:** Premium materials, commanding presence, attention to detail

**SPATIAL TRANSLATION**
- **Architectural Language:** Strong geometry, dramatic vertical elements, commanding scale
- **Materials:** Polished metal, leather, glass, carbon fiber, premium woods
- **Lighting:** Dramatic spotlighting, theatrical shadows, high contrast
- **Spatial Flow:** Linear progression building to climax (hero vehicle reveal)

**SENSORY PROFILE**
- **Sound:** Jazz, orchestral strings, engine sounds as art
- **Scent:** Leather interior, subtle automotive notes, premium materials
- **Texture:** Tactile luxury (soft leather, cool metal, smooth glass)
- **Atmosphere:** Sophisticated, powerful, refined

**INTERACTION STYLE**
- **Engagement:** Guided journey, curated experience
- **Technology:** High-tech but intuitive, enhances don't dominates
- **Social Dynamic:** Individual appreciation with shared pride
- **Formality:** Upscale but welcoming, aspirational accessibility

**ACTIVATION CONCEPTS**
1. **"Electric Journey Pavilion"** - Test drive meets art installation, showcasing EV future
2. **"Legacy Timeline"** - Heritage storytelling with VR of Cadillac's iconic moments
3. **"Craftsmanship Studio"** - Hands-on exploration of materials and manufacturing
4. **"Cadillac Social Club"** - Exclusive lounge for owners and enthusiasts to connect
5. **"American Road Theater"** - 270° immersive film about American automotive innovation

---

### **PROFILE 3: ESPN**

**BRAND ESSENCE**
- **Core Values:** Competition, Excellence, Passion, Entertainment
- **Personality Archetype:** The Hero (celebrates achievement)
- **Tone:** Energetic, Authoritative, Exciting, Inclusive
- **Cultural Position:** The definitive voice of sports culture

**VISUAL DNA**
- **Color Palette:** ESPN Red (#D20000), Black, White, Yellow accents
- **Typography:** Bold sans-serif, high impact, dynamic angles
- **Imagery Style:** Action shots, iconic moments, emotional reactions
- **Design Principles:** High energy, movement, drama, celebration

**SPATIAL TRANSLATION**
- **Architectural Language:** Stadium-inspired, dynamic angles, asymmetry
- **Materials:** Industrial metals, LED screens, athletic surfaces (turf, court flooring)
- **Lighting:** Bright spotlights, dramatic shadows like arena lighting
- **Spatial Flow:** Multiple "zones" like sports sections, high-energy circulation

**SENSORY PROFILE**
- **Sound:** Crowd roars, whistle sounds, pump-up music, sports commentary
- **Scent:** Fresh-cut grass, popcorn, new equipment
- **Texture:** Athletic materials (rubber, textured metals, sports equipment)
- **Atmosphere:** Competitive energy, celebratory, high-adrenaline

**INTERACTION STYLE**
- **Engagement:** Competitive games, skill challenges, leaderboards
- **Technology:** Real-time stats, gamification, instant replay experiences
- **Social Dynamic:** Team competition, friendly rivalry
- **Formality:** Casual sports bar atmosphere, inclusive fan culture

**ACTIVATION CONCEPTS**
1. **"The Performance Zone"** - Interactive sports challenges with instant stats and leaderboards
2. **"Iconic Moments Theater"** - Relive greatest sports moments in immersive replay
3. **"Fan HQ"** - Multi-screen viewing party with live commentary and social integration
4. **"Training Ground"** - Work with pro athlete trainers in mini skill clinics
5. **"Champions Gallery"** - AR-enhanced trophy and memorabilia showcase

---

## **7. BUILD SEQUENCE (3-4 Hours)**

### **Hour 1: Research & Content**
```
✓ Research Meta (website, social, campaigns)
✓ Research Cadillac (website, social, campaigns)
✓ Research ESPN (website, social, campaigns)
✓ Take notes on brand personality, visual style
✓ Screenshot color palettes, typography examples
```

### **Hour 2: AI Analysis & DNA Generation**
```
✓ Write Claude prompts for brand analysis
✓ Generate comprehensive DNA profiles
✓ Create activation concept ideas (3-5 per brand)
✓ Organize into structured format
✓ Validate accuracy against brand reality
```

### **Hour 3: Build Interface**
```
✓ Create HTML structure for profile pages
✓ Design card-based layout
✓ Add brand logos and visual elements
✓ Implement navigation between profiles
✓ Style with professional aesthetic
```

### **Hour 4: Polish & Deploy**
```
✓ Add comparison features
✓ Create downloadable PDF option
✓ Build methodology page
✓ Mobile responsiveness
✓ Deploy to Vercel
```

---

## **8. TECHNICAL IMPLEMENTATION**

### **File Structure:**
```
experiential-dna/
├── index.html (landing/selector)
├── meta.html (Meta profile)
├── cadillac.html (Cadillac profile)
├── espn.html (ESPN profile)
├── methodology.html
├── css/
│   ├── main.css
│   └── profile.css
├── js/
│   ├── navigation.js
│   └── pdf-export.js (optional)
├── data/
│   └── profiles.json (structured data)
└── assets/
    ├── logos/
    └── images/
```

### **Key Functions:**

```javascript
// Load profile data
function loadProfile(brandId) {
  const profile = profiles[brandId];
  renderBrandEssence(profile.essence);
  renderVisualDNA(profile.visual);
  renderSpatialTranslation(profile.spatial);
  renderSensoryProfile(profile.sensory);
  renderInteractionStyle(profile.interaction);
  renderActivationConcepts(profile.concepts);
}

// Generate PDF export
function exportToPDF(profileId) {
  // Use jsPDF or html2pdf.js
  const element = document.getElementById('profile-container');
  html2pdf().from(element).save(`${profileId}-dna-profile.pdf`);
}

// Compare two profiles
function compareProfiles(brand1, brand2) {
  // Side-by-side comparison view
  // Highlight differences in DNA
}
```

---

## **9. DEMO SCRIPT FOR JESSE**

**Opening (30 seconds):**
"Experiential DNA solves the new client onboarding problem. When Jack Morton wins Meta or Cadillac, it takes weeks to understand the brand deeply enough to create authentic activations. This tool does it instantly."

**Profile Walkthrough (2 minutes):**
"Let's look at Meta. I analyzed their website, social media, and recent campaigns. The AI extracted brand essence: connection, innovation, community. Then it translated that into experiential language—what should a Meta space FEEL like? Open, flowing, circular elements. What materials? Glass for transparency, soft fabrics for comfort."

**Activation Concepts (2 minutes):**
"Based on the DNA, it generates activation concepts. For Meta: 'Connection Pods'—intimate VR spaces where strangers share stories. 'Community Canvas'—collaborative digital art. Each concept is rooted in the brand's actual DNA, not generic creativity."

**Multi-Client Demo (1 minute):**
"Now look at Cadillac—completely different DNA. Dramatic, bold, luxury materials. The AI knows a Cadillac activation should feel powerful and refined, not playful and communal like Meta. Same tool, authentic to each brand."

**The Value (1 minute):**
"Three immediate benefits: First, onboard new clients 90% faster. Second, align entire creative team with one brand framework. Third, junior team members create senior-level work because they have the right foundation."

**The Ask (30 seconds):**
"This is using three brands I manually researched. Imagine a production version that can analyze ANY brand in 10 minutes. Want to test it on your next pitch?"

---

## **10. SUCCESS METRICS**

### **Demo Goals:**
- ✅ Jesse recognizes the onboarding time savings
- ✅ Says "Our junior creatives need this"
- ✅ Asks about white-labeling for client deliverables
- ✅ Wants to test on upcoming pitch

### **Production Metrics:**
- Client onboarding time: 2 weeks → 2 hours (95% reduction)
- Brand consistency score: Improve by 40%
- Junior creative output quality: Match senior level
- Pitch win rate: Increase 10-15% (better brand understanding)

---

## **11. FINAL DELIVERABLE CHECKLIST**

Before demo:
- [ ] 3 complete DNA profiles (Meta, Cadillac, ESPN)
- [ ] Each profile has all 6 sections populated
- [ ] Visual elements (color swatches, examples) included
- [ ] 3-5 activation concepts per brand
- [ ] Clean, professional design
- [ ] Mobile responsive
- [ ] Fast load times
- [ ] Navigation works smoothly
- [ ] Methodology page explains process
- [ ] Demo script rehearsed

---

**BUILD THIS THIRD. Strategic depth impresses decision-makers.**