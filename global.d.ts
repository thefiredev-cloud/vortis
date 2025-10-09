// Global type declarations for Vortis

interface Window {
  gtag?: (
    command: string,
    eventName: string,
    eventParams?: Record<string, any>
  ) => void;
}
