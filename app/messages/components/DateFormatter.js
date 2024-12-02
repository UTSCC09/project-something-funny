const dateFormatter = (str) => {
  if (str === undefined)
    return;
  const date = new Date(str);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return (`${year}-${month}-${day}:${h}:${min}`);
}
export default dateFormatter;