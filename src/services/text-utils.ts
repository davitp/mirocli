export const ellipsis = (input: string, length: number = 5) => input.length > length ? `${input.substring(0, length)}...` : input;