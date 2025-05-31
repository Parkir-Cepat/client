declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: SnapPaymentOptions) => void;
      embed: (token: string, options: SnapEmbedOptions) => void;
    };
  }
}

export interface SnapPaymentOptions {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

export interface SnapEmbedOptions {
  embedId: string;
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

export interface SnapResult {
  order_id: string;
  status_code: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  finish_redirect_url?: string;
}

class MidtransService {
  private clientKey: string;
  private environment: 'sandbox' | 'production';
  private isScriptLoaded: boolean = false;

  constructor() {
    this.clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
    this.environment = import.meta.env.VITE_MIDTRANS_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  }

  // Load Midtrans Snap script
  async loadSnapScript(): Promise<void> {
    if (this.isScriptLoaded || window.snap) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.environment === 'production' 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.stg.midtrans.com/snap/snap.js';
      
      script.setAttribute('data-client-key', this.clientKey);
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Midtrans Snap script'));
      };

      document.head.appendChild(script);
    });
  }

  // Open Snap payment popup
  async openSnapPayment(
    snapToken: string,
    options: SnapPaymentOptions = {}
  ): Promise<void> {
    try {
      await this.loadSnapScript();
      
      if (!window.snap) {
        throw new Error('Midtrans Snap not loaded');
      }

      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          options.onSuccess?.(result);
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          options.onPending?.(result);
        },
        onError: (result) => {
          console.error('Payment error:', result);
          options.onError?.(result);
        },
        onClose: () => {
          console.log('Payment popup closed');
          options.onClose?.();
        },
      });
    } catch (error) {
      console.error('Failed to open Snap payment:', error);
      throw error;
    }
  }

  // Embed Snap payment in element
  async embedSnapPayment(
    snapToken: string,
    options: SnapEmbedOptions
  ): Promise<void> {
    try {
      await this.loadSnapScript();
      
      if (!window.snap) {
        throw new Error('Midtrans Snap not loaded');
      }

      window.snap.embed(snapToken, {
        embedId: options.embedId,
        onSuccess: (result) => {
          console.log('Payment success:', result);
          options.onSuccess?.(result);
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          options.onPending?.(result);
        },
        onError: (result) => {
          console.error('Payment error:', result);
          options.onError?.(result);
        },
        onClose: () => {
          console.log('Payment closed');
          options.onClose?.();
        },
      });
    } catch (error) {
      console.error('Failed to embed Snap payment:', error);
      throw error;
    }
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Get payment methods
  getPaymentMethods() {
    return [
      {
        id: 'qris',
        name: 'QRIS',
        description: 'Bayar dengan scan QR Code',
        icon: '📱',
      },
      {
        id: 'virtual_account',
        name: 'Virtual Account',
        description: 'Transfer melalui ATM/Internet Banking',
        icon: '🏦',
      },
      {
        id: 'ewallet',
        name: 'E-Wallet',
        description: 'Gopay, Dana, OVO, ShopeePay',
        icon: '💳',
      },
      {
        id: 'credit_card',
        name: 'Kartu Kredit',
        description: 'Visa, Mastercard, JCB',
        icon: '💳',
      },
      {
        id: 'saldo',
        name: 'Saldo ParkirCepat',
        description: 'Bayar dengan saldo akun',
        icon: '💰',
      },
    ];
  }

  // Validate amount
  validateAmount(amount: number): boolean {
    return amount >= 1000 && amount <= 500000000; // Min 1k, Max 500M
  }

  // Get minimum amount
  getMinimumAmount(): number {
    return 1000;
  }

  // Get maximum amount
  getMaximumAmount(): number {
    return 500000000;
  }
}

export const midtransService = new MidtransService();
