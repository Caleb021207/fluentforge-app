
export type NavItem = {
  icon: React.ComponentType;
  label: string;
  path: string;
  to: string;
  requiresAuth?: boolean;
};

export type LanguageTranslations = {
  [key: string]: {
    [key: string]: string;
  };
};
