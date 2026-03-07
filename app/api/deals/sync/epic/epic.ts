export async function fetchEpicDeals() {
  const response = await fetch("https://www.cheapshark.com/api/1.0/deals?storeID=3&upperPrice=60&pageSize=20");
  const data = await response.json();

  return data.map((deal: any) => ({
    deal_id: deal.dealID,
    title: deal.title,
    store: "Epic",
    price_new: deal.price,
    price_old: deal.normalPrice,
    url: deal.url,
    deal_url: deal.dealID,
  }));
}