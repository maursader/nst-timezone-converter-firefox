# Neopets Timezone Converter

A Firefox extension that converts Neopets Standard Time (NST) to your preferred timezone.

## Features

- Converts NST time display on Neopets.com to your selected timezone
- Shows daily reset time (12:00 AM NST) in your local timezone
- Displays countdown timer showing hours and minutes until next daily reset
- Clean, Google-style UI for timezone selection
- Settings are saved and work across all tabs
- Updates in real-time as the clock on Neopets changes

## Installation

### From Firefox Add-ons (Coming Soon)
1. Visit the Firefox Add-ons page (link TBD)
2. Click "Add to Firefox"
3. Confirm the installation

### Manual Installation (Developer Mode)
1. Download or clone this repository to your computer
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the manifest.json file in the extension directory
5. The extension icon should now appear in your Firefox toolbar

## Usage

1. Click the extension icon in your Firefox toolbar to open the settings popup
2. Select your preferred timezone from the dropdown list
3. Click "Save" to apply your settings
4. Visit Neopets.com - the NST time will now display in your chosen timezone

## Notes

- NST (Neopets Standard Time) is equivalent to Pacific Time (PST/PDT)
- The extension works by replacing the time display on the page, not by changing any game mechanics
- Your timezone preference is stored locally in your browser using Firefox's storage API

## Support

If you encounter any issues with this extension, please report them via GitHub issues or contact the developer.

## License

MIT License - Feel free to modify and distribute this extension as needed.
