export const fetchSteamDeals = async () => {
  const steamStoreID = 2; // Store ID per Steam
  const cheapSharkAPIUrl = "https://www.cheapshark.com/api/1.0/deals"; // CheapShark API URL

  const response = await fetch(`${cheapSharkAPIUrl}?storeID=${steamStoreID}&upperPrice=60&pageSize=20`);
  const data = await response.json();

  return data.map((deal: any) => ({
    title: deal.title,
    store: "Steam",
    price_new: deal.salePrice,
    price_old: deal.normalPrice,
    url: deal.dealID,
    id: deal.dealID,
  }));
};