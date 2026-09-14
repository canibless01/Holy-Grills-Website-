import { apiClient } from "./client";

export type PaymentPayload = {
  total: number;
  method: "delivery" | "pickup";
  hp: number;
};

export async function processPayment(payload: PaymentPayload) {
  const response = await apiClient.post<{ data: PaymentPayload & { reference: string; status: "success" } }>("/payments/process", payload);
  return response.data.data;
}
