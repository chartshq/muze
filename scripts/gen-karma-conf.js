const fs = require('fs-extra');
const ejs = require('ejs');
const program = require('commander');

program
  .option('-p, --package <pkg>', 'Muze package name')
  .option('-o, --out <path>', 'Config output path')
  .parse(process.argv);

const { package: packageName, out: configOutPath } = program;

const run = async () => {
    if (!packageName) {
        return;
    }

    const karmaConfigTpl = await fs.readFile('karma.conf.tpl.js', { encoding: 'utf8' });
    const karmaConfig = ejs.render(karmaConfigTpl, { packageName });
    await fs.writeFile(configOutPath || 'karma.conf.js', karmaConfig);
};

run()
// eslint-disable-next-line
.catch(console.log.bind(console));

