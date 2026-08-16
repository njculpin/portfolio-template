export type SocialLink = {
  platform: string;
  url: string;
};

export type WizardFormData = {
  name: string;
  tagline: string;
  bio: string;
  email: string;
  location: string;
  social: SocialLink[];
  domains: string[];
  homepage: string;
  project: string;
  navigation: string;
  themePreset: string;
  blogEnabled: boolean;
  storeEnabled: boolean;
  deployment: string;
};
