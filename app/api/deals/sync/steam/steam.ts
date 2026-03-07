export async function fetchSteamDeals() {
  const response = await fetch("https://www.cheapshark.com/api/1.0/deals?storeID=2&upperPrice=60&pageSize=20");
  const data = await response.json();

  return data.map((deal: any) => ({
    deal_id: deal.dealID,
    title: deal.title,
    store: "Steam",
    price_new: deal.price,
    price_old: deal.normalPrice,
    url: deal.url,
    deal_url: deal.dealID,
  }));
}