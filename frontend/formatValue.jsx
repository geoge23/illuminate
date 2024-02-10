function isIsoDate(str) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    const d = new Date(str);
    return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str; // valid date 
}

export default function formatValue(value) {
    if (isIsoDate(value)) {
        // give date string if time is 00:00:00
        const date = new Date(value);
        if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
            return date.toLocaleDateString();
        } else {
            return date.toLocaleString();
        }
    }

    //if its a number, format it
    if (!isNaN(value)) {
        return <code>{value}</code>
    }
    return value;
}

export function kebabCaseToTitleCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}