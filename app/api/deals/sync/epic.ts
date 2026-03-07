export const fetchEpicDeals = async () => {
  const epicStoreID = 1; // Store ID per Epic Games
  const cheapSharkAPIUrl = "https://www.cheapshark.com/api/1.0/deals"; // CheapShark API URL

  const response = await fetch(`${cheapSharkAPIUrl}?storeID=${epicStoreID}&upperPrice=60&pageSize=20`);
  const data = await response.json();

  return data.map((deal: any) => ({
    title: deal.title,
    store: "Epic Games",
    price_new: deal.salePrice,
    price_old: deal.normalPrice,
    url: deal.dealID,
    id: deal.dealID,
  }));
};