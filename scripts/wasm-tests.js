const { removeRecursiveSync, buildWasmLib } = require('./ezburn.js');
const child_process = require('child_process');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const tests = {
  serveTest({ testDir, ezburnPathWASM }) {
    try {
      child_process.execFileSync('node', [
        ezburnPathWASM,
        '--servedir=.',
        '--log-level=warning',
      ], {
        stdio: 'pipe',
        cwd: testDir,
      });
      throw new Error('Expected an error to be thrown');
    } catch (err) {
      assert.strictEqual(err.stderr + '', `✘ [ERROR] The "serve" API is not supported when using WebAssembly\n\n`)
    }
  },

  basicStdinTest({ testDir, ezburnPathWASM }) {
    const stdout = child_process.execFileSync('node', [
      ezburnPathWASM,
      '--format=cjs',
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `export default 1+2`,
    }).toString();

    // Check that the bundle is valid
    const module = { exports: {} };
    new Function('module', 'exports', stdout)(module, module.exports);
    assert.deepStrictEqual(module.exports.default, 3);
  },

  stdinOutfileTest({ testDir, ezburnPathWASM }) {
    const outfile = path.join(testDir, 'out.js')
    child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      '--format=cjs',
      '--outfile=' + outfile,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `export default 1+2`,
    }).toString();

    // Check that the bundle is valid
    const exports = require(outfile);
    assert.deepStrictEqual(exports.default, 3);
  },

  stdinStdoutUnicodeTest({ testDir, ezburnPathWASM }) {
    const stdout = child_process.execFileSync('node', [
      ezburnPathWASM,
      '--format=cjs',
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `export default ['π', '🍕']`,
    }).toString();

    // Check that the bundle is valid
    const module = { exports: {} };
    new Function('module', 'exports', stdout)(module, module.exports);
    assert.deepStrictEqual(module.exports.default, ['π', '🍕']);
  },

  stdinOutfileUnicodeTest({ testDir, ezburnPathWASM }) {
    const outfile = path.join(testDir, 'out.js')
    child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      '--format=cjs',
      '--outfile=' + outfile,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `export default ['π', '🍕']`,
    }).toString();

    // Check that the bundle is valid
    const exports = require(outfile);
    assert.deepStrictEqual(exports.default, ['π', '🍕']);
  },

  stdoutLargeTest({ testDir, ezburnPathNative, ezburnPathWASM }) {
    const entryPoint = path.join(__dirname, 'js-api-tests.js');

    // Build with native
    const stdoutNative = child_process.execFileSync(ezburnPathNative, [
      entryPoint,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
    }).toString();

    // Build with WASM
    const stdoutWASM = child_process.execFileSync('node', [
      ezburnPathWASM,
      entryPoint,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
    }).toString();

    // Check that the output is equal
    assert.deepStrictEqual(stdoutNative.length, stdoutWASM.length);
    assert.deepStrictEqual(stdoutNative, stdoutWASM);
  },

  outfileLargeTest({ testDir, ezburnPathNative, ezburnPathWASM }) {
    const entryPoint = path.join(__dirname, 'js-api-tests.js');

    // Build with native
    const outfileNative = path.join(testDir, 'a.js');
    const stdoutNative = child_process.execFileSync(ezburnPathNative, [
      entryPoint,
      '--outfile=' + outfileNative,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
    }).toString();
    const jsNative = fs.readFileSync(outfileNative, 'utf8');

    // Build with WASM
    const outfileWASM = path.join(testDir, 'b.js');
    const stdoutWASM = child_process.execFileSync('node', [
      ezburnPathWASM,
      entryPoint,
      '--outfile=' + outfileWASM,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
    }).toString();
    const jsWASM = fs.readFileSync(outfileWASM, 'utf8');

    // Check that the output is equal
    assert.deepStrictEqual(jsNative.length, jsWASM.length);
    assert.deepStrictEqual(jsNative, jsWASM);
  },

  outfileNestedTest({ testDir, ezburnPathWASM }) {
    const outfile = path.join(testDir, 'a', 'b', 'c', 'd', 'out.js');
    child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      '--format=cjs',
      '--outfile=' + outfile,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `export default 123`,
    }).toString();

    // Check that the bundle is valid
    const exports = require(outfile);
    assert.deepStrictEqual(exports.default, 123);
  },

  metafileNestedTest({ testDir, ezburnPathWASM }) {
    const outfile = path.join(testDir, 'out.js');
    const metafile = path.join(testDir, 'a', 'b', 'c', 'd', 'meta.json');
    const cwd = path.join(testDir, 'a', 'b')
    fs.mkdirSync(cwd, { recursive: true })
    child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      '--format=cjs',
      '--outfile=' + outfile,
      '--metafile=' + metafile,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd,
      input: `export default 123`,
    }).toString();

    // Check that the bundle is valid
    const exports = require(outfile);
    assert.deepStrictEqual(exports.default, 123);
    const json = JSON.parse(fs.readFileSync(metafile, 'utf8'));
    assert.deepStrictEqual(json.outputs['../../out.js'].entryPoint, '<stdin>');
  },

  importRelativeFileTest({ testDir, ezburnPathWASM }) {
    const outfile = path.join(testDir, 'out.js')
    const packageJSON = path.join(__dirname, '..', 'npm', 'ezburn-wasm', 'package.json');
    child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      '--format=cjs',
      '--outfile=' + outfile,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `export {default} from ` + JSON.stringify('./' + path.relative(testDir, packageJSON)),
    }).toString();

    // Check that the bundle is valid
    const exports = require(outfile);
    assert.deepStrictEqual(exports.default, require(packageJSON));
  },

  importAbsoluteFileTest({ testDir, ezburnPathWASM }) {
    const outfile = path.join(testDir, 'out.js')
    const packageJSON = path.join(__dirname, '..', 'npm', 'ezburn-wasm', 'package.json');
    child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      '--format=cjs',
      '--outfile=' + outfile,
      '--log-level=warning',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `export {default} from ` + JSON.stringify(packageJSON),
    }).toString();

    // Check that the bundle is valid
    const exports = require(outfile);
    assert.deepStrictEqual(exports.default, require(packageJSON));
  },
  zipFile({ testDir, ezburnPathWASM }) {
    const entry = path.join(testDir, 'entry.js')
    fs.writeFileSync(entry, `
      import foo from './test.zip/foo.js'
      import bar from './test.zip/bar/bar.js'

      import __virtual__1 from './test.zip/__virtual__/ignored/0/foo.js'
      import __virtual__2 from './test.zip/ignored/__virtual__/ignored/1/foo.js'
      import __virtual__3 from './test.zip/__virtual__/ignored/1/test.zip/foo.js'

      import $$virtual1 from './test.zip/$$virtual/ignored/0/foo.js'
      import $$virtual2 from './test.zip/ignored/$$virtual/ignored/1/foo.js'
      import $$virtual3 from './test.zip/$$virtual/ignored/1/test.zip/foo.js'

      console.log({
        foo,
        bar,

        __virtual__1,
        __virtual__2,
        __virtual__3,

        $$virtual1,
        $$virtual2,
        $$virtual3,
      })
    `)

    // This uses the real file system instead of the mock file system so that
    // we can check that everything works as expected on Windows, which is not
    // a POSIX environment.
    fs.writeFileSync(path.join(testDir, 'test.zip'), Buffer.from(
      `UEsDBAoAAgAAAG1qCFUSAXosFQAAABUAAAAGABwAZm9vLmpzVVQJAAOeRfFioEXxYnV4C` +
      `wABBPUBAAAEFAAAAGV4cG9ydCBkZWZhdWx0ICdmb28nClBLAwQKAAIAAABzaghVwuDbLR` +
      `UAAAAVAAAACgAcAGJhci9iYXIuanNVVAkAA6lF8WKrRfFidXgLAAEE9QEAAAQUAAAAZXh` +
      `wb3J0IGRlZmF1bHQgJ2JhcicKUEsBAh4DCgACAAAAbWoIVRIBeiwVAAAAFQAAAAYAGAAA` +
      `AAAAAQAAAKSBAAAAAGZvby5qc1VUBQADnkXxYnV4CwABBPUBAAAEFAAAAFBLAQIeAwoAA` +
      `gAAAHNqCFXC4NstFQAAABUAAAAKABgAAAAAAAEAAACkgVUAAABiYXIvYmFyLmpzVVQFAA` +
      `OpRfFidXgLAAEE9QEAAAQUAAAAUEsFBgAAAAACAAIAnAAAAK4AAAAAAA==`, 'base64'))

    const stdout = child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      entry,
    ], {
      stdio: 'pipe',
      cwd: testDir,
    }).toString();

    assert.strictEqual(stdout, `(() => {
  // test.zip/foo.js
  var foo_default = "foo";

  // test.zip/bar/bar.js
  var bar_default = "bar";

  // test.zip/__virtual__/ignored/0/foo.js
  var foo_default2 = "foo";

  // test.zip/ignored/__virtual__/ignored/1/foo.js
  var foo_default3 = "foo";

  // test.zip/__virtual__/ignored/1/test.zip/foo.js
  var foo_default4 = "foo";

  // test.zip/$$virtual/ignored/0/foo.js
  var foo_default5 = "foo";

  // test.zip/ignored/$$virtual/ignored/1/foo.js
  var foo_default6 = "foo";

  // test.zip/$$virtual/ignored/1/test.zip/foo.js
  var foo_default7 = "foo";

  // entry.js
  console.log({
    foo: foo_default,
    bar: bar_default,
    __virtual__1: foo_default2,
    __virtual__2: foo_default3,
    __virtual__3: foo_default4,
    $$virtual1: foo_default5,
    $$virtual2: foo_default6,
    $$virtual3: foo_default7
  });
})();
`)
  },

  // https://github.com/khulnasoft/ezburn/issues/3001
  nodePathsReaddirEINVAL({ testDir, ezburnPathWASM }) {
    const libDir = path.join(testDir, 'lib');
    const libFile = path.join(libDir, 'file.js');
    fs.mkdirSync(libDir, { recursive: true });
    fs.writeFileSync(libFile, 'foo()');
    const stdout = child_process.execFileSync('node', [
      ezburnPathWASM,
      '--bundle',
      '--format=esm',
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: testDir,
      input: `import "file.js"`,
      env: { ...process.env, NODE_PATH: libDir },
    }).toString();

    assert.deepStrictEqual(stdout, '// lib/file.js\nfoo();\n');
  },
};

function runTest({ testDir, ezburnPathNative, ezburnPathWASM, test }) {
  try {
    fs.mkdirSync(testDir, { recursive: true })
    test({ testDir, ezburnPathNative, ezburnPathWASM })
    return true
  } catch (e) {
    console.error(`❌ ${test.name} failed: ${e && e.message || e}`)
    return false
  }
}

async function main() {
  // Generate the WebAssembly module
  const ezburnPathNative = path.join(__dirname, '..', process.platform === 'win32' ? 'ezburn.exe' : 'ezburn');
  await buildWasmLib(ezburnPathNative);

  const ezburnPathWASM = path.join(__dirname, '..', 'npm', 'ezburn-wasm', 'bin', 'ezburn');
  const testDir = path.join(__dirname, '.wasm-tests')

  // Run all tests in serial because WebAssembly compilation is a CPU hog
  let allTestsPassed = true;
  for (const test in tests) {
    if (!runTest({
      testDir: path.join(testDir, test),
      test: tests[test],
      ezburnPathNative,
      ezburnPathWASM,
    })) {
      allTestsPassed = false;
    }
  }

  if (!allTestsPassed) {
    console.error(`❌ wasm-tests failed`)
    process.exit(1)
  } else {
    console.log(`✅ wasm-tests passed`)
    removeRecursiveSync(testDir)
  }
}

main().catch(e => setTimeout(() => { throw e }))
