export function isNullOrWhiteSpace (val:string): boolean {
    return (val === undefined || val === null || val.trim() === '');
}

export function stripTags(val:string): string {
    return val.replace(/<[^>]*>/g, "", );
}
