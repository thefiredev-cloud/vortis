# Clerk Manual Testing Guide

Step-by-step manual testing procedures for Clerk authentication across devices and browsers.

## Overview

Manual testing ensures the user experience is smooth across all devices, browsers, and screen sizes. This guide provides detailed test scripts for QA testers.

---

## 1. Desktop Browser Testing

### Test Environment Setup

**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Screen Resolutions:**
- 1920x1080 (Full HD)
- 1366x768 (Common laptop)
- 2560x1440 (2K)

---

### Test Script 1: New User Sign-Up (Chrome)

**Objective:** Complete sign-up flow on desktop Chrome

**Prerequisites:**
- Fresh incognito window
- Test Google account available
- Clear browser cache

**Steps:**

1. **Navigate to Homepage**
   - URL: `http://localhost:3000` or `https://yourdomain.com`
   - Expected: Homepage loads within 3 seconds
   - Verify: Vortis logo visible, "Sign Up" button visible

2. **Click Sign Up**
   - Click "Sign Up" or "Get Started" button
   - Expected: Navigate to `/sign-up` page
   - Verify: Sign-up form loads, Google button visible

3. **Initiate Google OAuth**
   - Click "Continue with Google" button
   - Expected: Redirect to Google consent screen
   - Verify: Google account picker appears

4. **Select Google Account**
   - Select test Google account
   - Expected: Google consent screen shows
   - Verify: App name "Vortis", permissions listed

5. **Approve Permissions**
   - Click "Allow" or "Continue"
   - Expected: Redirect back to Vortis
   - Verify: Landing on `/dashboard` within 3 seconds

6. **Verify Dashboard**
   - Expected: Dashboard fully loaded
   - Verify:
     - [ ] User name displays correctly
     - [ ] Profile image shows
     - [ ] Navigation menu visible
     - [ ] "Welcome" or onboarding message (if applicable)
     - [ ] No console errors

7. **Check Profile Data**
   - Click user menu/avatar
   - Expected: Dropdown shows user info
   - Verify:
     - [ ] Name matches Google account
     - [ ] Email matches Google account
     - [ ] "Sign Out" option visible

**Pass Criteria:**
- All steps complete without errors
- Sign-up takes < 30 seconds total
- Dashboard loads with correct user data
- No visual glitches

**Record Results:**
```
Browser: Chrome
Version:
OS:
Screen: 1920x1080
Result: PASS / FAIL
Notes:
```

---

### Test Script 2: Existing User Sign-In (Firefox)

**Objective:** Sign in with existing account on Firefox

**Prerequisites:**
- User already created (use account from Test Script 1)
- Firefox browser
- Not currently signed in

**Steps:**

1. **Navigate to Sign-In**
   - URL: `http://localhost:3000/sign-in`
   - Expected: Sign-in page loads
   - Verify: Google sign-in button visible

2. **Click Continue with Google**
   - Click button
   - Expected: Google account picker
   - Verify: Previously used account listed

3. **Select Account**
   - Choose existing account
   - Expected: May skip consent screen (already approved)
   - Verify: Redirect back to Vortis quickly

4. **Verify Dashboard**
   - Expected: Dashboard loads
   - Verify:
     - [ ] Correct user signed in
     - [ ] All previous data intact
     - [ ] Session restored

**Pass Criteria:**
- Sign-in faster than sign-up (< 10 seconds)
- Skips consent screen
- All data preserved

---

### Test Script 3: Sign-Out and Re-Sign-In (Safari)

**Objective:** Test complete sign-out and re-authentication

**Prerequisites:**
- User signed in on Safari
- Dashboard accessible

**Steps:**

1. **Sign Out**
   - Click user menu
   - Click "Sign Out"
   - Expected: Redirect to homepage or sign-in
   - Verify: No longer signed in

2. **Attempt Dashboard Access**
   - Navigate to `/dashboard`
   - Expected: Redirect to `/sign-in`
   - Verify: Cannot access without auth

3. **Sign In Again**
   - Click "Continue with Google"
   - Complete sign-in
   - Expected: Return to dashboard

4. **Verify Session Restored**
   - Check user data
   - Expected: All data intact

**Pass Criteria:**
- Sign-out complete (no lingering session)
- Cannot access protected routes
- Re-sign-in works smoothly

---

## 2. Mobile Browser Testing

### Test Environment Setup

**Devices:**
- iPhone (iOS Safari)
- Android Phone (Chrome)
- iPad (iOS Safari)

**Network Conditions:**
- WiFi
- 4G/LTE
- 3G (simulated slow)

---

### Test Script 4: Mobile Sign-Up (iPhone Safari)

**Objective:** Complete sign-up on iPhone

**Prerequisites:**
- iPhone with Safari
- Test Google account
- Clear Safari history/cache

**Steps:**

1. **Navigate to Homepage**
   - URL: Type in Safari
   - Expected: Mobile-optimized homepage
   - Verify:
     - [ ] Layout responsive
     - [ ] Buttons touch-friendly
     - [ ] No horizontal scrolling

2. **Tap Sign Up**
   - Tap "Sign Up" button
   - Expected: Sign-up page loads
   - Verify: Google button large enough to tap easily

3. **Initiate OAuth**
   - Tap "Continue with Google"
   - Expected: Google OAuth in Safari
   - Verify: Can select/sign in to Google

4. **Complete OAuth**
   - Approve permissions
   - Expected: Redirect back to Vortis
   - Verify: Dashboard loads in mobile view

5. **Test Mobile Navigation**
   - Open mobile menu (hamburger icon)
   - Navigate to different pages
   - Verify: All pages mobile-responsive

6. **Test Orientation**
   - Rotate phone (portrait ↔ landscape)
   - Expected: Layout adjusts correctly
   - Verify: No broken layouts

**Pass Criteria:**
- Entire flow works on mobile
- Touch targets adequate size
- No layout issues
- Smooth transitions

**Record Results:**
```
Device: iPhone
iOS Version:
Browser: Safari
Network: WiFi
Result: PASS / FAIL
Issues:
```

---

### Test Script 5: Android Sign-In (Chrome Mobile)

**Objective:** Sign in on Android device

**Steps:**

1. **Navigate to Sign-In**
   - Open Chrome on Android
   - Go to sign-in page

2. **Tap Google Sign-In**
   - Tap button
   - Expected: Google account selector

3. **Complete Sign-In**
   - Select account
   - Approve
   - Expected: Dashboard loads

4. **Test Features**
   - Perform stock analysis
   - Navigate pages
   - Verify: All features work on mobile

**Pass Criteria:**
- Sign-in successful
- All features functional on mobile

---

### Test Script 6: Tablet Experience (iPad)

**Objective:** Verify tablet-optimized experience

**Steps:**

1. **Test in Portrait Mode**
   - Navigate through app
   - Verify: Proper tablet layout

2. **Test in Landscape Mode**
   - Rotate iPad
   - Verify: Layout adjusts, no wasted space

3. **Test Split-Screen (if supported)**
   - Open Vortis in split-screen
   - Verify: Still usable in narrow view

**Pass Criteria:**
- Tablet experience optimized
- Works in both orientations

---

## 3. Accessibility Testing

### Test Script 7: Keyboard Navigation

**Objective:** Verify app is keyboard-accessible

**Prerequisites:**
- Desktop browser
- Don't use mouse

**Steps:**

1. **Navigate to Sign-In**
   - Use Tab key to navigate
   - Expected: Can reach all interactive elements
   - Verify:
     - [ ] Focus indicators visible
     - [ ] Tab order logical
     - [ ] Can activate buttons with Enter/Space

2. **Sign In with Keyboard**
   - Tab to "Continue with Google"
   - Press Enter
   - Complete OAuth
   - Expected: Works without mouse

3. **Navigate Dashboard**
   - Use Tab to navigate menu
   - Use Arrow keys where applicable
   - Verify: All features accessible

**Pass Criteria:**
- All features keyboard-accessible
- Focus indicators clear
- Logical tab order

---

### Test Script 8: Screen Reader Testing

**Objective:** Verify compatibility with screen readers

**Tools:**
- VoiceOver (Mac/iOS)
- NVDA (Windows)
- TalkBack (Android)

**Steps:**

1. **Enable Screen Reader**
   - Turn on VoiceOver/NVDA

2. **Navigate App**
   - Listen to announcements
   - Verify:
     - [ ] All text read correctly
     - [ ] Buttons identified
     - [ ] Form fields labeled
     - [ ] Headings structured

3. **Complete Sign-In Flow**
   - Use screen reader to sign in
   - Expected: All steps announced clearly

**Pass Criteria:**
- All content accessible to screen readers
- Proper ARIA labels
- Logical heading structure

---

## 4. Network Condition Testing

### Test Script 9: Slow 3G Network

**Objective:** Test on slow connection

**Setup:**
- Chrome DevTools > Network > Throttling > Slow 3G

**Steps:**

1. **Navigate to Homepage**
   - Expected: Progressive loading
   - Verify: Critical content loads first

2. **Initiate Sign-In**
   - Click sign-in
   - Expected: Works despite slow network
   - Verify: Loading indicators shown

3. **Complete OAuth**
   - Expected: May be slow but completes
   - Verify: No timeouts, clear feedback

**Pass Criteria:**
- App usable on slow network
- Loading states clear
- No broken functionality

---

### Test Script 10: Offline to Online

**Objective:** Test network interruption handling

**Steps:**

1. **Sign In (Online)**
   - Complete normal sign-in
   - Dashboard loads

2. **Go Offline**
   - Turn off WiFi or use DevTools
   - Try to navigate

3. **Verify Error Handling**
   - Expected: Clear offline message
   - Verify: App doesn't break

4. **Reconnect**
   - Turn WiFi back on
   - Try action again
   - Expected: Recovers gracefully

**Pass Criteria:**
- Offline state detected
- Clear error messages
- Recovers when online

---

## 5. Browser Compatibility Matrix

### Test Matrix Template

| Feature | Chrome | Firefox | Safari | Edge | Mobile Chrome | Mobile Safari |
|---------|--------|---------|--------|------|---------------|---------------|
| Sign-Up | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Sign-In | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Sign-Out | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Dashboard | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| OAuth Flow | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Session Persist | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Profile Update | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

**Legend:**
- ✓ = Pass
- ✗ = Fail
- ⚠ = Pass with issues

---

## 6. Visual Regression Testing

### Test Script 11: Visual Consistency

**Objective:** Verify consistent appearance across browsers

**Steps:**

1. **Take Screenshots**
   - Homepage (unauthenticated)
   - Sign-in page
   - Dashboard
   - In each browser

2. **Compare Visually**
   - Check alignment
   - Check colors
   - Check fonts
   - Check spacing

3. **Verify Components**
   - Buttons look correct
   - Forms aligned
   - Images load
   - Icons display

**Pass Criteria:**
- Consistent appearance
- No broken layouts
- All elements visible

---

## 7. User Experience Testing

### Test Script 12: First-Time User Experience

**Objective:** Evaluate UX for new users

**Evaluate:**

1. **Clarity**
   - [ ] Purpose of app clear
   - [ ] Sign-up benefits explained
   - [ ] CTA buttons obvious

2. **Simplicity**
   - [ ] Sign-up quick (< 1 minute)
   - [ ] Minimal steps
   - [ ] Clear instructions

3. **Trust**
   - [ ] Professional appearance
   - [ ] Secure (HTTPS, padlock icon)
   - [ ] Privacy policy linked

4. **Feedback**
   - [ ] Loading states shown
   - [ ] Success confirmations
   - [ ] Error messages helpful

**Pass Criteria:**
- Positive first impression
- Easy to complete sign-up
- Professional and trustworthy

---

## 8. Edge Case Testing

### Test Script 13: Cancel OAuth Flow

**Steps:**
1. Start sign-in
2. On Google consent screen, click "Cancel"
3. Expected: Return to sign-in page
4. Verify: Can retry sign-in

---

### Test Script 14: Multiple Tabs

**Steps:**
1. Open app in Tab 1
2. Open app in Tab 2
3. Sign in on Tab 1
4. Switch to Tab 2
5. Verify: Tab 2 also signed in
6. Sign out on Tab 1
7. Verify: Tab 2 also signed out

---

### Test Script 15: Browser Back Button

**Steps:**
1. Navigate through sign-up flow
2. Use browser back button
3. Expected: Graceful handling
4. Verify: Can proceed forward again

---

## 9. Manual Testing Checklist

**Desktop Browsers:**
- [ ] Chrome - Sign-up
- [ ] Chrome - Sign-in
- [ ] Chrome - Sign-out
- [ ] Firefox - Sign-up
- [ ] Firefox - Sign-in
- [ ] Safari - Sign-up
- [ ] Safari - Sign-in
- [ ] Edge - Sign-up
- [ ] Edge - Sign-in

**Mobile Devices:**
- [ ] iPhone Safari - Sign-up
- [ ] iPhone Safari - Sign-in
- [ ] Android Chrome - Sign-up
- [ ] Android Chrome - Sign-in
- [ ] iPad Safari - Sign-up
- [ ] iPad Safari - Sign-in

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] ARIA labels present

**Network Conditions:**
- [ ] Fast WiFi
- [ ] Slow 3G
- [ ] Offline handling
- [ ] Network interruption recovery

**User Experience:**
- [ ] First-time user flow smooth
- [ ] Loading states clear
- [ ] Error messages helpful
- [ ] Consistent across browsers

**Edge Cases:**
- [ ] OAuth cancellation
- [ ] Multiple tabs sync
- [ ] Browser back button
- [ ] Session expiry
- [ ] Rapid clicks handled

---

## 10. Bug Report Template

**When you find an issue:**

```markdown
## Bug Report

**Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Environment:**
- Browser:
- Version:
- OS:
- Device:
- Screen Size:

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Paste any errors]

**Additional Notes:**
```

---

## 11. Test Session Report

**After completing manual testing:**

```markdown
## Manual Testing Session Report

**Date:**
**Tester:**
**Environment:** Development / Staging / Production
**Duration:**

**Summary:**
- Total Tests:
- Passed:
- Failed:
- Blocked:

**Browsers Tested:**
- Chrome: ✓ / ✗
- Firefox: ✓ / ✗
- Safari: ✓ / ✗
- Edge: ✓ / ✗

**Devices Tested:**
- iPhone: ✓ / ✗
- Android: ✓ / ✗
- iPad: ✓ / ✗

**Critical Issues:**
1.
2.

**Minor Issues:**
1.
2.

**Recommendations:**

**Sign-off:**
Ready for deployment: YES / NO
```

---

## Next Steps

After completing manual testing:

1. **Review Troubleshooting Guide**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_TROUBLESHOOTING.md`

2. **Complete Testing Checklist**
   - See: `/Users/tannerosterkamp/vortis/CLERK_TESTING_CHECKLIST.md`

3. **Run Automated Tests**
   - See: `/Users/tannerosterkamp/vortis/tests/clerk/`
