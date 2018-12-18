const path = require("path");

const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const replace = require("rollup-plugin-replace");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const alias = require("rollup-plugin-alias");
const filesize = require("rollup-plugin-filesize");
const { sizeSnapshot } = require("rollup-plugin-size-snapshot");
const lernaAliases = require("lerna-alias").rollup;

const {
  getPackages,
  clean,
  getPackagesInfo,
  msg,
  camelize,
  error,
  sortPackages
} = require("folio-dev-utils");

const UMD = "umd";
const CJS = "cjs";
const ES = "es";

const DEV = "development";
const PROD = "production";

const { SILENT } = process.env;

const isSilent = SILENT === "true";

let BUILD_FORMAT = "";
let BABEL_ENV = "";

async function start() {
  const packages = getPackages();

  const packagesArr = getPackagesInfo(packages);

  clean({
    packages: packages,
    filenames: ["dist"]
  });

  const sortedPackagesArr = sortPackages({ packages: packagesArr });

  for (const pkg of sortedPackagesArr) {
    const {
      sourcePath,
      distPath,
      name,
      peerDependencies = {},
      dependencies = {}
    } = pkg;

    // the following is general constants related to package
    // regardless to production options

    const modifiedName = camelize(name.replace("@", "").replace("/", "-"));

    const globals = getGlobal(peerDependencies);

    msg(` bundle ${name} as ${modifiedName}`);

    const opts = [
      { format: UMD, isProd: false },
      { format: UMD, isProd: true },
      { format: CJS, isProd: false },
      { format: CJS, isProd: true },
      { format: ES, isProd: false },
      { format: ES, isProd: true }
    ];

    for (const { format, isProd } of opts) {
      BUILD_FORMAT = format;
      BABEL_ENV = `${isProd ? PROD : DEV}`;

      const external = getExternal({
        peerDependencies,
        dependencies
      });

      // babel presets according to env
      const presets = [
        require("babel-preset-folio-dev")({
          BUILD_FORMAT,
          BABEL_ENV
        })
      ];

      const input = getInput({
        sourcePath,
        external,
        presets
      });

      const ouput = getOutPut({
        name: modifiedName,
        distPath,
        globals
      });

      await build(input, ouput);
    }
  }
}

/**
 * ****************************************
 * this is input functions collection
 * getExternal
 * then final function: getInput
 */

function getOutPut({ name, distPath, globals }) {
  const modifiedName = name.replace("@", "").replace("/", "-");

  let ext;
  if (BUILD_FORMAT === UMD) {
    ext = "umd.js";
  } else if (BUILD_FORMAT === CJS) {
    ext = "cjs.js";
  } else if (BUILD_FORMAT === ES) {
    ext = "esm.js";
  }

  const fname = `${modifiedName}.${
    BABEL_ENV === PROD ? `min.${ext}` : `${ext}`
  }`;

  return {
    file: path.join(distPath, fname),
    format: BUILD_FORMAT,
    ...((BABEL_ENV === PROD || BUILD_FORMAT === UMD) && { sourcemap: true }),
    name: modifiedName,
    ...(BUILD_FORMAT === UMD && { globals }),
    interop: false
  };
}

function getGlobal(peerDependencies) {
  return Object.keys(peerDependencies).reduce((deps, dep) => {
    deps[dep] = camelize(dep);
    return deps;
  }, {});
}
// end of ouput functions collection
// ********************************

/**
 * ****************************************
 * this is input functions collection
 * getExternal
 * then final function: getInput
 */
function getInput({ sourcePath, external, presets }) {
  return {
    input: sourcePath,
    external,
    plugins: [
      nodeResolve({
        extensions: [".js", ".jsx"]
      }),
      babel({
        runtimeHelpers: true,
        // pass env as arg solve be issue here, since it is async
        // the env is changed befroe write is done, it took me a while to figure the solution
        // dont judge me
        // have better solution, PR is welome.
        presets,
        babelrc: false
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify(BABEL_ENV)
      }),
      BUILD_FORMAT === UMD && alias(lernaAliases()),
      commonjs(),
      BUILD_FORMAT === UMD && resolve(),
      BABEL_ENV === PROD &&
        terser({
          output: { comments: false, beautify: false },
          warnings: true,
          toplevel: BUILD_FORMAT === CJS || BUILD_FORMAT === ES
        }),
      !isSilent && filesize(),
      sizeSnapshot({ threshold: false, matchSnapshot: false, printInfo: false })
    ].filter(Boolean)
  };
}

function getExternal({ peerDependencies, dependencies }) {
  let external = [];

  // always exlude peerdeps
  if (peerDependencies) {
    external.push(...Object.keys(peerDependencies));
  }

  // add dependencies to bundle when umd
  if (BUILD_FORMAT !== UMD) {
    external.push(...Object.keys(dependencies));
  }

  return external.length === 0
    ? () => false
    : id => new RegExp(`^(${external.join("|")})($|/)`).test(id);
}

// end of input functions collection
// ********************************

async function build(inputOptions, outputOptions) {
  try {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);

    // or write the bundle to disk
    //
    await bundle.write(outputOptions);
  } catch (e) {
    error(e);
  }
}

start().catch(err => {
  error(err);
});
