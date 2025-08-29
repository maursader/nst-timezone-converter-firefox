// Check if time is within 1 hour of the daily reset (midnight NST)
function isCloseToReset() {
  try {
    // Get the current date in NST (Los Angeles timezone)
    const now = new Date();
    const nstFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Get the NST hour
    const nstParts = nstFormatter.formatToParts(now);
    const nstHour = parseInt(nstParts.find(part => part.type === 'hour').value);
    const nstMinute = parseInt(nstParts.find(part => part.type === 'minute').value);
    
    // Calculate minutes until reset (midnight NST)
    // If it's after midnight, reset is next day at midnight
    const minutesToReset = nstHour === 23 ? (60 - nstMinute) : ((24 - nstHour - 1) * 60 + (60 - nstMinute));
    
    // Return true if less than 60 minutes until reset
    return minutesToReset <= 60;
  } catch (error) {
    console.error('Error checking reset proximity:', error);
    return false;
  }
}

// Function to convert NST time to another timezone
function convertNSTtoTimezone(nstTimeString, targetTimezone) {
  try {
    // Extract time components from NST time string (format: "8:23:26 pm NST")
    const timeRegex = /(\d+):(\d+):(\d+)\s+(am|pm)\s+NST/i;
    const match = nstTimeString.match(timeRegex);
    
    if (!match) return nstTimeString; // Return original if no match
    
    // Extract hours, minutes, seconds and am/pm from the match
    const [_, hourStr, minuteStr, secondStr, ampm] = match;
    
    // Convert hours to 24-hour format for NST
    let nstHour = parseInt(hourStr);
    if (ampm.toLowerCase() === 'pm' && nstHour < 12) nstHour += 12;
    if (ampm.toLowerCase() === 'am' && nstHour === 12) nstHour = 0;
    
    // Create an ISO string for the current date with NST time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Determine if California is in DST for correct timezone offset
    const isDST = isCaliforniaInDST();
    const tzOffset = isDST ? '-07:00' : '-08:00'; // PDT is UTC-7, PST is UTC-8
    
    // Create ISO string with the correct NST time and timezone
    // Example: "2025-08-27T08:23:26-07:00" for 8:23:26 AM PDT
    const nstTimeISO = `${year}-${month}-${day}T${String(nstHour).padStart(2, '0')}:${minuteStr}:${secondStr}${tzOffset}`;
    
    // Parse the ISO string to create a date object
    // This properly accounts for the NST timezone offset
    const nstDate = new Date(nstTimeISO);
    
    // Format the time in the target timezone using the UTC timestamp
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
      timeZone: targetTimezone
    });
    
    // Format the date in the target timezone
    const formattedTime = formatter.format(nstDate);
    
    // Split the formatted output into time and timezone parts
    const parts = formatter.formatToParts(nstDate);
    let timeDisplay = '';
    let timezoneDisplay = '';
    
    parts.forEach(part => {
      if (part.type === 'timeZoneName') {
        timezoneDisplay = part.value;
      } else if (part.type === 'hour' || part.type === 'minute' || 
                part.type === 'second' || part.type === 'dayPeriod' || 
                (part.type === 'literal' && part.value !== ' ' && part.value.trim() !== '')) {
        timeDisplay += part.value;
      }
    });
    
    // For debugging
    console.log('Original NST:', nstTimeString);
    console.log('NST Hour (24h format):', nstHour);
    console.log('NST ISO String created:', nstTimeISO);
    console.log('NST Date object (in UTC):', nstDate.toUTCString());
    console.log('NST Date object (in ISO):', nstDate.toISOString());
    console.log('Target Timezone:', targetTimezone);
    console.log('Converted time:', timeDisplay);
    console.log('Timezone Display:', timezoneDisplay);
    console.log('Full date in target timezone:', formatter.format(nstDate));
    
    // Add specific debugging for Asia/Taipei (GMT+8)
    if (targetTimezone === 'Asia/Taipei' || targetTimezone === 'Asia/Shanghai' || targetTimezone === 'Asia/Hong_Kong') {
      // Create formatter for Taipei time with more details
      const taipeiFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'long',
        timeZone: targetTimezone
      });
      
      console.log('GMT+8 detailed time check:', taipeiFormatter.format(nstDate));
      
      // Calculate the expected offset for GMT+8 (480 minutes)
      const taipeiOffset = -480; // GMT+8 is UTC+8, which is -480 minutes from UTC
      const currentOffset = new Date().getTimezoneOffset();
      console.log('GMT+8 offset (minutes from UTC):', taipeiOffset);
      console.log('Browser timezone offset (minutes from UTC):', currentOffset);
    }
    
    // Check if we're close to daily reset
    const resetSoon = isCloseToReset();
    const textColor = resetSoon ? '#FF0000' : 'inherit'; // Red text if close to reset
    
    // Return formatted time with center-alignment and original Neopets font styling
    return `<span style="display:block; text-align:center; font-weight:bold; font-family: Verdana, Arial, Helvetica, sans-serif; color: ${textColor};">${timeDisplay}</span><span style="display:block; text-align:center; font-weight:bold; font-family: Verdana, Arial, Helvetica, sans-serif; color: ${textColor};">${timezoneDisplay}</span>`;
  } catch (error) {
    console.error('Error converting NST time:', error);
    return nstTimeString; // Return original on error
  }
}

// Helper function to determine if California (NST) is currently in Daylight Saving Time
function isCaliforniaInDST(date = new Date()) {
  // Use Intl.DateTimeFormat to get the time zone name for Los Angeles (California)
  const timeZoneFormatter = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short',
    timeZone: 'America/Los_Angeles' // This is the IANA time zone for California
  });
  
  // Extract the timezone abbreviation
  const timeZoneParts = timeZoneFormatter.formatToParts(date);
  const timeZoneName = timeZoneParts.find(part => part.type === 'timeZoneName').value;
  
  // If the timezone name is PDT, it's in DST, if it's PST, it's not
  return timeZoneName === 'PDT';
}

// Global variable to store the user's selected timezone
let userTimezone = null;
let isExtensionContextValid = true;

// Helper function to safely call Browser APIs
function safelyAccessBrowserAPI(apiCall, callback) {
  try {
    if (!browser.runtime || !browser.runtime.id) {
      isExtensionContextValid = false;
      console.warn('Extension context is invalid');
      return false;
    }
    apiCall(callback);
    return true;
  } catch (error) {
    isExtensionContextValid = false;
    console.warn('Browser API error:', error.message);
    return false;
  }
}

// Function to update the NST time display once with the user's timezone
function updateTimeDisplay() {
  // If extension context is invalid, don't attempt API calls
  if (!isExtensionContextValid) return;

  // Get the user's timezone from storage if we don't have it yet
  if (!userTimezone) {
    safelyAccessBrowserAPI(
      (callback) => browser.storage.sync.get('timezone')
        .then(data => callback(data))
        .catch(error => {
          console.warn('Error getting timezone:', error);
          callback({});
        }),
      function(data) {
        if (data && data.timezone) {
          userTimezone = data.timezone;
          performTimeUpdate(true); // true means this is a permanent update
        }
      }
    );
    return;
  }
  
  performTimeUpdate(true); // true means this is a permanent update
}

// The actual time update function to avoid code duplication
// isPermanent flag ensures we don't switch back to NST
function performTimeUpdate(isPermanent = false) {
  // Try to find the NST time element in either classic or modern layout
  const nstElement = document.getElementById('nst');
  const modernNstElement = document.querySelector('div.nst.nav-top-nst');
  
  // Process classic layout element
  if (nstElement && userTimezone) {
    // Only save the original text content if we haven't already
    if (!nstElement.hasAttribute('data-original-nst')) {
      nstElement.setAttribute('data-original-nst', nstElement.textContent);
    }
    
    // Get the original NST time string
    const nstTimeString = nstElement.getAttribute('data-original-nst');
    
    // Convert the time
    const convertedTime = convertNSTtoTimezone(nstTimeString, userTimezone);
    
    // Clear existing content (hide NST time)
    nstElement.style.display = 'none';
    
    // Mark the element as permanently converted if requested
    if (isPermanent) {
      nstElement.setAttribute('data-timezone-converted', 'true');
      // Remove the id to prevent other scripts from updating it back to NST
      // This is a bit aggressive but ensures we keep our timezone
      const originalId = nstElement.id;
      nstElement.id = '';
      nstElement.setAttribute('data-original-id', originalId);
      
      // Create a clone of the element that will hold our converted time permanently
      const permanentTimeElement = document.createElement('div');
      permanentTimeElement.innerHTML = convertedTime;
      permanentTimeElement.style.textAlign = 'center';
      permanentTimeElement.style.fontWeight = 'bold';
      permanentTimeElement.style.fontFamily = 'Verdana, Arial, Helvetica, sans-serif';
      permanentTimeElement.style.fontSize = '13px'; // Standard Neopets font size
      permanentTimeElement.style.lineHeight = '1.5';
      permanentTimeElement.style.display = 'flex';
      permanentTimeElement.style.flexDirection = 'column';
      permanentTimeElement.style.justifyContent = 'center';
      permanentTimeElement.style.alignItems = 'center';
      permanentTimeElement.style.height = '100%';
      permanentTimeElement.className = 'timezone-converter-permanent-classic';
      
      // Insert our permanent element in place of the original
      if (nstElement.parentNode && !document.querySelector('.timezone-converter-permanent-classic')) {
        nstElement.parentNode.insertBefore(permanentTimeElement, nstElement);
      }
    }
  }
  
  // Process modern layout element
  if (modernNstElement && userTimezone) {
    // Only save the original text content if we haven't already
    if (!modernNstElement.hasAttribute('data-original-nst')) {
      modernNstElement.setAttribute('data-original-nst', modernNstElement.textContent);
    }
    
    // Get the original NST time string
    const nstTimeString = modernNstElement.getAttribute('data-original-nst');
    
    // Convert the time
    const convertedTime = convertNSTtoTimezone(nstTimeString, userTimezone);
    
    // Clear existing content (hide NST time)
    modernNstElement.style.display = 'none';
    
    // Mark the element as permanently converted if requested
    if (isPermanent) {
      // Apply aggressive protection to prevent other scripts from updating it
      modernNstElement.setAttribute('data-timezone-converted', 'true');
      
      // Store the original class list before modifying
      if (!modernNstElement.hasAttribute('data-original-class')) {
        modernNstElement.setAttribute('data-original-class', modernNstElement.className);
      }
      
      // Create a clone of the element that will hold our converted time permanently
      const permanentTimeElement = document.createElement('div');
      permanentTimeElement.innerHTML = convertedTime;
      permanentTimeElement.style.textAlign = 'center';
      permanentTimeElement.style.fontWeight = 'bold';
      permanentTimeElement.style.fontFamily = 'Verdana, Arial, Helvetica, sans-serif';
      permanentTimeElement.style.fontSize = '13px'; // Standard Neopets font size
      permanentTimeElement.style.lineHeight = '1.5';
      permanentTimeElement.style.display = 'flex';
      permanentTimeElement.style.flexDirection = 'column';
      permanentTimeElement.style.justifyContent = 'center';
      permanentTimeElement.style.alignItems = 'center';
      permanentTimeElement.style.height = '100%';
      permanentTimeElement.className = 'timezone-converter-permanent';
      
      // Position it properly
      permanentTimeElement.style.position = 'relative';
      
      // Insert our permanent element in the same place as the original
      if (modernNstElement.parentNode && !document.querySelector('.timezone-converter-permanent')) {
        modernNstElement.parentNode.insertBefore(permanentTimeElement, modernNstElement);
      }
    }
  }
}

// Listen for messages from the popup - wrapped in try-catch for safety
try {
  browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // First verify extension context is valid
    if (!isExtensionContextValid) return;
    
    if (message && message.action === 'updateTimezone') {
      // Update our cached timezone and refresh display
      safelyAccessBrowserAPI(
        (callback) => browser.storage.sync.get('timezone')
          .then(data => callback(data))
          .catch(error => {
            console.warn('Error getting timezone:', error);
            callback({});
          }),
        function(data) {
          if (data && data.timezone) {
            userTimezone = data.timezone;
            updateTimeDisplay();
          }
        }
      );
    }
    
    // Make sure to return true for Firefox's asynchronous message handling
    return true;
  });
} catch (error) {
  console.warn('Failed to set up message listener:', error.message);
  isExtensionContextValid = false;
}

// Initial update with safety check
try {
  // Check context validity before initial update
  if (!browser.runtime || !browser.runtime.id) {
    isExtensionContextValid = false;
    console.warn('Extension context invalid during initialization');
  } else {
    updateTimeDisplay();
    // Add a slight delay before first color check to ensure elements are created
    setTimeout(updateResetTimeColor, 1000);
  }
} catch (error) {
  console.warn('Error during initial update:', error.message);
  isExtensionContextValid = false;
}

// Store interval ID so we can clear it if needed
let updateIntervalId = null;

// We don't want an interval that keeps updating the time back to NST
// So we'll use a one-time update instead
if (isExtensionContextValid) {
  // Just perform the update once, without an interval
  updateTimeDisplay();
}

// Function to update the color of time displays based on proximity to reset
function updateResetTimeColor() {
  if (!isExtensionContextValid || !userTimezone) return;
  
  // Check if we're close to reset
  const resetSoon = isCloseToReset();
  const textColor = resetSoon ? '#FF0000' : 'inherit';
  
  // Update the permanent elements we created
  const classicTimeElement = document.querySelector('.timezone-converter-permanent-classic');
  const modernTimeElement = document.querySelector('.timezone-converter-permanent');
  
  // Update colors of classic layout time display
  if (classicTimeElement) {
    const spans = classicTimeElement.querySelectorAll('span');
    spans.forEach(span => {
      span.style.color = textColor;
    });
  }
  
  // Update colors of modern layout time display
  if (modernTimeElement) {
    const spans = modernTimeElement.querySelectorAll('span');
    spans.forEach(span => {
      span.style.color = textColor;
    });
  }
}

// Start an interval to check and update the color regularly
setInterval(updateResetTimeColor, 60000); // Check every minute

// Initial color check
updateResetTimeColor();

// Set up a MutationObserver to monitor for changes in the NST elements
// This handles cases where the site updates the NST elements dynamically
function setupNSTObserver() {
  try {
    // Get the classic and modern NST elements
    const nstElement = document.getElementById('nst');
    const modernNstElement = document.querySelector('div.nst.nav-top-nst');
    
    // Set up observer for classic layout
    if (nstElement && isExtensionContextValid) {
      console.log('DEBUG: Setting up MutationObserver for classic NST element');
      
      // Create a new observer for classic layout
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // Only act if the element hasn't been permanently converted
          if (!nstElement.hasAttribute('data-timezone-converted')) {
            console.log('DEBUG: Classic NST element mutation detected');
            performTimeUpdate(true); // Set to true for permanent conversion
          }
        });
      });
      
      // Start observing the classic layout element for configured mutations
      observer.observe(nstElement, { childList: true, characterData: true, subtree: true });
    }
    
    // Set up observer for modern layout
    if (modernNstElement && isExtensionContextValid) {
      console.log('DEBUG: Setting up MutationObserver for modern NST element');
      
      // Create a new observer for modern layout
      const modernObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // Only act if the element hasn't been permanently converted
          if (!modernNstElement.hasAttribute('data-timezone-converted')) {
            console.log('DEBUG: Modern NST element mutation detected');
            performTimeUpdate(true); // Set to true for permanent conversion
          }
        });
      });
      
      // Start observing the modern layout element for configured mutations
      modernObserver.observe(modernNstElement, { childList: true, characterData: true, subtree: true });
    }
    
    // Set up a document observer to detect when new NST elements are added
    const bodyObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Check if any added nodes contain the NST elements we're looking for
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check each added node
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            
            // Only process Element nodes
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this is the modern NST element
              if (node.classList && node.classList.contains('nst') && node.classList.contains('nav-top-nst')) {
                console.log('DEBUG: Modern NST element dynamically added');
                performTimeUpdate(true); // Set to true for permanent conversion
              }
              
              // Or if it contains a modern NST element
              const modernNstElements = node.querySelectorAll('div.nst.nav-top-nst');
              if (modernNstElements.length > 0) {
                console.log('DEBUG: Container with modern NST elements added');
                performTimeUpdate(true); // Set to true for permanent conversion
              }
              
              // Check for classic NST element
              if (node.id === 'nst') {
                console.log('DEBUG: Classic NST element dynamically added');
                performTimeUpdate(true); // Set to true for permanent conversion
              }
              
              // Or if it contains the classic NST element
              const classicNstElements = node.querySelectorAll('#nst');
              if (classicNstElements.length > 0) {
                console.log('DEBUG: Container with classic NST element added');
                performTimeUpdate(true); // Set to true for permanent conversion
              }
            }
          }
        }
      });
    });
    
    // Start observing the document body for added nodes
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    console.log('DEBUG: Body observer set up to detect dynamically added NST elements');
    
  } catch (error) {
    console.warn('Error setting up observers:', error.message);
    isExtensionContextValid = false;
  }
}

// Initialize the observer
setupNSTObserver();
