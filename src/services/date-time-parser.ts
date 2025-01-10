import { subDays, subHours, subMinutes, subSeconds, addDays, addHours, addMinutes, addSeconds, parseISO, isValid } from 'date-fns';

export const parseDateTime = (input: string, now?: Date): Date => {
    if (!now) {
        now = new Date()
    }

    if (input === 'now') {
        return now;
    }

    if (input.endsWith('d')) {
        const days = parseInt(input.slice(0, -1), 10);
        return days < 0 ? subDays(now, Math.abs(days)) : addDays(now, days);
    }

    if (input.endsWith('h')) {
        const hours = parseInt(input.slice(0, -1), 10);
        return hours < 0 ? subHours(now, Math.abs(hours)) : addHours(now, hours);
    }

    if (input.endsWith('m')) {
        const minutes = parseInt(input.slice(0, -1), 10);
        return minutes < 0 ? subMinutes(now, Math.abs(minutes)) : addMinutes(now, minutes);
    }
    if (input.endsWith('s')) {
        const seconds = parseInt(input.slice(0, -1), 10);
        return seconds < 0 ? subSeconds(now, Math.abs(seconds)) : addSeconds(now, seconds);
    }

    const parsedDate = parseISO(input);

    if (isValid(parsedDate)) {
        return parsedDate;
    } 

    throw new Error(`Invalid date format: ${input}`);
}