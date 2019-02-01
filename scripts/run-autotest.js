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

const mycroftProtocol = 'http';
const mycroftHost = 'sherlock.charts.com';
const mycroftPort = '3001';
const mollyProtocol = 'http';
const mollyHost = '192.168.102.171';
const mollyPort = '8084';
const currentPrintStream = process.stdout;
const initiateStatusInterval = 1000;
let autotestDone = false;
let cursorRelYPos = 0;

program
    .option('-m, --mode <mode>', 'muze build mode')
    .option('-e, --export', 'whether to export testing result or not')
    .parse(process.argv);

let { mode, export: isExport } = program;
if (!mode) {
    mode = 'production';
}
if (!isExport) {
    isExport = false;
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

const generateBuildTag = (v) => {
    const randomBuildId = uuid().replace(/-/g, '');
    return `v${semver.major(v)}.${semver.minor(v)}.${semver.patch(v)}-build${randomBuildId}`;
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

const makeAutoTestRequest = (reqId, tag, doneCallback) => {
    const testcaseInitiateURL = `${mycroftProtocol}://${mycroftHost}:${mycroftPort}/api/v1/autotest/initiate`;
    const payload = {
        requestId: reqId,
        libVersion: tag,
        all: true
    };

    axios.post(testcaseInitiateURL, payload)
        .then((resp) => {
            if (resp.status !== HttpStatus.OK) {
                doneCallback(null, new Error(`${resp.status}, ${resp.statusText}`));
                return;
            }

            doneCallback(resp.data, null);
        })
        .catch((err) => {
            doneCallback(null, err);
        });
};

const initiateAutoTest = async (tag, doneCallback) => {
    const reqId = uuid();
    makeAutoTestRequest(reqId, tag, doneCallback);
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
            .then((resp) => {
                if (autotestDone) {
                    return;
                }
                onUpdateCallback(resp.data);
                setTimeout(fn, initiateStatusInterval);
            })
            .catch((err) => {
                if (autotestDone) {
                    return;
                }
                onUpdateCallback({
                    total: 0,
                    passed: 0,
                    failed: 0
                });
                setTimeout(fn, initiateStatusInterval);
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
    const tag = generateBuildTag(muzePkg.version);
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
        reqId = await initiateAutoTest(tag, (finalStatus, err) => {
            autotestDone = true;
            if (err) {
                log(err.message);
                return;
            }
            printStatus(finalStatus);
            printAutotestSummery(tag)
                .catch((err2) => {
                    log(err2.message);
                });
        });
        spinner.succeed('Initiated autotest');
    } catch (err) {
        spinner.fail();
        log(err.message);
        return;
    }

    out('\n');
    await fetchAndUpdateAutotestStatus(reqId, (newStatus) => {
        printStatus(newStatus);
    });
};

run()
    // eslint-disable-next-line
    .catch(console.log.bind(console));
