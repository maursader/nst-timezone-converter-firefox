// Flag to track if extension context is valid
let isExtensionContextValid = true;

// Helper function to safely access Browser APIs
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

document.addEventListener('DOMContentLoaded', function() {
  const timezoneSelect = document.getElementById('timezone');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const resetTimeElement = document.getElementById('reset-time-local');
  const resetCountdownElement = document.getElementById('reset-countdown');
  
  // Function to show error message when extension context is invalid
  function showContextError() {
    statusDiv.textContent = 'Extension needs to be reloaded. Please refresh the page.';
    statusDiv.style.color = 'red';
    timezoneSelect.disabled = true;
    saveButton.disabled = true;
  }

  // List of timezones with their offset and name
  const timezones = [
    { value: 'Pacific/Honolulu', name: '(GMT-10:00) Hawaii' },
    { value: 'America/Anchorage', name: '(GMT-09:00) Alaska' },
    { value: 'America/Los_Angeles', name: '(GMT-08:00) Pacific Time (US & Canada) - NST' },
    { value: 'America/Denver', name: '(GMT-07:00) Mountain Time (US & Canada)' },
    { value: 'America/Chicago', name: '(GMT-06:00) Central Time (US & Canada)' },
    { value: 'America/New_York', name: '(GMT-05:00) Eastern Time (US & Canada)' },
    { value: 'America/Halifax', name: '(GMT-04:00) Atlantic Time (Canada)' },
    { value: 'America/Argentina/Buenos_Aires', name: '(GMT-03:00) Buenos Aires' },
    { value: 'Atlantic/South_Georgia', name: '(GMT-02:00) Mid-Atlantic' },
    { value: 'Atlantic/Azores', name: '(GMT-01:00) Azores' },
    { value: 'Europe/London', name: '(GMT+00:00) London, United Kingdom' },
    { value: 'Europe/Paris', name: '(GMT+01:00) Paris, France' },
    { value: 'Europe/Helsinki', name: '(GMT+02:00) Helsinki, Finland' },
    { value: 'Europe/Moscow', name: '(GMT+03:00) Moscow, Russia' },
    { value: 'Asia/Dubai', name: '(GMT+04:00) Dubai, UAE' },
    { value: 'Asia/Karachi', name: '(GMT+05:00) Karachi, Pakistan' },
    { value: 'Asia/Dhaka', name: '(GMT+06:00) Dhaka, Bangladesh' },
    { value: 'Asia/Bangkok', name: '(GMT+07:00) Bangkok, Thailand' },
    { value: 'Asia/Shanghai', name: '(GMT+08:00) Shanghai, China' },
    { value: 'Asia/Taipei', name: '(GMT+08:00) Taipei, Taiwan' },
    { value: 'Asia/Hong_Kong', name: '(GMT+08:00) Hong Kong' },
    { value: 'Asia/Tokyo', name: '(GMT+09:00) Tokyo, Japan' },
    { value: 'Australia/Sydney', name: '(GMT+10:00) Sydney, Australia' },
    { value: 'Pacific/Auckland', name: '(GMT+12:00) Auckland, New Zealand' }
  ];

  // Populate the timezone dropdown
  timezones.forEach(tz => {
    const option = document.createElement('option');
    option.value = tz.value;
    option.textContent = tz.name;
    timezoneSelect.appendChild(option);
  });

  // Set the selected timezone from storage - with error handling
  try {
    // First check if extension context is valid
    if (!browser.runtime || !browser.runtime.id) {
      showContextError();
      return;
    }
    
    safelyAccessBrowserAPI(
      (callback) => browser.storage.sync.get('timezone').then(callback).catch(error => {
        console.warn('Error getting timezone:', error);
        callback({});
      }),
      function(data) {
        if (!isExtensionContextValid) {
          showContextError();
          return;
        }
        
        if (data && data.timezone) {
          timezoneSelect.value = data.timezone;
        } else {
          // Default to browser's timezone if no saved preference
          const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timezones.some(tz => tz.value === browserTimezone)) {
            timezoneSelect.value = browserTimezone;
          }
        }
        
        // Update reset time information
        updateResetTimeInfo(timezoneSelect.value);
      }
    );
  } catch (error) {
    console.warn('Error loading timezone preference:', error);
    showContextError();
  }

  // Save the selected timezone with proper error handling
  saveButton.addEventListener('click', function() {
    // Check if extension context is valid first
    if (!isExtensionContextValid) {
      showContextError();
      return;
    }
    
    const selectedTimezone = timezoneSelect.value;
    
    try {
      safelyAccessBrowserAPI(
        (callback) => browser.storage.sync.set({ 'timezone': selectedTimezone })
          .then(() => callback())
          .catch(error => {
            console.warn('Error setting timezone:', error);
            callback(error);
          }),
        function(error) {
          if (error) {
            statusDiv.textContent = 'Error saving timezone!';
            statusDiv.style.color = 'red';
            return;
          }
          
          if (!isExtensionContextValid) {
            showContextError();
            return;
          }
          
          statusDiv.textContent = 'Timezone saved!';
          statusDiv.style.color = 'green';
          setTimeout(function() {
            statusDiv.textContent = '';
            statusDiv.style.color = '';
          }, 2000);
          
          // Update reset time information with new timezone
          updateResetTimeInfo(selectedTimezone);
          
          // Notify all tabs that the timezone has changed
          try {
            safelyAccessBrowserAPI(
              (callback) => browser.tabs.query({url: '*://*.neopets.com/*'})
                .then(callback)
                .catch(error => {
                  console.warn('Error querying tabs:', error);
                  callback([]);
                }),
              function(tabs) {
                if (!isExtensionContextValid || !tabs) {
                  return;
                }
                
                tabs.forEach(tab => {
                  try {
                    browser.tabs.sendMessage(tab.id, { action: 'updateTimezone' })
                      .catch(error => {
                        console.warn('Error sending message to tab:', error);
                        // Don't set isExtensionContextValid to false here
                        // as errors might just be for individual tabs
                      });
                  } catch (error) {
                    console.warn('Error sending message to tab:', error);
                    // Don't set isExtensionContextValid to false here
                    // as errors might just be for individual tabs
                  }
                });
              }
            );
          } catch (error) {
            console.warn('Error querying tabs:', error);
            isExtensionContextValid = false;
            showContextError();
          }
        }
      );
    } catch (error) {
      console.warn('Error saving timezone:', error);
      isExtensionContextValid = false;
      showContextError();
    }
  });
  
  // Handle timezone dropdown change to preview reset times
  timezoneSelect.addEventListener('change', function() {
    updateResetTimeInfo(timezoneSelect.value);
  });
  
  // Function to calculate and display the reset time in local timezone
  function updateResetTimeInfo(timezone) {
    try {
      if (!timezone) return;
      if (!isExtensionContextValid) {
        showContextError();
        return;
      }
      
      // Get the current date in UTC
      const now = new Date();
      
      // Create a date for the NST midnight reset
      // This is a more reliable way to handle timezone conversions
      
      // Step 1: Determine the current date in Los Angeles (NST)
      const laOptions = {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      };
      
      const laFormatter = new Intl.DateTimeFormat('en-US', laOptions);
      const laParts = laFormatter.formatToParts(now);
      
      // Extract the LA date components
      const laYear = parseInt(laParts.find(part => part.type === 'year').value);
      const laMonth = parseInt(laParts.find(part => part.type === 'month').value) - 1; // 0-indexed months
      const laDay = parseInt(laParts.find(part => part.type === 'day').value);
      const laHour = parseInt(laParts.find(part => part.type === 'hour').value);
      const laMinute = parseInt(laParts.find(part => part.type === 'minute').value);
      
      // Step 2: If it's already past midnight in LA, we use the next day for reset
      let resetDay = laDay;
      if (laHour > 0 || (laHour === 0 && laMinute > 0)) {
        // Create a new date for tomorrow in LA
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tomorrowLaParts = laFormatter.formatToParts(tomorrow);
        resetDay = parseInt(tomorrowLaParts.find(part => part.type === 'day').value);
      }
      
      // Step 3: Create the reset time in UTC (using the LA date but with time 00:00:00)
      // We're creating a string in ISO format that specifies the reset time in LA timezone
      const resetTimeStr = `${laYear}-${String(laMonth + 1).padStart(2, '0')}-${String(resetDay).padStart(2, '0')}T00:00:00-${isCaliforniaInDST() ? '07:00' : '08:00'}`;
      
      // Parse the string to get a proper Date object
      const resetDate = new Date(resetTimeStr);
      
      console.log('Reset date (UTC):', resetDate.toISOString());
      console.log('Reset time calculation for timezone:', timezone);
      
      // Step 4: Format the reset time in the user's selected timezone
      const userTzFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
      });
      
      // Get the formatted time in user's timezone
      const localResetTime = userTzFormatter.format(resetDate);
      resetTimeElement.textContent = localResetTime;
      
      // Check if close to reset time (less than 1 hour until reset)
      const currentTime = new Date();
      const timeDiff = resetDate.getTime() - currentTime.getTime();
      const hoursUntilReset = Math.floor(timeDiff / (1000 * 60 * 60));
      
      // Apply red color to the reset time if less than 1 hour until reset
      if (hoursUntilReset < 1) {
        resetTimeElement.style.color = '#FF0000'; // Bright red
      } else {
        resetTimeElement.style.color = ''; // Default color
      }
      
      // Calculate time until next reset
      updateCountdown(resetDate);
      
      // Update countdown every minute
      clearInterval(window.countdownInterval);
      window.countdownInterval = setInterval(function() {
        if (!isExtensionContextValid) {
          clearInterval(window.countdownInterval);
          showContextError();
          return;
        }
        updateCountdown(resetDate);
      }, 60000); // update every minute
    } catch (error) {
      console.error('Error updating reset time info:', error.message, error.stack);
      resetTimeElement.textContent = 'Error calculating reset time';
      resetCountdownElement.textContent = 'Error';
    }
  }
  
  // Function to update the countdown display
  function updateCountdown(resetDate) {
    try {
      if (!isExtensionContextValid) return;
      
      // Get current time
      const currentTime = new Date();
      
      // Calculate time difference in milliseconds
      let timeDiff = resetDate.getTime() - currentTime.getTime();
      
      // If for some reason we got a negative time difference, show message
      if (timeDiff < 0) {
        resetCountdownElement.textContent = 'Reset time passed';
        return;
      }
      
      // Convert to hours, minutes, seconds
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      timeDiff -= hours * (1000 * 60 * 60);
      
      const minutes = Math.floor(timeDiff / (1000 * 60));
      timeDiff -= minutes * (1000 * 60);
      
      const seconds = Math.floor(timeDiff / 1000);
      
      // Format the countdown text
      let countdownText = '';
      
      if (hours > 0) {
        const hourText = hours === 1 ? 'hour' : 'hours';
        countdownText += `${hours} ${hourText}`;
      }
      
      if (minutes > 0 || hours > 0) {
        if (hours > 0) countdownText += ', ';
        const minuteText = minutes === 1 ? 'minute' : 'minutes';
        countdownText += `${minutes} ${minuteText}`;
      }
      
      if ((minutes === 0 && hours === 0) || seconds > 0) {
        if (countdownText !== '') countdownText += ', ';
        const secondText = seconds === 1 ? 'second' : 'seconds';
        countdownText += `${seconds} ${secondText}`;
      }
      
      // Set text color to red if less than 1 hour until reset
      if (hours === 0) {
        resetCountdownElement.style.color = '#FF0000'; // Bright red
      } else {
        resetCountdownElement.style.color = ''; // Default color
      }
      
      resetCountdownElement.textContent = countdownText || 'Less than a second';
    } catch (error) {
      console.error('Error updating countdown:', error.message, error.stack);
      resetCountdownElement.textContent = 'Error calculating countdown';
    }
  }
  
  // Check extension context on a periodic basis
  // This helps detect if the extension gets invalidated during use
  function setupContextCheck() {
    setInterval(() => {
      try {
        if (!browser.runtime || !browser.runtime.id) {
          isExtensionContextValid = false;
          showContextError();
        }
      } catch (error) {
        isExtensionContextValid = false;
        showContextError();
      }
    }, 5000); // Check every 5 seconds
  }
  
  // Start the context check
  setupContextCheck();
  
  // Helper function to determine if California (NST) is currently in Daylight Saving Time
  function isCaliforniaInDST(date = new Date()) {
    try {
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
    } catch (error) {
      console.warn('Error checking California DST:', error);
      return false;
    }
  }
});
