const getLocalTime = () => {
  return new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
};

export { getLocalTime };
