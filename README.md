# JobTracker Demo

Open `index.html` in a modern browser. No PHP server, database, credentials, or backend setup is required. All JavaScript libraries and fonts are bundled under `vendor/`. The demo makes no CDN or external font requests and needs no internet connection. A phone still needs access to the computer running the local test server.

The demo includes 24 fictional repair orders and 8 inventory items. Create, edit, search, delete, add progress updates, view analytics, and print demo invoices. Changes are stored temporarily in this browser under `jobtracker-demo-hourly-v1`, and survive refreshes within the same local clock hour. At every new hour (for example 2:00 PM, then 3:00 PM), orders, parts, profile and photos reset to the defaults. An open app reloads at that boundary; a closed or suspended app checks expiry when reopened or resumed. Timing follows the device clock. No server storage is used. Use **Reset demo data** to reset immediately. Legacy demo storage entries are removed; unrelated site data is untouched. Browser storage must be available and have enough space for changes.

Images are stored temporarily in this browser, with up to five images per order and a 700 KB limit per image. No remote image upload occurs; images expire at the next clock hour.

Phone layouts use a fixed Home / Orders / New Order / Parts / Revenue bottom tab bar, order status filters, compact order rows and expandable parts, compact revenue summaries and a trend chart, two-column dashboard tiles (one column on very narrow phones), touch-size actions, and scrollable dialogs. Tablets and desktops retain tables and sidebar navigation. Large desktop content is constrained for readability.

Only the frontend and logo assets were copied from `../cc`. Production configuration, PHP files, SQL, and Git history are excluded.

The center New Order button opens the repair form directly. Add Part is available in the Spare Parts section.

Page title banners have been removed. Add Part is in the inventory content toolbar; revenue period selection is above the revenue summary.

Bundled versions: React/ReactDOM 18.2.0, Babel Standalone 7.23.5, Tailwind 3.4.17, Chart.js 4.4.1. Fonts: DM Sans (300-700) and DM Mono (400/500). Original license notices are retained in `vendor/licenses/`.

The demo app icon is bundled in `assets/icons/` with 32, 64, 180, 192 and 512 pixel exports and the original master. Browser, Apple home-screen and web manifest references use these local assets. Existing home-screen shortcuts may need to be removed and added again to pick up a changed icon.

Home includes a centered About Me section, initially named "My Name". Use Edit profile and the avatar button to set your name, optional introduction, and photo. Profile settings and photos are temporary and reset with the sample orders at the next clock hour or Reset demo data. Profile photos accept JPG, PNG and WebP camera images up to 30 MB, plus HEIC/HEIF when the browser can decode them. The browser resizes the photo to at most 512 pixels on its longest edge and compresses it to JPEG locally before displaying (maximum processed size 350 KB). Unsupported or unreadable photos show a specific error and preserve the existing photo. Reset demo data is available at the bottom of Home.
