# Neopets Timezone Converter

A Firefox extension that converts Neopets Standard Time (NST) to your preferred timezone.

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/neopets-timezone-converter/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/maursader/nst-timezone-converter-firefox)

## Features

### Automatic Time Conversion
- Instantly converts NST times displayed on Neopets pages to your local time
- Works with both modern and classic Neopets themes
- Updates in real-time as the clock on Neopets changes
- No more mental math or guesswork!

### Powerful Popup Menu
- Click the extension icon in your toolbar for additional tools
- See the exact time of the Neopets daily reset in your local timezone
- View a countdown timer showing exactly how much time is left until reset
- Visual alert: times and countdown turn bright red when less than an hour remains
- Helps you finish your dailies before the reset deadline

### User-Friendly Design
- Clean, Google-style UI for timezone selection
- Full control to manually set your timezone if needed
- Settings are saved and work across all tabs

### Privacy & Security
- Completely free with no hidden catches
- No ads or tracking
- 100% local operation with no remote server scripts
- Open source code available for anyone to check, audit, or contribute to
- Safe to use and compliant with Neopets rules (provides no unfair advantages)

## Installation

### From Firefox Add-ons
1. Visit the [Firefox Add-ons page](https://addons.mozilla.org/en-US/firefox/addon/neopets-timezone-converter/)
2. Click "Add to Firefox"
3. Confirm the installation
4. The extension icon will appear in your Firefox toolbar

### Manual Installation (Developer Mode)
1. Download or clone [this repository](https://github.com/maursader/nst-timezone-converter-firefox) to your computer
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the manifest.json file in the extension directory
5. The extension icon should now appear in your Firefox toolbar

**Note:** Temporary add-ons will be removed when Firefox is closed.

## Usage

1. Click the extension icon in your Firefox toolbar to open the settings popup
2. Select your preferred timezone from the dropdown list
3. Click "Save" to apply your settings
4. Visit Neopets.com - the NST time will now display in your chosen timezone

## Notes

- NST (Neopets Standard Time) is equivalent to Pacific Time (PST/PDT)
- The extension works by replacing the time display on the page, not by changing any game mechanics
- Your timezone preference is stored locally in your browser using Firefox's storage API

## Contributing

Feel free to fork this repository, make improvements, and submit pull requests. Here are some ways you can contribute:

1. Bug fixes or feature enhancements
2. Code optimization
3. UI/UX improvements
4. Documentation updates

## Support

If you encounter any issues with this extension, please report them via [GitHub issues](https://github.com/maursader/nst-timezone-converter-firefox/issues) or contact the developer.

## License

MIT License - Feel free to modify and distribute this extension as needed.
