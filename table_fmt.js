
function importFormat(fmt)
{
    'use strict';

    const getTableInfo = (table, extractCols = val => val, formatter = fmt.FORMATTER) => {
        if(table.length === 0)
            return [];

        const maxOffsets = Array(extractCols(table[0]).length).fill(0);

        for(const row of table)
        {
            const cols = extractCols(row);
            for(let i = 0; i < cols.length; i++)
            {
                const formatted = formatter(cols[i]);
                const len = formatted.length;
                if(len > maxOffsets[i])
                    maxOffsets[i] = len;
            }
        }

        return maxOffsets;
    };

    const getTableFormat = (table, extractCols = val => val, formatter = fmt.FORMATTER) => {
        if(table.length === 0)
            return {rows: [], offsets: []};

        const height = table.length;
        const valueTable = Array(height);
        const maxOffsets = Array(extractCols(table[0]).length).fill(0);

        for(let j = 0; j < height; j++)
        {
            const row = table[j];
            const cols = extractCols(row);
            const valueRow = Array(cols.length);
            for(let i = 0; i < cols.length; i++)
            {
                valueRow[i] = formatter(cols[i]);

                const len = valueRow[i].length;
                if(len > maxOffsets[i])
                    maxOffsets[i] = len;
            }

            valueTable[j] = valueRow;
        }

        return {rows: valueTable, offsets: maxOffsets};
    };

    return {
        getTableInfo,
        getTableFormat,
    };
}
