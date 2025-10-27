# CounterPulse Access Control

## Current Access Status
- **Public Access**: Currently open for demo/presentation purposes
- **Recommended**: Add password protection for production

## Access for Jack Morton Team
The app is currently accessible at: http://localhost:8080

## Recommended Security Enhancements

### Option 1: Simple Password Protection (Static)
Add this to `index.html` before the body tag:

```html
<script>
  const ACCESS_KEY = 'jackmorton2025';
  const providedKey = prompt('Enter CounterPulse access key:');
  if (providedKey !== ACCESS_KEY) {
    document.body.innerHTML = '<h1>Access Denied</h1>';
    throw new Error('Invalid access key');
  }
</script>
```

### Option 2: Environment-Based Access (Production)
For production deployment on Vercel/Netlify, use:
- Environment variables for access control
- OAuth integration with Jack Morton's SSO
- IP whitelisting for internal network access

## Client-Focused Trends
All trends are curated for Jack Morton clients including:
- Meta (Facebook)
- Major corporate brands
- Tech companies
- Financial services
- Entertainment brands

## Contact
For access requests or issues, contact the development team.

