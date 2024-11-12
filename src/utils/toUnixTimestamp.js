export const toUnixTimestamp = (dateStr) => {
  const date = new Date(
    `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  );
  return Math.floor(date.getTime() / 1000);
};
