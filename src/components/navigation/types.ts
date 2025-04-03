
export type NavItem = {
  icon: React.ComponentType;
  label: string;
  path: string;
};

export type LanguageTranslations = {
  [key: string]: {
    [key: string]: string;
  };
};
