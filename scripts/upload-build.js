require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');
const HttpStatus = require('http-status-codes');
const shell = require('shelljs');
const { promisify } = require('es6-promisify');
const semver = require('semver');
const FormData = require('form-data');
const prompt = require('prompt');

const mycroftProtocol = process.env.MYCROFT_PROTOCOL;
const mycroftHost = process.env.MYCROFT_HOST;
const mycroftPort = process.env.MYCROFT_PORT;
const currentPrintStream = process.stdout;

const out = (text) => {
    currentPrintStream.write(text);
};

const log = (text) => {
    out(text);
    out('\n');
};

const makeBuild = buildMode => new Promise((res, rej) => {
    shell.exec(`./scripts/make-build.sh "${buildMode}"`, { async: true, silent: true }, (code, stdout, stderr) => {
        if (code) {
            const err = new Error();
            err.stdout = stdout;
            err.stderr = stderr;
            rej(err);
        } else {
            res();
        }
    });
});

const uploadBuild = async (tag) => {
    const distZipFile = path.resolve('dist.zip');
    const libraryUploadURL = `${mycroftProtocol}://${mycroftHost}:${mycroftPort}/api/v1/library/versions`;

    const form = new FormData();
    form.append('tag', tag);
    form.append('overwrite', 'true');
    form.append('buildFile', fs.createReadStream(distZipFile));

    const uploadRes = await promisify(form.submit.bind(form))(libraryUploadURL);
    await fs.remove(distZipFile);
    return uploadRes;
};

const run = async () => {
    prompt.message = '';
    prompt.start();

    const { tag } = await promisify(prompt.get.bind(prompt))({
        properties: {
            tag: {
                conform: value => !!semver.valid(value),
                message: 'Should be semver value',
                description: 'Enter tag name',
                type: 'string',
                required: true,
                before: value => `v${semver.valid(value)}`
            }
        }
    });

    out('\n');
    let spinner = ora('Creating a build').start();
    try {
        await makeBuild('production');
        spinner.succeed('Created a build');
    } catch (err) {
        spinner.fail();
        log(err.message);
        return;
    }

    spinner = ora('Uploading build to Sherlock').start();
    try {
        const resp = await uploadBuild(tag);
        if (resp.statusCode !== HttpStatus.OK) {
            spinner.fail();
            log(`${resp.statusCode}, ${resp.statusMessage}`);
            return;
        }
        spinner.succeed(`Uploaded build to Sherlock, tag: ${chalk.green(tag)}`);
    } catch (err) {
        spinner.fail();
        log(err.message);
    }
};

run()
    // eslint-disable-next-line
    .catch(console.log.bind(console));
