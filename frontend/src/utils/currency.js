const USD_TO_INR = 83; // Approximate conversion rate: 1 USD = 83 INR

export const convertToINR = (usd) => {
  if (usd == null || isNaN(usd)) return 0;
  return usd * USD_TO_INR;
};

export const formatINR = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return `₹${Number(amount).toFixed(0)}`;
};

export const convertToUSD = (inr) => {
  if (inr == null || isNaN(inr)) return 0;
  return inr / USD_TO_INR;
};
