export const getFormattedDate = () => {
  const japanLocaleString = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
  });
  return japanLocaleString;
};
