import {
  blockFeed,
  blockReels,
  devMode,
  platformFacebook,
  platformYouTube,
  platformInstagram,
  platformTwitter,
  platformTikTok,
} from '@/lib/storage';

// Platform toggles
const platformFbToggle = document.getElementById('toggle-platform-facebook') as HTMLInputElement;
const platformYtToggle = document.getElementById('toggle-platform-youtube') as HTMLInputElement;
const platformIgToggle = document.getElementById('toggle-platform-instagram') as HTMLInputElement;
const platformTwToggle = document.getElementById('toggle-platform-twitter') as HTMLInputElement;
const platformTtToggle = document.getElementById('toggle-platform-tiktok') as HTMLInputElement;

// Facebook-specific options
const feedToggle = document.getElementById('toggle-feed') as HTMLInputElement;
const reelsToggle = document.getElementById('toggle-reels') as HTMLInputElement;
const devModeToggle = document.getElementById('toggle-devmode') as HTMLInputElement;
const fbOptions = document.getElementById('fb-options') as HTMLElement;

// Load current state
[
  platformFbToggle.checked,
  platformYtToggle.checked,
  platformIgToggle.checked,
  platformTwToggle.checked,
  platformTtToggle.checked,
  feedToggle.checked,
  reelsToggle.checked,
  devModeToggle.checked,
] = await Promise.all([
  platformFacebook.getValue(),
  platformYouTube.getValue(),
  platformInstagram.getValue(),
  platformTwitter.getValue(),
  platformTikTok.getValue(),
  blockFeed.getValue(),
  blockReels.getValue(),
  devMode.getValue(),
]);

// Show/hide Facebook options based on FB platform toggle
function updateFbOptionsVisibility() {
  fbOptions.style.display = platformFbToggle.checked ? '' : 'none';
}
updateFbOptionsVisibility();

// Wire up platform toggles
platformFbToggle.addEventListener('change', () => {
  platformFacebook.setValue(platformFbToggle.checked);
  updateFbOptionsVisibility();
});
platformYtToggle.addEventListener('change', () =>
  platformYouTube.setValue(platformYtToggle.checked)
);
platformIgToggle.addEventListener('change', () =>
  platformInstagram.setValue(platformIgToggle.checked)
);
platformTwToggle.addEventListener('change', () =>
  platformTwitter.setValue(platformTwToggle.checked)
);
platformTtToggle.addEventListener('change', () =>
  platformTikTok.setValue(platformTtToggle.checked)
);

// Wire up Facebook-specific toggles
feedToggle.addEventListener('change', () => blockFeed.setValue(feedToggle.checked));
reelsToggle.addEventListener('change', () => blockReels.setValue(reelsToggle.checked));
devModeToggle.addEventListener('change', () => devMode.setValue(devModeToggle.checked));
