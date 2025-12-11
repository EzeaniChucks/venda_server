import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = "https://api.paystack.co";

interface Bank {
  id: number;
  name: string;
  code: string;
}

interface BankVerificationResponse {
  status: boolean;
  message: string;
  data?: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface PaystackAuthorizationData {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
}

export interface PaystackChargeResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: PaystackAuthorizationData;
    customer: {
      id: number;
      customer_code: string;
      email: string;
    };
  };
}

class BankService {
  private headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  async initializeTransaction(
    email: string,
    amount: number,
    metadata?: any
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${PAYSTACK_API_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          metadata: {
            ...metadata,
            custom_fields: [
              {
                display_name: "Subscription",
                variable_name: "subscription",
                value: "vendor_subscription",
              },
            ],
          },
          channels: [
            "card",
            "bank",
            "ussd",
            "qr",
            "mobile_money",
            "bank_transfer",
          ],
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Paystack initialization error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to initialize payment"
      );
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackChargeResponse> {
    try {
      const response = await axios.get(
        `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Paystack verification error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to verify payment"
      );
    }
  }

  async chargeAuthorization(
    authorizationCode: string,
    email: string,
    amount: number,
    reference: string,
    metadata?: any
  ): Promise<PaystackChargeResponse> {
    try {
      const response = await axios.post(
        `${PAYSTACK_API_URL}/transaction/charge_authorization`,
        {
          authorization_code: authorizationCode,
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          metadata,
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Paystack charge error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.message || "Failed to charge card");
    }
  }

  async createCustomer(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${PAYSTACK_API_URL}/customer`,
        {
          email,
          first_name: firstName,
          last_name: lastName,
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Paystack customer creation error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to create customer"
      );
    }
  }

  async fetchCustomer(emailOrCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `${PAYSTACK_API_URL}/customer/${emailOrCode}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Paystack fetch customer error:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  generateReference(): string {
    return `SUB_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;
  }

   // Get list of Nigerian banks from Paystack
   async getBanks(): Promise<Bank[]> {
    try {
      const response = await axios.get(`${PAYSTACK_API_URL}/bank`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      if (response.data.status) {
        return response.data.data.map((bank: any) => ({
          id: bank.id,
          name: bank.name,
          code: bank.code,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching banks:", error);
      return [];
    }
  }

  // Verify bank account
  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<BankVerificationResponse> {
    try {
      const response = await axios.get(
        `${PAYSTACK_API_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      if (response.data.status) {
        return {
          status: true,
          message: "Account verified successfully",
          data: response.data.data,
        };
      }

      return {
        status: false,
        message: response.data.message || "Verification failed",
      };
    } catch (error: any) {
      console.error("Error verifying account:", error);
      return {
        status: false,
        message:
          error.response?.data?.message ||
          "Verification failed. Please check details and try again.",
      };
    }
  }
}

export default new BankService();
