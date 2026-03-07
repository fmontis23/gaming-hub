export const fetchSteamDeals = async () => {
  const response = await fetch("https://www.cheapshark.com/api/1.0/deals?storeID=2&upperPrice=60&pageSize=20");
  const data = await response.json();

  return data.map((deal: any) => ({
    title: deal.title,
    price: deal.price,
    oldPrice: deal.oldPrice,
    savings: deal.savings,
    url: deal.dealURL,
    image: deal.image,
    dealEnds: deal.dealEnds,
    storeID: "Steam",
  }));
};