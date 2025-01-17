/**
 * @jest-hops-puppeteer off
 */

const path = require('path');
const { prerelease } = require('semver');
const { existsSync, readFileSync } = require('fs');
const { execSync } = require('child_process');
const { version, bin } = require(require.resolve(
  'create-hops-app/package.json'
));

const isPreRelease = prerelease(version) !== null;
const createHopsAppBin = require.resolve('create-hops-app');

describe('create-hops-app', () => {
  const version = isPreRelease ? 'next' : 'latest';
  const template = 'hops-template-react';

  beforeAll(() => {
    process.chdir(cwd);
  });

  it('initializes a Hops app with yarn', () => {
    const name = 'my-app-yarn';
    const args = [name, `--template ${template}@${version}`].join(' ');

    execSync(`${createHopsAppBin} ${args}`, { stdio: 'ignore' });

    const lockFile = path.join(cwd, name, 'yarn.lock');

    expect(existsSync(lockFile)).toBeTruthy();
    expect(readFileSync(lockFile, 'utf-8')).toContain('hops-react');
  });

  it('initializes a Hops app with npm', () => {
    const name = 'my-app-npm';
    const args = [name, `--template ${template}@${version}`, `--npm`].join(' ');

    execSync(`${createHopsAppBin} ${args}`, { stdio: 'ignore' });

    const lockFile = path.join(cwd, name, 'package-lock.json');

    expect(existsSync(lockFile)).toBeTruthy();
    expect(readFileSync(lockFile, 'utf-8')).toContain('hops-react');
  });

  it(`has the @next-binary if it's a pre-release`, () => {
    const binaries = Object.keys(bin);
    const nextCommand = 'create-hops-app@next';

    if (isPreRelease) {
      expect(binaries).toContain(nextCommand);
    } else {
      expect(binaries).not.toContain(nextCommand);
    }
  });
});
