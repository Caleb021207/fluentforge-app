
export type NavItem = {
  icon?: React.ComponentType;
  label: string;
  path: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
};

export type LanguageTranslations = {
  [key: string]: {
    [key: string]: string;
  };
};
