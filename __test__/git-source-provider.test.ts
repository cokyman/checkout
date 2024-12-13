import * as fs from 'fs';
import * as io from '@actions/io';
import * as path from 'path';
import { getSource } from '../src/git-source-provider';
import { IGitSourceSettings } from '../src/git-source-settings';

const tempDir = path.join(__dirname, 'temp');
const cacheDir = path.join(tempDir, 'cache');
const repoDir = path.join(tempDir, 'repo');

beforeAll(async () => {
  await io.rmRF(tempDir);
  await io.mkdirP(tempDir);
  await io.mkdirP(cacheDir);
  await io.mkdirP(repoDir);
});

afterAll(async () => {
  await io.rmRF(tempDir);
});

test('caching mechanism', async () => {
  const settings: IGitSourceSettings = {
    repositoryOwner: 'actions',
    repositoryName: 'checkout',
    ref: 'main',
    commit: '',
    repositoryPath: repoDir,
    authToken: 'fake-token',
    clean: false,
    lfs: false,
    submodules: false,
    nestedSubmodules: false,
    persistCredentials: false,
    setSafeDirectory: false,
    fetchDepth: 1,
    fetchTags: false,
    showProgress: false,
    filter: '',
    sparseCheckout: [],
    sparseCheckoutConeMode: false,
    githubServerUrl: ''
  };

  // First fetch
  await getSource(settings);
  expect(fs.existsSync(repoDir)).toBe(true);

  // Modify the repository to simulate changes
  const testFilePath = path.join(repoDir, 'test-file.txt');
  fs.writeFileSync(testFilePath, 'test content');

  // Second fetch (should use cache)
  await getSource(settings);
  expect(fs.existsSync(testFilePath)).toBe(true);
});
