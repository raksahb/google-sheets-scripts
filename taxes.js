//todo get values from spreadsheet
// var sheet = SpreadsheetApp.getActiveSheet();
// var address = sheet.getRange('A1').getValue();
const brackets = [{ max: 0, rate: 0, currentTax: 0 },
{ max: 19750, rate: 0.1 },
{ max: 80250, rate: 0.12 },
{ max: 171050, rate: 0.22 },
{ max: 326600, rate: 0.24 },
{ max: 414700, rate: 0.32 },
{ max: 622050, rate: 0.35 },
{ max: Number.MAX_VALUE - 1000, rate: 0.37 },
].map((item, i, buckets) => { // calculate tax for current bucket - (current.max - previous.max) * current.rate
    const prevBracket = i > 0 ? buckets[i-1].max : 0;
    const currentTax = i < buckets.length -1 ? ((buckets[i].max - prevBracket) * buckets[i].rate) : 0;
    const result = {...item, currentTax};
    return result;
}).map((item, i, buckets) => { // calculate running total for tax for current bucket - previous.totalTax + current totalTax
  const totalTax = i != 0 ? buckets.filter(bracket => bracket.max <= item.max) // get previous buckets
              .map(x => x.currentTax) // only get tax for previous buckets
              .reduce((accumulator, currentValue) => accumulator + currentValue) // add tax for previous buckets
              : 0
    const result = {...item, totalTax};
    return result;
});

// google sheets formula to calculate federal taxes. currently only handles married-filing-jointly
function FEDERAL_TAX(taxableSalary=0) {
  if (taxableSalary === 0) {
    return 0;
  }
  
  let taxes = 0;
  for (let i = brackets.length - 1; i > 0; i--) {
    if (taxableSalary <= brackets[i].max && taxableSalary > brackets[i-1].max) {
      taxes = brackets[i-1].totalTax + ((taxableSalary - brackets[i-1].max) * brackets[i].rate);
      break;
    }
  }
  return taxes;
}
