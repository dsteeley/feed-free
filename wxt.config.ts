import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Feed Free',
    description:
      'Hide algorithmic feeds on Facebook, YouTube, Instagram, Twitter/X, and TikTok. Open source. Works on Firefox for Android.',
    permissions: ['storage'],
    icons: {
      16: 'icon-16.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
    browser_specific_settings: {
      gecko: {
        id: 'feed-free@feedfree.ext',
        strict_min_version: '140.0',
      },
      gecko_android: {
        strict_min_version: '140.0',
      },
    },
    data_collection_permissions: {
      required: [],
      optional: [],
    },
  },
});
