function initBrowserLogger() {
    const startTime = new Date();

    // USER ACTIONS
    // text selection
    document.addEventListener('selectionchange', () => {
        const selection = document.getSelection();
        const text = selection.toString();
        updateElement('text-selection', text ? `"${text}"` : 'Nothing selected');
    });

    // mouse movement and clicks
    document.addEventListener('mousemove', (e) => {
        updateElement('mouse', `Position: X: ${e.clientX}, Y: ${e.clientY}`);
    });

    document.addEventListener('click', (e) => {
        const clickData = document.getElementById('mouse').querySelector('.data');
        clickData.innerHTML = `Position: X: ${e.clientX}, Y: ${e.clientY}<br>Last click: X: ${e.clientX}, Y: ${e.clientY}`;
    });

    // keyboard input
    document.addEventListener('keydown', (e) => {
        updateElement('keyboard', `Last key: ${e.key} (code: ${e.code})`);
    });

    // scroll position
    window.addEventListener('scroll', () => {
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        updateElement('scroll', `X: ${scrollX}, Y: ${scrollY}`);
    });

    // window focus/blur
    window.addEventListener('focus', () => {
        updateElement('focus', 'Currently focused');
    });

    window.addEventListener('blur', () => {
        updateElement('focus', 'Not focused (switched tabs)');
    });

    // time on page
    timeOnPageInterval = setInterval(() => {
        const now = new Date();
        const timeSpent = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        updateElement('time', `${minutes}m ${seconds}s`);
    }, 1000);

    // window resizing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateElement('resize', `Window resized to: ${window.innerWidth}px × ${window.innerHeight}px`);
        }, 500);
    });

    // BROWSER AND DEVICE INFO
    function detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserName = "Unknown";
        let browserVersion = "";

        if (userAgent.match(/chrome|chromium|crios/i)) {
            browserName = "Chrome";
        } else if (userAgent.match(/firefox|fxios/i)) {
            browserName = "Firefox";
        } else if (userAgent.match(/safari/i)) {
            browserName = "Safari";
        } else if (userAgent.match(/opr\//i)) {
            browserName = "Opera";
        } else if (userAgent.match(/edg/i)) {
            browserName = "Edge";
        } else if (userAgent.match(/trident/i)) {
            browserName = "Internet Explorer";
        }

        // version
        const match = userAgent.match(/(chrome|chromium|safari|firefox|msie|trident|edge(?=\/)|opr)(\/| )([0-9]+)/i);
        if (match && match[3]) {
            browserVersion = match[3];
        }

        return `${browserName} ${browserVersion}`;
    }

    function detectOS() {
        const userAgent = navigator.userAgent;
        let os = "Unknown";

        if (userAgent.match(/windows nt/i)) {
            const version = userAgent.match(/windows nt (\d+\.\d+)/i);
            const versions = {
                '10.0': 'Windows 10/11',
                '6.3': 'Windows 8.1',
                '6.2': 'Windows 8',
                '6.1': 'Windows 7',
                '6.0': 'Windows Vista',
                '5.1': 'Windows XP'
            };
            os = version ? versions[version[1]] || `Windows (NT ${version[1]})` : 'Windows';
        } else if (userAgent.match(/macintosh|mac os x/i)) {
            os = 'macOS';
        } else if (userAgent.match(/linux/i)) {
            os = 'Linux';
        } else if (userAgent.match(/iphone|ipad|ipod/i)) {
            os = 'iOS';
        } else if (userAgent.match(/android/i)) {
            os = 'Android';
        }

        return os;
    }

    function detectDeviceType() {
        const userAgent = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
            return 'Tablet';
        } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    function getScreenInfo() {
        return `Screen: ${window.screen.width}×${window.screen.height}px\nViewport: ${window.innerWidth}×${window.innerHeight}px`;
    }

    updateElement('browser', detectBrowser());
    updateElement('os', detectOS());
    updateElement('screen', getScreenInfo());
    updateElement('device', detectDeviceType());

    // NETWORK INFO
    //IP and location info
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            updateElement('ip', data.ip);
            
            // approximate location based on IP
            return fetch(`https://ipapi.co/${data.ip}/json/`);
        })
        .then(response => response.json())
        .then(data => {
            updateElement('geolocation', `${data.city}, ${data.region}, ${data.country_name}`);
        })
        .catch(() => {
            updateElement('ip', 'Could not retrieve');
            updateElement('geolocation', 'Could not retrieve');
        });

    //  connection type
    if (navigator.connection) {
        const connection = navigator.connection;
        updateElement('network-type', connection.effectiveType || 'Unknown');
        
        connection.addEventListener('change', () => {
            updateElement('network-type', connection.effectiveType || 'Unknown');
        });
    } else {
        updateElement('network-type', 'API not available');
    }

    // OTHER DETAILS
    updateElement('referrer', document.referrer || 'Direct navigation (no referrer)');
    updateElement('current-url', window.location.href);
    function updateLocalTime() {
        const options = { 
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timeZoneName: 'long', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const localTime = formatter.format(new Date());
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        updateElement('timezone', `${timezone}\n${localTime}`);
    }
    updateLocalTime();
    setInterval(updateLocalTime, 1000);

    updateElement('language', navigator.language + 
        (navigator.languages ? `\nAll: ${navigator.languages.join(', ')}` : ''));

    updateElement('cookies', navigator.cookieEnabled ? 'Enabled' : 'Disabled');

    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            function updateBatteryStatus() {
                const level = Math.round(battery.level * 100);
                const charging = battery.charging ? 'Charging' : 'Not charging';
                updateElement('battery', `${level}% (${charging})`);
            }
            
            updateBatteryStatus();
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingchange', updateBatteryStatus);
        });
    } else {
        updateElement('battery', 'API not available');
    }

    document.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        updateElement('clipboard', `Pasted: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    });
}

function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        const dataElement = element.querySelector('.data');
        if (dataElement) {
            dataElement.textContent = content;
        }
    }
}

document.addEventListener('DOMContentLoaded', initBrowserLogger);
