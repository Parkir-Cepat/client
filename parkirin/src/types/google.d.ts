interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
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

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}
