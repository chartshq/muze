const dotenv = require('dotenv');
const fs = require('fs-extra');

module.exports = () => {
    let env = {};

    fs.pathExists('./.env.build').then((exists) => {
        env = exists ? dotenv.config({ path: './.env.build' }).parsed : {};
    });

    return Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});
};
