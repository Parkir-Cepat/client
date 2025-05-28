/// <reference types="vite/client" />

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            context?: string;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: string;
            width?: number;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export {};
