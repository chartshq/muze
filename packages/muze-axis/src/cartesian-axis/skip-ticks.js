import {
    timeMillisecond,
    timeSecond,
    timeMinute,
    timeHour,
    timeDay,
    timeWeek,
    timeMonth,
    timeYear
} from 'muze-utils';

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;

const longestWord = {
    month: 'September',
    quarter: 'October',
    halfYearly: 'July',
    year: 9999,
    day: 'September',
    hour: '24 AM',
    mintues: '60:60',
    seconds: ':60',
    week: 'Wed 31'
};

const tickIntervals = [
    [1, 1, 'milliseconds', timeMillisecond.every(1), 'seconds'],
    [1, durationSecond, 'seconds', timeSecond.every(1), 'seconds'],
    [5, 5 * durationSecond, 'five seconds', timeSecond.every(5), 'seconds'],
    [10, 10 * durationSecond, 'ten seconds', timeSecond.every(10), 'seconds'],
    [15, 15 * durationSecond, 'fifteen seconds', timeSecond.every(15), 'seconds'],
    [30, 30 * durationSecond, 'thirty seconds', timeSecond.every(30), 'seconds'],
    [1, durationMinute, 'minute', timeMinute.every(1), 'minutes'],
    [5, 5 * durationMinute, 'five minutes', timeMinute.every(5), 'minutes'],
    [10, 10 * durationMinute, 'ten minutes', timeMinute.every(10), 'minutes'],
    [15, 15 * durationMinute, 'fifteen minutes', timeMinute.every(15), 'minutes'],
    [30, 30 * durationMinute, 'thirty minutes', timeMinute.every(30), 'minutes'],
    [1, durationHour, 'hour', timeHour.every(1), 'hour'],
    [3, 3 * durationHour, 'three hours', timeHour.every(3), 'hour'],
    [6, 6 * durationHour, 'six hours', timeHour.every(6), 'hour'],
    [12, 12 * durationHour, 'twelve hours', timeHour.every(12), 'hour'],
    [1, durationDay, 'daily', timeDay.every(1), 'day'],
    [1, durationWeek, 'weekly', timeWeek.every(1), 'week'],
    [1, durationMonth, 'monthly', timeMonth.every(1), 'week'],
    [3, 3 * durationMonth, 'quaterly', timeMonth.every(3), 'quarter'],
    [6, 6 * durationMonth, 'half yearly', timeMonth.every(6), 'halfYearly'],
    [1, durationYear, 'yearly', timeYear.every(1), 'year'],
    [10, 10 * durationYear, 'decade', timeYear.every(10), 'year'],
    [100, 100 * durationYear, 'century', timeYear.every(100), 'year'],
    [1000, 1000 * durationYear, 'millenium', timeYear.every(1000), 'year']
];

const getActualTickInterval = (context, noOfTicks) => {
    const minTickDistance = context._minTickDistance;
    const minWidthBetweenTicks = minTickDistance.width;

    const { width } = context.availableSpace();
    const actualTickInterval = Math.floor(((width - (noOfTicks - 1) * (minWidthBetweenTicks)) / noOfTicks));

    return actualTickInterval;
};

const getTickIntervalBasedOnCurrentLevel = (context, type) => {
    const labelManager = context._dependencies.labelManager;
    const longestWordType = longestWord[type];
    const measure = labelManager.getOriSize(longestWordType);

    return measure.width;
};

const getTickIntervalFnBasedOnNumberOfTicks = (interval, count, context) => {
    let possibleTickLevelIndex = tickIntervals.length - 1;
    let maxPossibleTicks = 1;
    for (let i = tickIntervals.length - 1; i >= 0; i--) {
        const tickIntervalInfo = tickIntervals[i];
        const numOfPossibleTicks = Math.floor(interval / tickIntervalInfo[1]);
        if (numOfPossibleTicks <= count) {
            possibleTickLevelIndex = i;
            maxPossibleTicks = numOfPossibleTicks;
        }
    }
    let tickIntervalLevelInfo = tickIntervals[possibleTickLevelIndex];

    const actualTickInterval = getActualTickInterval(context, maxPossibleTicks);
    const maxTickInterval = getTickIntervalBasedOnCurrentLevel(context, tickIntervalLevelInfo[4]);

    if (actualTickInterval < maxTickInterval && possibleTickLevelIndex < tickIntervals.length - 1) {
        tickIntervalLevelInfo = tickIntervals[possibleTickLevelIndex + 1];
    }
    return tickIntervalLevelInfo[3];
};

export const getSkippedTicks = (context, maxPossibleTicks) => {
    const domain = context.domain();
    const minDiff = context._minDiff;

    let actualNumberOfTicks = maxPossibleTicks;
    const millisecondInterval = domain[1] - domain[0];
    const numOfTicksAccordingToMinDiff = Math.floor(millisecondInterval / minDiff);

    if (maxPossibleTicks >= numOfTicksAccordingToMinDiff) {
        actualNumberOfTicks = numOfTicksAccordingToMinDiff;
    }

    return getTickIntervalFnBasedOnNumberOfTicks(millisecondInterval, actualNumberOfTicks, context);
};
