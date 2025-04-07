
// Set the restaurant currency  related to its country
const countryCurrencyMap = {
  Ethiopia: "ETB",
  USA: "USD",
  Canada: "CAD",
  Mexico: "MXN",
  China: "CNY",
  Japan: "JPY",
};

const setCurrency = function (next) {
  if (this.restaurantCountry) {
    this.currency = countryCurrencyMap[this.restaurantCountry]; 
  }
  next();
};

export default setCurrency;
