require('dotenv').config();
const path = require('path');
const querystring = require('querystring');
const readline = require('readline');
const fs = require('fs-extra');
const program = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const HttpStatus = require('http-status-codes');
const shell = require('shelljs');
const { promisify } = require('es6-promisify');
const uuid = require('uuid/v4');
const semver = require('semver');
const FormData = require('form-data');
const axios = require('axios');

const mycroftProtocol = process.env.MYCROFT_PROTOCOL;
const mycroftHost = process.env.MYCROFT_HOST;
const mycroftPort = process.env.MYCROFT_PORT;
const mollyProtocol = process.env.MOLLY_PROTOCOL;
const mollyHost = process.env.MOLLY_HOST;
const mollyPort = process.env.MOLLY_PORT;
const currentPrintStream = process.stdout;
const initiateStatusInterval = 1000;
let cursorRelYPos = 0;

program
    .option('-m, --mode <mode>', 'muze build mode')
    .parse(process.argv);

let { mode } = program;
if (!mode) {
    mode = 'production';
}

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

const currBranch = () => new Promise((res, rej) => {
    shell.exec('git branch | grep \\* | cut -d \' \' -f2', { async: true, silent: true }, (code, stdout, stderr) => {
        if (code) {
            const err = new Error();
            err.stdout = stdout;
            err.stderr = stderr;
            rej(err);
        } else {
            res(stdout.trim());
        }
    });
});

const generateBuildTag = async (v) => {
    let tag;
    const muzeVersion = `v${v}`;
    const currentBranch = await currBranch();
    const m = currentBranch.match(/^(.+)\/#(\d+)-(.+)$/);

    if (m) {
        tag = semver.valid(`${muzeVersion}-${m[1]}-${m[2]}-${m[3].slice(0, 30)}`);
    }

    tag = tag || semver.valid(`${muzeVersion}-${uuid().replace(/-/g, '')}`);

    return `v${tag}`;
};

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

const initiateAutoTest = async (tag) => {
    const reqId = uuid();
    const testcaseInitiateURL = `${mycroftProtocol}://${mycroftHost}:${mycroftPort}/api/v1/autotest/initiate`;
    const payload = {
        requestId: reqId,
        libVersion: tag,
        all: true
    };
    await axios.post(testcaseInitiateURL, payload);
    return reqId;
};

const fetchAndUpdateAutotestStatus = (reqId, onUpdateCallback) => new Promise((res, rej) => {
    onUpdateCallback({
        total: 0,
        passed: 0,
        failed: 0
    });

    setTimeout(function fn () {
        const encReqId = encodeURIComponent(reqId);
        const testcaseInitiateStatusURL = `${mycroftProtocol}://${mycroftHost}:${mycroftPort}/api/v1/autotest/initiate/status?requestId=${encReqId}`;
        axios.get(testcaseInitiateStatusURL)
            .then(({ data }) => {
                onUpdateCallback(data);
                if (data.done) {
                    res();
                    return;
                }
                setTimeout(fn, initiateStatusInterval);
            })
            .catch((err) => {
                rej(err);
            });
    }, initiateStatusInterval);
});

const printStatus = (status) => {
    readline.cursorTo(process.stdout, 0);
    readline.moveCursor(process.stdout, 0, -cursorRelYPos);
    readline.clearScreenDown(process.stdout);

    const { passed, failed } = status;
    const notTestedYet = status.total - passed - failed;

    out(`   ${chalk.grey('Passed:')} ${chalk.green(`${passed}`)}`);
    out(`   ${chalk.grey('Failed:')} ${chalk.red(`${failed}`)}`);
    out(`   ${chalk.grey('NotTestedYet:')} ${chalk.cyan(`${notTestedYet}`)}\n`);
    out('\n');
    cursorRelYPos = 2;
};

const makeShowDiffUrl = (tag, testcaseId) => {
    const query = {
        libVersion: tag,
        testcaseId
    };
    return `${mollyProtocol}://${mollyHost}:${mollyPort}/diff?${querystring.stringify(query)}`;
};

const printAutotestSummery = async (tag) => {
    const suiteVersion = `v${semver.major(tag)}`;
    const encLibVersion = encodeURIComponent(tag);
    const suiteStatusURL = `${mycroftProtocol}://${mycroftHost}:${mycroftPort}/api/v1/autotest/testsuites/${suiteVersion}/status?libVersion=${encLibVersion}`;
    try {
        const { data } = await axios.get(suiteStatusURL);

        const passedTestcases = [];
        const failedTestcases = [];
        const notTestedYetTestcases = [];
        Object.keys(data).forEach((id) => {
            if (data[id].autotestStatus === null) {
                notTestedYetTestcases.push(id);
            } else if (data[id].autotestStatus.toUpperCase() === 'PASSED') {
                passedTestcases.push(id);
            } else {
                failedTestcases.push(id);
            }
        });

        out(`${chalk.red('Failed:')}\n`);
        if (failedTestcases.length <= 0) {
            out(`   ${chalk.grey('No failed testcases')}\n`);
        } else {
            failedTestcases.forEach((id) => {
                out(`   ${chalk.grey(`${id}:`)} ${chalk.green(makeShowDiffUrl(tag, id))}\n`);
            });
        }
        out('\n');

        out(`${chalk.cyan('Not Tested Yet:')}\n`);
        if (notTestedYetTestcases.length <= 0) {
            out(`   ${chalk.grey('All are tested')}\n`);
        } else {
            notTestedYetTestcases.forEach((id) => {
                out(`   ${chalk.grey(id)}\n`);
            });
        }
        out('\n');
    } catch (err) {
        log(err.message);
    }
};

const run = async () => {
    const muzePkg = await fs.readJSON(path.resolve('packages/muze/package.json'));
    const tag = await generateBuildTag(muzePkg.version);
    let reqId;

    out('\n');
    let spinner = ora('Creating a build').start();
    try {
        await makeBuild(mode);
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
        return;
    }

    spinner = ora('Initiating autotest').start();
    try {
        reqId = await initiateAutoTest(tag);
        spinner.succeed('Initiated autotest');
    } catch (err) {
        spinner.fail();
        log(err.message);
        return;
    }

    out('\n');
    try {
        await fetchAndUpdateAutotestStatus(reqId, (newStatus) => {
            printStatus(newStatus);
        });
    } catch (err) {
        out(`${chalk.red('Error')}: ${err.message || String(err)}`);
    }

    out('\n');
    try {
        await printAutotestSummery(tag);
    } catch (err) {
        out(`${chalk.red('Error')}: ${err.message || String(err)}`);
    }
};

run()
    // eslint-disable-next-line
    .catch(console.log.bind(console));
