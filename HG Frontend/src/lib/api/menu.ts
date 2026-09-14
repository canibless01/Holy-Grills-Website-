import { apiClient } from "./client";
import type { MenuItem } from "@/types";

export async function fetchMenuItems() {
  const response = await apiClient.get<{ data: MenuItem[] }>("/menu");
  return response.data.data;
}
