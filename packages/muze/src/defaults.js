export const DEFAULT_CONFIG = {
    classPrefix: 'muze',
    interaction: {
        sideEffect: 'individual'
    },
    pagination: 'scroll',
    scrollBar: {
        thickness: 10,
        speed: 2,
        vertical: {
            align: 'right'
        },
        horizontal: {
            align: 'bottom'
        }
    },
    legend: {
        position: 'right',
        color: {
            show: true,
            padding: 1,
            margin: 3,
            border: 1,
            height: 20,
            width: 20
        },
        shape: {
            show: true,
            padding: 1,
            margin: 3,
            border: 1,
            height: 20,
            width: 20
        },
        size: {
            show: true,
            padding: 1,
            margin: 3,
            border: 1,
            height: 20,
            width: 20
        }
    },
    showHeaders: false,
    minWidth: 100,
    minHeight: 100,
    facet: {
        rows: {
            minCharacters: 3
        },
        columns: {
            maxLines: 2,
            verticalAlign: 'middle',
            minCharacters: 1
        }
    },
    border: {
        style: 'solid',
        color: '#d6d6d6',
        width: 2,
        collapse: true,
        spacing: 0
    },
    autoGroupBy: {
        disabled: false
    }
};
