import { mergeRecursive } from 'muze-utils';

export const PROPS = {
    config: {
        sanitization: (context, config) => mergeRecursive(context.config(), config),
        preset: (context, config) => {
            const { range, domain } = config;
            range && context.range(range);
            domain && context.domain(domain);
        }
    },
    domain: {},
    range: {}
};
