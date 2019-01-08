const events = [
    'initialized',
    'beforeupdate',
    'updated',
    'beforedraw',
    'drawn',
    'beforeremove',
    'removed',
    'animationend'
];

const compositions = [
    'canvas',
    'unit',
    'layer',
    'axis',
    'facet-headers',
    'legend',
    'caption'
];

const EVENT_LIST = [];

compositions.forEach((composition) => {
    events.forEach((event) => {
        EVENT_LIST.push(`${composition}.${event}`);
    });
});

export default EVENT_LIST;
