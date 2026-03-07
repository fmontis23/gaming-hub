// app/api/deals/sync/epic.ts
export const fetchEpicDeals = async () => {
  const url = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20";
  const response = await fetch(url);
  const data = await response.json();
  return data;
};