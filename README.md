# browserlogger

**browserlogger** is a website that shows everything a browser can reveal about the user **without any permissions**.

It captures and displays:

## User Actions:
- Text highlighting (selection)
- Mouse movement and clicks
- Key presses (key name, code, time)
- Scroll position and behavior
- Window focus/blur (detect tab switching)
- Time spent on page
- Resizing the window

## Browser and Device Info:
- Browser name and version
- Operating system
- Screen size and available viewport
- Device type (mobile, desktop, tablet guess)

## Network Info:
- Public IP address
- Approximate geolocation (via IP)
- ISP (Internet Service Provider)

## Other Details:
- Referrer URL (where the user came from)
- Current URL
- Timezone and local time
- Language settings
- Cookies enabled/disabled
- Battery status (level, charging)
- Clipboard access attempt (only if user pastes)


This project shows **only what can be captured without prompting**. No popups, no permission dialogs.  
All data is collected using JavaScript and public APIs.
