export const PROPS = {
    config: {},
    domain: {
        sanitization: (context, value) => {
            context.scale().domain(value);
            return value;
        }
    },
    range: {},
    scale: {},
    uniqueValues: {}
};
