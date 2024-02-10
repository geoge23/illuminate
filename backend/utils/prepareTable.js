//potential types of graphics are: barchart, piechart, scatterplot, statistic, table


export default function prepareTable(rows) {
    //are there more than one row?
    const row = rows[0];
    if (!row) {
        return {
            type: "statistic",
            data: {
                label: "Query failed",
                value: "No Data Available"
            }
        }
    }

    if (rows.length == 1) {
        if (Object.keys(row).length == 1) {
            const titleOfRow = Object.keys(row)[0]
            if (/percent/ig.test(titleOfRow) && isNumberInString(row[titleOfRow])) {
                return {
                    type: "piechart",
                    data: [
                        {
                            label: "Percent",
                            value: parseFloat(row[titleOfRow])
                        },
                        {
                            label: "Rest",
                            value: 100 - parseFloat(row[titleOfRow])
                        }
                    ]
                }
            } else {
                return {
                    type: "statistic",
                    data: {
                        label: titleOfRow,
                        value: row[titleOfRow]
                    }
                }
            }
        }

    } else {
        const numberOfColumns = Object.keys(row).length;
        if (numberOfColumns === 2) {
            const [numKey] = Object.entries(row).find(([_, val]) => isNumberInString(val))
            const [stringKey] = Object.entries(row).find(([_, val]) => typeof val === 'string')
            if (numKey && stringKey) {
                return {
                    type: "barchart",
                    data: rows.map(row => {
                        return {
                            label: row[stringKey],
                            value: parseFloat(row[numKey])
                        }
                    })
                }
            }
        } else {
            return {
                type: "table",
                data: rows
            }
        }
    }
}

// write a regex that matches numbers accounting for negatives and decimals
const numberRegex = /^-?\d*\.?\d+$/;

function isNumberInString(str) {
    return numberRegex.test(str);
}