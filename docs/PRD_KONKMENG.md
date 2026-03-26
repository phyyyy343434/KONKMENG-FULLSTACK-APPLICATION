# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## KONKMENG - Bilingual AI Code Analysis Platform

**Version:** 1.0  
**Date:** March 25, 2026  
**Author:** PHE SOPHY  
**Status:** Production Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Overview
KONKMENG is a bilingual AI-powered code analysis platform designed specifically for Khmer developers. It provides instant code explanations, error detection, and line-by-line breakdowns in both Khmer and English languages.

### 1.2 Product Vision
To become the leading educational coding platform for Khmer developers, removing language barriers and accelerating learning for 50,000+ developers in Cambodia.

### 1.3 Success Metrics
- **Target Users:** 50,000+ Khmer developers
- **Response Time:** < 1 second
- **Languages Supported:** 15+ programming languages
- **User Satisfaction:** 95%+ positive feedback
- **Uptime:** 99.9%

---

## 2. PROBLEM STATEMENT

### 2.1 Current Challenges

**Challenge 1: Language Barrier**
- 90% of coding resources are in English
- Khmer developers spend 2-3 hours daily translating documentation
- Error messages are difficult to understand
- Learning curve is steep for non-English speakers

**Challenge 2: Lack of Khmer Teachers**
- Only 1 Khmer programming teacher per 1,000 students
- Private tutors cost $20-50/hour (expensive for students)
- Limited access to quality coding education
- No instant help available 24/7

**Challenge 3: Slow Debugging Process**
- Beginners waste 2-3 hours on simple syntax errors
- Trial and error approach is inefficient
- No structured learning path
- Frustration leads to giving up

**Challenge 4: English-Only AI Tools**
- ChatGPT, GitHub Copilot only explain in English
- Not helpful for Khmer beginners
- No cultural context or appropriate examples
- Creates confusion instead of clarity

### 2.2 Impact
- 50,000+ Khmer developers struggle daily
- High dropout rate in coding bootcamps
- Slower career progression
- Limited tech industry growth in Cambodia

---

## 3. SOLUTION

### 3.1 Product Description
KONKMENG is a web-based platform that uses AI to analyze code and provide bilingual explanations. Users can paste their code, select their preferred language (Khmer or English), and receive instant, structured feedback.

### 3.2 Key Features

**Feature 1: Bilingual Code Analysis**
- Instant switching between Khmer and English
- Custom AI prompts for each language
- Culturally appropriate examples
- Technical terms in both languages

**Feature 2: Line-by-Line Explanations**
- Every line of code explained individually
- Clear, concise descriptions
- Educational approach (not just answers)
- Helps users understand HOW code works

**Feature 3: Error Detection & Fixing**
- Automatic error identification
- Shows corrected code
- Explains what was wrong and why
- Teaches best practices

**Feature 4: 15+ Programming Languages**
- JavaScript, Python, Java, C++, TypeScript
- PHP, Ruby, Go, Rust, Swift, Kotlin
- SQL, HTML, CSS, and more
- Syntax highlighting for all languages

**Feature 5: Real-Life Analogies**
- Makes technical concepts easy to understand
- Uses everyday examples (library, cooking, building)
- Perfect for beginners
- Culturally relevant for Khmer users

**Feature 6: User Authentication**
- Secure registration and login
- Email verification
- Password reset functionality
- JWT-based authentication

**Feature 7: Beautiful Modern UI**
- Glass-morphism design
- Floating animations
- Fully responsive (mobile, tablet, desktop)
- Dark code editor with syntax highlighting

---

## 4. TARGET AUDIENCE

### 4.1 Primary Users

**User Persona 1: Computer Science Student**
- Age: 18-25
- English Level: Beginner to Intermediate
- Needs: Help with assignments, understanding concepts
- Pain Points: Language barrier, no teacher available 24/7
- Goals: Pass exams, understand code deeply

**User Persona 2: Self-Taught Developer**
- Age: 20-35
- English Level: Beginner to Intermediate
- Needs: Learn programming without formal education
- Pain Points: No mentor, slow debugging, confusion
- Goals: Get a job as developer, build projects

**User Persona 3: Junior Developer**
- Age: 22-30
- English Level: Intermediate
- Needs: Debug code faster, learn best practices
- Pain Points: Slow debugging, no senior to ask
- Goals: Improve skills, deliver projects on time

### 4.2 Secondary Users
- Coding bootcamp instructors
- Tech company managers
- Freelance developers
- University professors

---

## 5. FUNCTIONAL REQUIREMENTS

### 5.1 User Management

**FR-1: User Registration**
- Users can create account with username, email, password
- Email verification required
- Password must be 8+ characters with special characters
- Duplicate emails not allowed

**FR-2: User Login**
- Users can login with email and password
- JWT token generated on successful login
- Token expires after 24 hours
- "Remember me" option available

**FR-3: Password Reset**
- Users can request password reset via email
- Reset link expires after 1 hour
- New password must meet security requirements

**FR-4: User Profile**
- Users can view their profile
- Display username, email, join date
- Show analysis history (future feature)

### 5.2 Code Analysis

**FR-5: Code Input**
- Users can paste code in text editor
- Support for 15+ programming languages
- Syntax highlighting in editor
- Maximum code length: 50KB

**FR-6: Language Selection**
- Users can select programming language from dropdown
- 15+ languages available
- Default: JavaScript

**FR-7: Response Language Selection**
- Users can select response language (Khmer/English)
- Instant switching without re-analysis
- Default: English

**FR-8: Code Analysis**
- Click "Analyze" button to submit code
- Show loading spinner during analysis
- Display structured response with sections:
  - Code Summary
  - Technical Analysis
  - Corrected Code
  - Line-by-Line Explanation
  - Pro Tip (with analogy)
  - Conclusion

**FR-9: Example Code**
- "Example" button loads sample code
- Helps users understand how to use the platform
- Different examples for different languages

**FR-10: Clear Function**
- "Clear" button resets code editor and output
- Confirmation not required (quick action)

**FR-11: Keyboard Shortcuts**
- Ctrl+Enter: Analyze code
- Ctrl+K: Clear editor

### 5.3 AI Integration

**FR-12: AI Model Selection**
- Auto-fallback system: FAST → BALANCED → POWERFUL
- Llama 3.1 8B Instant (primary)
- Llama 3.3 70B Versatile (fallback 1)
- Mixtral 8x7B (fallback 2)

**FR-13: Bilingual Prompts**
- Separate system prompts for Khmer and English
- Structured output formatting
- Mandatory analogies
- No repetition rules

**FR-14: Response Formatting**
- Parse AI response into sections
- Apply CSS styling to each section
- Syntax highlight code blocks
- Display emojis and icons

### 5.4 UI/UX

**FR-15: Responsive Design**
- Works on mobile (320px+)
- Works on tablet (768px+)
- Works on desktop (1024px+)
- Adaptive layout

**FR-16: Language Switcher**
- Toggle between Khmer and English UI
- Instant switching
- Persists across sessions

**FR-17: Status Indicator**
- Show current status: Ready, Analyzing, Complete, Error
- Color-coded: Green, Blue, Green, Red
- Animated dot indicator

**FR-18: Loading States**
- Show spinner during API calls
- Disable buttons during processing
- Clear visual feedback

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance

**NFR-1: Response Time**
- Code analysis: < 1 second (target)
- Page load: < 2 seconds
- API response: < 500ms

**NFR-2: Scalability**
- Support 1,000 concurrent users
- Handle 10,000 requests/day
- Auto-scaling on cloud platform

**NFR-3: Availability**
- 99.9% uptime
- Graceful degradation if AI fails
- Error messages in both languages

### 6.2 Security

**NFR-4: Authentication**
- JWT tokens with 24-hour expiration
- Secure password hashing (bcrypt)
- HTTPS only in production

**NFR-5: Data Protection**
- User passwords never stored in plain text
- Email addresses encrypted
- No logging of user code

**NFR-6: Rate Limiting**
- 100 requests per hour per user
- 1,000 requests per hour per IP
- Prevents abuse and spam

### 6.3 Usability

**NFR-7: Accessibility**
- Keyboard navigation support
- Screen reader compatible
- High contrast mode
- Font size adjustable

**NFR-8: Browser Support**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**NFR-9: Mobile Support**
- Touch-friendly buttons
- Responsive text input
- Optimized for small screens

### 6.4 Maintainability

**NFR-10: Code Quality**
- Clean, documented code
- Modular architecture
- Consistent naming conventions
- Git commit conventions

**NFR-11: Documentation**
- Complete README
- API documentation
- AI Prompt Library
- Deployment guide

---

## 7. TECHNICAL ARCHITECTURE

### 7.1 System Architecture

```
┌─────────────────────────────────────────┐
│           CLIENT (Browser)              │
│  • HTML5, CSS3, JavaScript              │
│  • Tailwind CSS                         │
│  • Responsive Design                    │
└─────────────────────────────────────────┘
                  ↓ HTTPS
┌─────────────────────────────────────────┐
│         BACKEND SERVER (Node.js)        │
│  • Express.js 5.2.1                     │
│  • JWT Authentication                   │
│  • Rate Limiting                        │
│  • Error Handling                       │
└─────────────────────────────────────────┘
         ↓                    ↓
┌──────────────────┐  ┌──────────────────┐
│   MongoDB 7.1.0  │  │   Redis 4.6.0    │
│   • User Data    │  │   • Caching      │
│   • History      │  │   • Sessions     │
└──────────────────┘  └──────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│            GROQ API (AI)                │
│  • Llama 3.1 8B Instant                 │
│  • Llama 3.3 70B Versatile              │
│  • Mixtral 8x7B                         │
└─────────────────────────────────────────┘
```

### 7.2 Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Tailwind CSS (styling)
- Font Awesome (icons)
- AOS (animations)

**Backend:**
- Node.js 18.x+
- Express.js 5.2.1
- MongoDB 7.1.0
- Mongoose 9.3.1
- Redis 4.6.0
- JWT 9.0.3
- bcryptjs 3.0.3
- Nodemailer 8.0.2

**AI:**
- Groq API
- Llama 3.1 8B Instant
- Llama 3.3 70B Versatile
- Mixtral 8x7B

**DevOps:**
- Git (version control)
- GitHub (repository)
- Render (hosting)
- MongoDB Atlas (database)
- Redis Cloud (caching)

### 7.3 Data Models

**User Schema:**
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  isVerified: Boolean (default: false),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**History Schema (Future):**
```javascript
{
  userId: ObjectId (ref: User),
  code: String,
  language: String,
  responseLang: String,
  analysis: String,
  createdAt: Date
}
```

---

## 8. API SPECIFICATIONS

### 8.1 Authentication APIs

**POST /api/auth/register**
- Request: { username, email, password }
- Response: { message, userId }
- Status: 201 Created

**POST /api/auth/login**
- Request: { email, password }
- Response: { token, user }
- Status: 200 OK

**POST /api/auth/forgot-password**
- Request: { email }
- Response: { message }
- Status: 200 OK

**POST /api/auth/reset-password**
- Request: { token, newPassword }
- Response: { message }
- Status: 200 OK

### 8.2 Code Analysis API

**POST /api/analyze-code**
- Headers: Authorization: Bearer <token>
- Request: { code, language, responseLang }
- Response: { success, analysis, responseLanguage, status }
- Status: 200 OK

### 8.3 Health Check API

**GET /api/health**
- Response: { status, message, version, database, redis, models, languages }
- Status: 200 OK

---

## 9. USER INTERFACE SPECIFICATIONS

### 9.1 Homepage
- Hero section with animated background
- Features section (3 cards)
- Stats section (2M+ developers, 15+ languages, 100M+ analyses)
- Testimonials section
- Call-to-action buttons

### 9.2 Code Analysis Page
- Navigation bar with language switcher
- Code editor (dark theme, syntax highlighting)
- Programming language dropdown (15+ options)
- Response language dropdown (Khmer/English)
- Analyze button (primary action)
- Example button (secondary action)
- Clear button (secondary action)
- Output panel (structured sections)
- Status indicator
- Loading spinner

### 9.3 Authentication Modal
- Login tab
- Signup tab
- Forgot password tab
- Form validation
- Error messages
- Success messages

---

## 10. TESTING REQUIREMENTS

### 10.1 Unit Tests
- User registration validation
- Password hashing
- JWT token generation
- Code input validation
- Language selection

### 10.2 Integration Tests
- User registration flow
- User login flow
- Code analysis flow
- Password reset flow
- API error handling

### 10.3 Manual Tests
- All 13 test cases documented in README
- Cross-browser testing
- Mobile responsiveness
- Performance testing
- Security testing

### 10.4 Test Results
- ✅ All 13 tests passed
- ✅ Response time < 1 second
- ✅ No security vulnerabilities
- ✅ 100% uptime during testing

---

## 11. DEPLOYMENT REQUIREMENTS

### 11.1 Production Environment
- Platform: Render.com
- Node.js version: 18.x+
- Environment variables configured
- HTTPS enabled
- Custom domain (optional)

### 11.2 Database
- MongoDB Atlas (cloud)
- Cluster: M0 (free tier) or higher
- Backup enabled
- Monitoring enabled

### 11.3 Caching
- Redis Cloud (optional)
- Plan: Free tier or higher
- Connection pooling enabled

### 11.4 Email Service
- Provider: Brevo (Sendinblue)
- API key configured
- Email templates created
- Sender verified

---

## 12. MAINTENANCE & SUPPORT

### 12.1 Monitoring
- Server uptime monitoring
- Error logging
- Performance metrics
- User analytics

### 12.2 Updates
- Security patches: Monthly
- Feature updates: Quarterly
- Bug fixes: As needed
- Dependency updates: Monthly

### 12.3 Support
- Email support: soriaphorn.thong@anbschool.org
- GitHub issues: For bug reports
- Documentation: Always up-to-date

---

## 13. FUTURE ENHANCEMENTS

### 13.1 Version 2.0 (Q2 2026)
- Code execution environment
- Export analysis as PDF
- Share feature with unique links
- Dark mode toggle
- Code history dashboard
- Multiple file analysis

### 13.2 Version 3.0 (Q4 2026)
- Multiple AI providers (Gemini, Claude, OpenAI)
- Mobile app (iOS/Android)
- VS Code extension
- Team collaboration features
- API for third-party integrations
- Advanced analytics dashboard

### 13.3 Long-term Vision
- Expand to Vietnamese, Thai, Lao languages
- Partner with universities
- Enterprise licensing
- Developer community platform
- AI-powered code generation
- Real-time collaboration

---

## 14. RISKS & MITIGATION

### 14.1 Technical Risks

**Risk 1: AI API Downtime**
- Mitigation: Auto-fallback to 3 different models
- Mitigation: Cache common responses
- Mitigation: Show friendly error message

**Risk 2: Database Failure**
- Mitigation: MongoDB Atlas with automatic backups
- Mitigation: Replica sets for high availability
- Mitigation: Regular backup testing

**Risk 3: High Traffic**
- Mitigation: Rate limiting
- Mitigation: Redis caching
- Mitigation: Auto-scaling on Render

### 14.2 Business Risks

**Risk 4: Low User Adoption**
- Mitigation: Marketing to universities
- Mitigation: Free tier for students
- Mitigation: Partnerships with bootcamps

**Risk 5: Competition**
- Mitigation: Focus on bilingual feature (unique)
- Mitigation: Continuous improvement
- Mitigation: Community building

---

## 15. SUCCESS CRITERIA

### 15.1 Launch Criteria
- ✅ All features implemented
- ✅ All tests passed
- ✅ Documentation complete
- ✅ Deployed to production
- ✅ Security audit passed

### 15.2 Success Metrics (6 months)
- 1,000+ registered users
- 10,000+ code analyses
- 95%+ user satisfaction
- < 1 second average response time
- 99.9% uptime

### 15.3 Long-term Success (1 year)
- 10,000+ registered users
- 100,000+ code analyses
- Partnership with 5+ universities
- Featured in tech news
- Positive revenue (if monetized)

---

## 16. CONCLUSION

KONKMENG is a production-ready, bilingual AI code analysis platform that solves real problems for 50,000+ Khmer developers. With its unique bilingual feature, lightning-fast performance, and beautiful UI, KONKMENG is positioned to become the leading educational coding platform in Cambodia.

**Key Achievements:**
- ✅ First bilingual AI code teacher
- ✅ < 1 second response time
- ✅ 15+ programming languages
- ✅ Enterprise-grade architecture
- ✅ 100% test pass rate
- ✅ Production-ready

**Next Steps:**
1. Launch to public
2. Gather user feedback
3. Iterate and improve
4. Expand to more languages
5. Build community

---

**Document Version:** 1.0  
**Last Updated:** March 25, 2026  
**Author:** PHE SOPHY  
**Status:** Approved for Production

---

*This PRD is a living document and will be updated as the product evolves.*
