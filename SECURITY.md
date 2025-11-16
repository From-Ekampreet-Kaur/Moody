# 🔐 Moody Security Implementation

## Security Features Implemented

### 1. **Data Encryption (AES-256-CBC)**
- **Email Encryption**: All user emails are encrypted before storage in MongoDB
- **Support Person Email**: Partner emails encrypted for privacy
- **Algorithm**: AES-256-CBC with random initialization vectors (IV)
- **Key Management**: 64-character hex encryption key stored in `.env`

#### How It Works:
```javascript
// Automatic encryption/decryption via Mongoose getters/setters
const user = await User.findOne({ email: 'user@example.com' });
console.log(user.email); // Returns decrypted email
// Database stores: "a1b2c3d4e5f6:encrypted_data_here"
```

### 2. **Password Security**
- **Hashing Algorithm**: bcrypt with salt rounds (10)
- **Pre-save Hook**: Passwords automatically hashed before database storage
- **Comparison**: Secure password comparison using bcrypt.compare()
- **Never Exposed**: Passwords excluded from JSON responses

### 3. **Session Token System**
- **Unique Tokens**: 64-character hex tokens generated per session
- **Server-Side Validation**: Token stored in database and validated on each request
- **Token Rotation**: New token generated on each login
- **Automatic Cleanup**: Tokens cleared on logout

#### Session Flow:
1. User logs in → Generate random session token
2. Store token in database and session
3. Each protected request validates token matches database
4. Logout clears token from database
5. Invalid/expired tokens redirect to login

### 4. **HTTP Security Headers (Helmet.js)**
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **X-Frame-Options**: Prevents clickjacking
- **Strict-Transport-Security**: Forces HTTPS in production
- **X-XSS-Protection**: Additional XSS protection

### 5. **Rate Limiting**
#### Authentication Routes (`/auth/*`):
- **Window**: 15 minutes
- **Max Attempts**: 5 login/signup attempts per IP
- **Protection**: Prevents brute force attacks
- **Message**: "Too many login attempts. Please try again after 15 minutes."

#### API Routes (`/api/*`):
- **Window**: 15 minutes  
- **Max Requests**: 100 requests per IP
- **Protection**: Prevents API abuse
- **Message**: "Too many requests. Please try again later."

### 6. **Input Validation & Sanitization**
- **express-validator**: Validates all form inputs
- **Email Validation**: Regex pattern matching
- **Password Requirements**: Minimum 6 characters
- **SQL Injection Prevention**: Mongoose sanitizes queries
- **XSS Prevention**: Input sanitization and output escaping

### 7. **Secure Session Management**
- **Session Store**: MongoDB (connect-mongo)
- **Cookie Settings**:
  - `httpOnly: true` - Prevents JavaScript access
  - `secure: true` (production) - HTTPS only
  - `sameSite: 'lax'` - CSRF protection
  - `maxAge: 7 days` - Session expiration

## Environment Variables Required

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/moody

# Session Secret (64+ characters recommended)
SESSION_SECRET=your-very-long-random-secret-key-here

# Encryption Key (64 hex characters - generated via crypto)
ENCRYPTION_KEY=f3a8b2c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1

# Environment
NODE_ENV=production

# Port
PORT=3000
```

## Security Best Practices Implemented

### ✅ Data at Rest
- Encrypted emails in database
- Hashed passwords with bcrypt
- Secure session storage in MongoDB

### ✅ Data in Transit
- Helmet security headers
- HTTPS enforced in production
- Secure cookies with httpOnly flag

### ✅ Authentication & Authorization
- Session-based authentication
- Token validation on each request
- Protected routes middleware
- Automatic session expiration

### ✅ Attack Prevention
- Rate limiting (brute force protection)
- Input validation (SQL injection prevention)
- XSS protection headers
- CSRF protection via sameSite cookies
- Clickjacking prevention

## Testing Security

### Test Encryption:
```javascript
const { encrypt, decrypt } = require('./utils/encryption');

const email = 'test@example.com';
const encrypted = encrypt(email);
console.log('Encrypted:', encrypted); // a1b2c3:encrypted_data

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted); // test@example.com
```

### Test Rate Limiting:
Try making 6 login attempts within 15 minutes - the 6th attempt will be blocked.

### Test Session Security:
1. Login successfully
2. Manually change session token in database
3. Try accessing protected route → Should redirect to login

## Production Deployment Checklist

- [ ] Generate new strong `SESSION_SECRET` (64+ random characters)
- [ ] Generate new `ENCRYPTION_KEY` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS and update cookie `secure` flag
- [ ] Review and adjust rate limits based on traffic
- [ ] Set up MongoDB authentication
- [ ] Enable MongoDB encryption at rest
- [ ] Regular security audits with `npm audit`
- [ ] Monitor failed login attempts
- [ ] Implement 2FA (future enhancement)

## Security Monitoring

### Logs to Monitor:
- Failed login attempts (potential brute force)
- Session validation failures (potential token theft)
- Rate limit violations (potential DDoS)
- Database errors (potential injection attempts)

### Recommended Tools:
- **winston**: Structured logging
- **morgan**: HTTP request logging  
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring

## Future Security Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS or app-based OTP
   - Backup codes

2. **OAuth Integration**
   - Google Sign-In
   - Apple Sign-In

3. **Password Policies**
   - Password strength meter
   - Password history (prevent reuse)
   - Forced password changes

4. **Advanced Monitoring**
   - Anomaly detection
   - Geo-location tracking
   - Device fingerprinting

5. **API Security**
   - JWT tokens for API authentication
   - API versioning
   - Request signing

## Security Contacts

For security vulnerabilities, please email: security@moody.app (replace with actual email)

**Do not** disclose security issues publicly until they have been addressed.

---

**Last Updated**: November 16, 2025  
**Version**: 1.0.0
