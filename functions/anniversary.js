module.exports = () => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 80;
  const maxYear = currentYear - 18;
  const birthYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const birthMonthIndex = Math.floor(Math.random() * 12);
  const birthMonth = months[birthMonthIndex];
  const birthDay = Math.floor(Math.random() * 28) + 1;

  return {
    month: birthMonth,
    day: birthDay.toString(),
    year: birthYear.toString()
  };
};