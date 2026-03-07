// app/api/deals/sync/steam.ts
export const fetchSteamDeals = async () => {
  const url = "https://www.cheapshark.com/api/1.0/deals?storeID=2&pageSize=20";
  const response = await fetch(url);
  const data = await response.json();
  return data;
};