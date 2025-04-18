function initBrowserLogger() {
    const startTime = new Date();
    const logs = {
        textInput: [],
        textSelection: [],
        mouseClicks: [],
        clipboardPastes: [],
        windowFocus: []
    };
    
    function getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
    }
    
    function addLogEntry(logType, content) {
        if (logs[logType]) {
            const timestamp = getTimestamp();
            logs[logType].push({ timestamp, content });
            updateLogDisplay(logType);
        }
    }
    
    function updateLogDisplay(logType) {
        const logElementMap = {
            textInput: 'text-input-logs',
            textSelection: 'text-selection-logs',
            mouseClicks: 'click-logs',
            clipboardPastes: 'paste-logs',
            windowFocus: 'focus-logs'
        };
        
        const elementId = logElementMap[logType];
        if (!elementId) return;
        
        const logContainer = document.getElementById(elementId);
        if (!logContainer) return;
        
        if (logs[logType].length === 0) {
            logContainer.innerHTML = '<div class="log-empty">No logs yet</div>';
            return;
        }
        
        let html = '';
        logs[logType].slice().reverse().forEach(log => {
            html += `<div class="log-entry">
                <span class="log-timestamp">[${log.timestamp}]</span>
                <span class="log-content">${log.content}</span>
            </div>`;
        });
        
        logContainer.innerHTML = html;
    }
    
    function initLogDisplays() {
        Object.keys(logs).forEach(logType => {
            updateLogDisplay(logType);
        });
    }
    
    document.getElementById('view-logs-btn').addEventListener('click', () => {
        document.getElementById('all-logs').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // USER ACTIONS
    document.addEventListener('selectionchange', () => {
        const selection = document.getSelection();
        const text = selection.toString();
        updateElement('text-selection', text ? `"${text}"` : 'Nothing selected');
        
        if (text) {
            addLogEntry('textSelection', `Selected text: "${text}"`);
        }
    });

    document.addEventListener('mousemove', (e) => {
        updateElement('mouse', `Position: X: ${e.clientX}, Y: ${e.clientY}`);
    });

    document.addEventListener('click', (e) => {
        const clickData = document.getElementById('mouse').querySelector('.data');
        clickData.innerHTML = `Position: X: ${e.clientX}, Y: ${e.clientY}<br>Last click: X: ${e.clientX}, Y: ${e.clientY}`;
        
        addLogEntry('mouseClicks', `Clicked at X: ${e.clientX}, Y: ${e.clientY} (Target: ${e.target.tagName.toLowerCase()}${e.target.id ? ' #' + e.target.id : ''})`);
    });

    document.addEventListener('keydown', (e) => {
        updateElement('keyboard', `Last key: ${e.key} (code: ${e.code})`);
        
        // Don't log modifier keys alone
        if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
            addLogEntry('textInput', `Key pressed: ${e.key} (code: ${e.code})`);
        }
    });

    window.addEventListener('scroll', () => {
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        updateElement('scroll', `X: ${scrollX}, Y: ${scrollY}`);
    });

    window.addEventListener('focus', () => {
        updateElement('focus', 'Currently focused');
        addLogEntry('windowFocus', 'Window gained focus');
    });

    window.addEventListener('blur', () => {
        updateElement('focus', 'Not focused (switched tabs)');
        addLogEntry('windowFocus', 'Window lost focus (switched tabs)');
    });

    timeOnPageInterval = setInterval(() => {
        const now = new Date();
        const timeSpent = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        updateElement('time', `${minutes}m ${seconds}s`);
    }, 1000);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const dimensions = `${window.innerWidth}px × ${window.innerHeight}px`;
            updateElement('resize', `Window resized to: ${dimensions}`);
            addLogEntry('windowFocus', `Window resized to: ${dimensions}`);
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

        // version (kinda sketchy)
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
        fetch('http://ip-api.com/json/')
            .then(response => response.json())
            .then(data => {
                updateElement('ip', data.query);
                
                updateElement('geolocation', `${data.city}, ${data.regionName}, ${data.country}`);
                updateElement('zip-code', data.zip || 'Not available');
                updateElement('location-coordinates', `Latitude: ${data.lat}\nLongitude: ${data.lon}`);
                updateElement('isp', data.isp || 'Not available');
                updateElement('organization', data.org || 'Not available');
            })
            .catch((err) => {
                console.error('Error fetching IP/location data:', err);
                updateElement('ip', 'Could not retrieve');
                updateElement('geolocation', 'Could not retrieve');
                updateElement('zip-code', 'Could not retrieve');
                updateElement('location-coordinates', 'Could not retrieve');
                updateElement('isp', 'Could not retrieve');
                updateElement('organization', 'Could not retrieve');
            });
    
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
        const displayText = text.substring(0, 50) + (text.length > 50 ? '...' : '');
        updateElement('clipboard', `Pasted: "${displayText}"`);
        
        addLogEntry('clipboardPastes', `Pasted: "${displayText}"`);
    });
    
    initLogDisplays();
    addLogEntry('windowFocus', 'Session started with window focused');
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
