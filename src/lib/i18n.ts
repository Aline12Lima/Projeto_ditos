export const locales = ["pt", "es", "en"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  pt: "Português",
  es: "Español",
  en: "English",
};

export const dictionary = {
  pt: { navigation: { home: "Início", about: "Sobre", contact: "Contato" }, hero: { eyebrow: "Ditus", title: "Uma nova experiência está chegando.", description: "Estamos preparando cada detalhe para apresentar a Ditus do jeito certo.", action: "Conheça a Ditus" } },
  es: { navigation: { home: "Inicio", about: "Nosotros", contact: "Contacto" }, hero: { eyebrow: "Ditus", title: "Una nueva experiencia está por llegar.", description: "Estamos preparando cada detalle para presentar Ditus de la manera correcta.", action: "Conoce Ditus" } },
  en: { navigation: { home: "Home", about: "About", contact: "Contact" }, hero: { eyebrow: "Ditus", title: "A new experience is on its way.", description: "We are preparing every detail to introduce Ditus the right way.", action: "Discover Ditus" } },
} as const;
