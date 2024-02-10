import { guessEnums } from "./postgres.js";

export default async function generateStructuredMessage(table, query) {
    const possibleSchema = await guessEnums(table);

    return [
        {
            role: "system",
            content: `You are a data analyst that will be coding raw Postgres SQL requests to query provided data information. ` +
                `I am providing you with data-relevant information below. Write me a Postgres SQL Request based off of the following question about the data ` +
                `(provided below). In your output, strictly provide the Postgres SQL code and no other text. Again, ONLY provide the Postgres SQL code.`
        },
        {
            role: "user",
            content: `Table Name: ${table}\n` +
                `${Object.entries(possibleSchema).map(([col, data], i) => {
                    return `Column ${i + 1}:\n\tName: ${col}\n\tType: ${data.type}\n\t${data.type === 'enum' ? `Likely Values: ${data.values.join(', ')}` : `Example Values: ${data.possibleValues.join(', ')}...`}`
                }).join('\n')}\n\n` +
                `User's Question: ${query}`
        }
    ]
}