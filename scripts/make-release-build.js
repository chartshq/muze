const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');
const semver = require('semver');
const chalk = require('chalk');
const ora = require('ora');
const shell = require('shelljs');
const axios = require('axios');

/* eslint-disable no-console, require-jsdoc */

const askVersion = async (currentVersion) => {
    const response = await prompts({
        type: 'text',
        name: 'version',
        message: chalk.grey('What\'s the new release version?'),
        validate: (value) => {
            if (!semver.valid(value)) {
                return 'Value should be a semver value';
            } else if (semver.lte(value, currentVersion)) {
                return `New version should be greater than current version ${currentVersion}`;
            }
            return true;
        }
    });

    return semver.parse(response.version).format();
};

const confirmReadChecklist = async () => {
    const response = await prompts({
        type: 'text',
        name: 'readChecklist',
        message: chalk.grey('Have you read the checklist before being here? [Y/N]'),
        validate: value => (value.toUpperCase() === 'Y' || value.toUpperCase() === 'N' ? true : 'Enter \'Y\' or \'N\'')
    });

    return response.readChecklist;
};

const makeReleaseBuild = () => new Promise((res, rej) => {
    shell.exec('npm run build', { silent: true }, (code, stdout, stderr) => {
        if (code === 0) {
            res();
        } else {
            rej(new Error(stderr));
        }
    });
});

const run = async () => {
    const rootPath = path.resolve(__dirname, '..');
    const muzePkgFilePath = path.resolve(rootPath, 'packages/muze/package.json');
    const distPath = path.resolve(rootPath, 'dist');
    const releasePath = path.resolve(rootPath, 'release');
    const releaseDistPath = path.resolve(releasePath, 'dist');

    await fs.ensureDir(releasePath);
    await fs.ensureDir(releaseDistPath);

    process.stdout.write('\n');

    const readChecklist = await confirmReadChecklist();
    if (readChecklist.toUpperCase() === 'N') {
        process.stdout.write('\n');
        process.stdout.write('How dare you come here without reading checklist?');
        process.stdout.write('\n');
        return;
    }

    const currentMuzePkg = await fs.readJSON(muzePkgFilePath);
    const newVersion = await askVersion(currentMuzePkg.version);

    let spinner = ora('Creating a release-ready build').start();

    currentMuzePkg.version = newVersion;
    await fs.writeJSON(muzePkgFilePath, currentMuzePkg, { spaces: 2 });

    try {
        await makeReleaseBuild();
        spinner.succeed('Created a release-ready build');
    } catch (error) {
        spinner.fail('Failed to create release-ready build');
    }

    spinner = ora('Deleting previous distributable files').start();
    await fs.remove(releaseDistPath);
    spinner.succeed('Deleted previous distributable files');

    spinner = ora('Copying current distributable files').start();
    await fs.copy(distPath, releaseDistPath, { overwrite: true });
    spinner.succeed('Copied current distributable files');

    spinner = ora('Copying README.md and LICENSE').start();
    await fs.copy(path.resolve(rootPath, 'README.md'), path.resolve(releasePath, 'README.md'), { overwrite: true });
    await fs.copy(path.resolve(rootPath, 'LICENSE'), path.resolve(releasePath, 'LICENSE'), { overwrite: true });
    spinner.succeed('Copied README.md and LICENSE');

    spinner = ora('Preparing packages.json for release').start();
    const releasePkgPath = path.resolve(releasePath, 'package.json');
    let releasePkg;

    if (fs.existsSync(releasePkgPath)) {
        releasePkg = await fs.readJSON(releasePkgPath);
    } else {
        const downloadSpinner = ora('Downloading release package file from unpkg.com').start();
        const { data } = await axios.get('https://unpkg.com/muze/package.json');
        releasePkg = data;
        downloadSpinner.succeed('Downloaded release package file from unpkg.com');
    }

    releasePkg.version = newVersion;
    await fs.writeJSON(releasePkgPath, releasePkg, { spaces: 2 });

    spinner.succeed('Prepared packages.json for release');
    ora('').start().succeed('Ready to release');
};

run()
    // eslint-disable-next-line
    .catch(console.error.bind(console));
