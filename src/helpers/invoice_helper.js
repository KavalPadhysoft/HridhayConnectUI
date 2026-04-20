import { get } from "./api_helper";
// Get Invoice Number from API
export async function getNewInvoiceNumber() {
  // -1 is used to get the next invoice number
  return await get("/Invoice/GetById?id=-1");
}
