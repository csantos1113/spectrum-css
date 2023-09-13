/*!
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require("fs");
const fsp = fs.promises;
const { join, dirname, extname, relative } = require("path");

const { joinPathFragments, logger } = require("@nx/devkit");

/* @note Using chalk @4.x b/c 5.x is ESM */
const chalk = require("chalk");

const fg = require("fast-glob");

const postcss = require("postcss");
const postcssrc = require("postcss-load-config");
const selectorParser = require("postcss-selector-parser");

const FuzzyMatching = require("fuzzy-matching");
const prettier = require("prettier");
const merge = require("merge-source-map");

const fgConcat = require("./fg-concat");

/**
 * **Detailed comments and typing available in the index.d.ts file**
 *
 * If you're using VSCode, you can hover over the variables/functions
 * to see the types and descriptions.
 */

/** @type {require("./index").spectrumBuildExector} */
module.exports = async function spectrumBuildExector(opts, context) {
	/** @type require("./index").normalizedOptions */
	const { env, clean, sourceFiles, themeFiles, outputPath } = normalizeOptions(
		opts,
		context
	);

	/** @note Randoma is an ESM pkg so we import it dynamically & capture the default */
	const Randoma = await import("randoma").then((m) => m.default);

	/* --- CORE DATA FOR PROCESSING --- */
	/**
	 * @const
	 * @type {string | import('fs').PathLike}
	 * */
	const cwd = joinPathFragments(
		context.root,
		context.workspace.projects[context.projectName].root
	);

	/** @type {require("./index").Outputs} */
	const outputs = {
		index: join(cwd, outputPath, "index.css"),
		compat: join(cwd, outputPath, "index-vars.css"),
		vars: join(cwd, outputPath, "vars.css"),
		markdown: join(cwd, "metadata/mods.md"),
		customProperties: join(cwd, outputPath, "custom-properties.json"),
		base: join(cwd, outputPath, "index-base.css"),
		themes: join(cwd, outputPath, "index-theme.css"),
	};
	/* --- END --- */

	/* --- INTERPOLATED DATA --- */
	/**
	 * @note NX uses configurations as a way of running tasks in different contexts
	 * @const
	 * @type {boolean}
	 * @default false
	 */
	const isLegacy = context.configurationName === "legacy" ?? false;

	/**
	 * @todo should this be run through normalizedOptions? fetched from package.json?
	 * @const
	 * @type {string}
	 */
	const pkgName = `@spectrum-css/${context.projectName}`;

	/**
	 * @todo Need a way to validate the generated color is readable on light/dark console themes
	 * @description Generate a random hex color using the package name as a seed
	 * @const
	 * @type {import('randoma').Randoma}
	 */
	const random = new Randoma({ seed: pkgName });

	/**
	 * @description A randomly generated hex color to use for logging the package name
	 * @note This is used to make it easier to visually identify the package tasks in the console
	 * @const
	 * @type {string}
	 */
	const hex = random.color(1).hex().toString();

	/**
	 * @description Pretty print the package name for logging
	 * @const
	 * @type {string}
	 */
	const printPkg = chalk.hex(hex)(`[${pkgName}] `);

	/**
	 * @description A set of standard output messages to use for various build outcomes
	 * @const
	 * @type {object}
	 * @param {string} success - A successful build
	 * @param {string} failure - The build failed
	 */
	const MESSAGE = {
		success: `build complete 🎉`,
		failure: `${chalk.red("❌")} failure`,
	};

	/** @type {require("./index").log} */
	const log = (message) => logger.log(printPkg, message);
	/* --- END --- */

	/* --- UTILITY FUNCTIONS --- */
	/** @type {import("./index").print} */
	const print = (paths, bytes = 0) => {
		// Convert a string path into an array for processing below
		if (typeof paths === "string") paths = [paths];

		// Return a pretty printed set of paths
		/** @todo Calculate the file byte size & format it into KB, etc. if necessary */
		return `${paths
			.map((path) => chalk.yellow(relative(cwd, path)))
			.join(", ")}${bytes > 0 ? chalk.gray(` [${bytes} bytes]`) : ""}`;
	};

	/** @type {import("./index").readWrite} */
	async function readWrite(inputPaths, outputPath) {
		if (!inputPaths || !inputPaths.length) return;

		const { content, inputFiles, map } = await fgConcat(
			inputPaths,
			outputPath,
			{ cwd: context.root }
		).catch((e) => Promise.reject(e));

		/** if there are no input files or the files are empty, log that we're skipping it and return */
		if (inputFiles.length === 0 || !content || content.trim() === "") {
			log(`${chalk.gray("-")} skipped ${print(outputPath)}`);
			return Promise.resolve();
		}

		/** More than 1 input file processed? Log that they were combined */
		if (inputFiles.length > 1) {
			log(
				`${chalk.green("✔")} combined ${print(inputFiles)}${
					outputPath ? ` -> ${print(outputPath)}` : ""
				}`
			);
		}

		let contents = content;
		let mapContent = map;

		if (extname(outputPath) === ".css") {
			const ctx = {
				env,
				to: outputPath,
				from: inputPaths[0] ?? undefined,
				cwd,
			};

			const { plugins, options } = await postcssrc(ctx).catch((e) =>
				Promise.reject(e)
			);
			const r = await postcss(plugins)
				.process(content, options)
				.catch((e) => Promise.reject(e));

			/** If the postcss process returns a map, merge it and the fg-concat map */
			if (r.map && r.opts && r.opts.to) {
				const mergedMap = merge(JSON.parse(map), JSON.parse(r.map));
				if (mergedMap) {
					mapContent = JSON.stringify(mergedMap);
				}
			}

			if (r.css) contents = r.css;
		}

		if (mapContent) {
			await write(mapContent, `${outputPath}.map`, { formatter: "json" });
		}

		return write(contents, outputPath, {
			cwd,
			formatter: extname(outputPath) === ".map" ? "json" : undefined,
		});
	}

	/** @type {import("./index").write} */
	async function write(contents, outputPath, { formatter = "css" } = {}) {
		if (!contents || contents === "") {
			/** If there's no content, remove the output asset if it already exists */
			await fsp
				.rm(outputPath)
				.catch(() => {})
				.then(() => {
					logger.debug(`🧹 removed ${print(outputPath)}.`);
				});
			return Promise.resolve("");
		}

		/** Create the directory first if it doesn't exist */
		if (!fs.existsSync(dirname(outputPath))) {
			fs.mkdirSync(dirname(outputPath), {
				recursive: true,
			});
		}

		/**
		 * Remove the file if it already exists; this helps us with cleanup
		 * @todo should I wrap this in the clean flag?
		 */
		if (fs.existsSync(outputPath)) {
			await fsp.rm(outputPath).catch(() => {});
		}

		/** Format the content before writing */
		try {
			contents = prettier.format(contents, { parser: formatter });
		} catch (e) {
			return Promise.reject(e);
		}

		/** Write the processed content and return */
		await fsp
			.writeFile(outputPath, contents, { encoding: "utf8" })
			.catch((e) => Promise.reject(e));

		if (!extname(outputPath).endsWith("map")) {
			log(
				`${chalk.green("✔")} wrote ${print(outputPath)} ${chalk.gray(
					`[${contents.length} bytes]`
				)}`
			);
		}

		return Promise.resolve(contents);
	}
	/* --- END --- */

	/* --- DATA COLLECTORS --- */
	/** Collect errors from concurrent runs in order to report out without failing the entire build */
	const errors = [];
	/** Storing the task promises in an array allows us to run concurrent processes */
	const promises = [];
	/* --- END --- */

	/* --- CLEAN --- */
	/** Clean up before we get started */
	if (clean) {
		fsp
			.rm(join(cwd, outputPath), {
				force: true,
				recursive: true,
			})
			.catch(() => {});
	}
	/* --- END --- */

	/* --- BUILD --- */
	/** Report to console that building has started */
	log(
		`started build${
			isLegacy ? ` with ${chalk.underline("legacy")} process` : ""
		}`
	);

	/**
	 * Start by processing the core styles and combining them with theme
	 * settings into our main export - index.css; data is read in from all
	 * sources and processed using PostCSS utilities to create multiple
	 * outputs including a vars.css file containing only the variables used.
	 *
	 * @returns {Promise<void>}
	 **/
	const index = async () => {
		const contents = await readWrite(
			[...sourceFiles, ...themeFiles].map((file) => join(cwd, file)),
			outputs.index
		).catch((error) => Promise.reject(error));

		/** If there was a problem creating the combined asset, return now; do not continue processing */
		if (!fs.existsSync(outputs.index) || !contents || contents === "") {
			/**
			 * If there's no content, remove the output asset if it already exists
			 *
			 * @note We only do this in watch mode or if the clean wasn't run at init;
			 * b/c in those cases we _know_ the file doesn't exist
			 * @note btw it's okay if the rm task fails, no need to throw an error;
			 * it also saves us from having to run a check to see if the file exists first
			 **/
			if (!clean || watch) await fsp.rm(outputs.compat).catch(() => {});
			return Promise.resolve();
		}

		/**
		 * Process CSS variables looking for all class names, variable definitions,
		 * and noting the variables used in the component (vs. passthroughs for example)
		 * @note we validated that contents is not empty above so we can safely pass it in here
		 */
		const { varDefinitions = new Map(), usedVars = new Set() } =
			parseForCustomProperties(contents);

		/**
		 * For each color stop and scale, filter the variables for
		 * those matching the component; this data is used later to
		 * report on and document the available variables.
		 * @todo incorporate passthroughs
		 */
		const {
			mods = [],
			a11y = [],
			global = [],
			component = [],
		} = filterVars(usedVars, { pkgName });

		const indexPromises = [];

		/**
		 * This will generate the metadata/mods.md file for the component
		 * @todo deprecate mods.md after confirming if it's being used externally
		 * because we shouldn't be writing to the source during the build.
		 * If there are no mods, remove the file (if it exists).
		 */
		if (mods.length > 0) {
			indexPromises.push(
				write(
					[
						"| Modifiable custom properties |\n| --- |",
						...mods.map((result) => `| \`${result}\` |`),
					].join("\n"),
					outputs.markdown,
					{ formatter: "markdown" }
				)
			);
		} else {
			/**
			 * @note btw it's okay if the rm task fails, no need to throw an error;
			 * it also saves us from having to run a check to see if the file exists first
			 **/
			indexPromises.push(fsp.rm(outputs.markdown).catch(() => {}));
		}

		/** dist/custom-properties.json */
		if (mods.length || a11y.length || global.length || component.length) {
			indexPromises.push(
				write(
					JSON.stringify({ mods, a11y, global, component }, null, 2),
					outputs.customProperties,
					{ formatter: "json" }
				)
			);
		} else {
			indexPromises.push(fsp.rm(outputs.customProperties).catch(() => {}));
		}

		/**
		 * If there are no variables used, no need to write out the files
		 * so we can return early
		 */
		if (component.length === 0) {
			return Promise.all([
				/** Copy index as index-vars to maintain backwards compatibility */
				fsp.copyFile(outputs.index, outputs.compat),
				...p,
			]);
		}

		/**
		 * Parse the content for all class names and process the CSS
		 * through PostCSS to generate the final output; write out the
		 * resulting CSS to dist/vars.css and any sourcemaps to dist/vars.css.map.
		 *
		 * This is our **vars-only** CSS file.
		 */
		const varsonly = async (content) => {
			const { plugins, options } = await postcssrc({
				env,
				to: outputs.vars,
				from: join(cwd, sourceFiles[0]),
				cwd,
			}).catch((error) => Promise.reject(error));

			const classNames = parseForClasses(content) ?? new Set();
			if (classNames.size === 0) return Promise.resolve();

			const c = `
${[...classNames].join(",")} {
${[...varDefinitions.entries()]
	.map(([key, value]) =>
		!key.startsWith("--highcontrast") ? `  ${key}: ${value[0]};` : ""
	)
	.join("\n")}
}
`;
			/**
			 * Restructure the variable definitions into an array of
			 * key: value pairs for writing out to the vars.css file;
			 * we're also filtering out the high contrast variables and
			 * making use of the first value provided for each variable
			 *
			 * --key: value;
			 *
			 * @todo do we want the last value for each variable?
			 **/
			const r = await postcss(plugins)
				.process(c, options)
				.catch((error) => Promise.reject(error));

			if (r.map && r.opts && r.opts.to) {
				await write(r.map, `${r.opts.to}.map`, { formatter: "json" }).catch(
					(error) => Promise.reject(error)
				);
			}

			return write(css, outputs.vars, { cwd });
		};

		return Promise.all([
			/** Copy index as index-vars to maintain backwards compatibility */
			fsp.copyFile(outputs.index, outputs.compat),
			...p,
			varsonly(contents),
		]).catch((error) => Promise.reject(error));
	};

	promises.push(index());

	/**
	 * Modern steps will run through theme processing as well but legacy
	 * builds do not need to do this because they have alternative theming
	 * methods.
	 **/
	if (!isLegacy) {
		/** Combine styles and themes into an index-base.css */
		const base = readWrite(
			[...sourceFiles, ...themeFiles].map((file) => join(cwd, file)),
			outputs.base
		);

		promises.push(base);

		/** If there are themes, process them individually */
		const themes = fg.sync(themeFiles).map((theme) =>
			readWrite(
				[theme].map((file) => join(cwd, file)),
				join(cwd, outputPath, theme)
			)
		);

		promises.push(...themes);

		/**
		 * 4. Combine theme styles into an index-theme.css with spectrum first
		 */
		const themeSet = readWrite(
			themeFiles.map((file) => join(cwd, file)),
			outputs.themes
		);

		promises.push(themeSet);
	}

	/** Wait for all tasks to complete and report back to the console the results */
	await Promise.all(promises).catch((error) => {
		errors.push(error);
	}).then(result => log(result));
	/* --- END --- */

	/* --- REPORT --- */
	/** Report the failure and log error messages */
	if (errors.length > 0) {
		// Generic log message followed by the detailed error messages below
		log(
			`${MESSAGE.failure}${
				errors.length > 0
					? ` with ${errors.length} error${errors.length > 1 ? "s" : ""}`
					: ""
			}`
		);

		// Some errors will be Error objects, others will be manually created strings
		errors.map((error) => {
			log(error?.message ?? error);
		});
	} else log(MESSAGE.success);
	/* --- END --- */

	/** Return the build results as a boolean pass/fail and with an output file */
	return Promise.resolve({
		success: errors.length === 0,
		// This field is needed for `@nx/js:node` executor to work.
		outfile: join(cwd, outputPath),
	});
};

/**
 * @todo Verify the option inputs and provide defaults
 * @param {import('./schema').ComponentBuilderExecutorOptions} options
 * @param {import('@nx/devkit').ExecutorContext} context
 * @returns {import('./schema').ComponentBuilderExecutorOptions & NormalizedOptions}
 */
function normalizeOptions(options, context) {
	options.env = process.env.NODE_ENV ?? "development";
	if (!options.sourceFiles || options.sourceFiles.length === 0) {
		options.sourceFiles = ["index.css"];
	} else if (typeof options.sourceFiles === "string") {
		options.sourceFiles = [options.sourceFiles];
	}

	if (!options.outputPath) {
		options.outputPath = "dist";
	}

	return options;
}

/**
 * From the provided content, determine which custom properties are being
 * defined vs. properties being used; this data is used later to report on
 * what variables might be able to be removed from the component.
 *
 * @todo this should probably be handled by postcss
 *
 * @param {string} contents
 * @returns {{ defined: Map<string, string[]>, used: Set<string> }}
 */
function parseForCustomProperties(contents) {
	// Pulls out all the variables used in the component
	const defined = new Map();
	const used = new Set();

	postcss.parse(contents).walkDecls((decl) => {
		const value = decl.value.replace(/(\t|\n)/g, "").trim();

		if (decl.prop.startsWith("--")) {
			if (defined.has(decl.prop)) {
				defined.set(decl.prop, [...defined.get(decl.prop), value]);
			} else {
				defined.set(decl.prop, [value]);
			}
		}

		const matches = value.match(/var\(.*?\)/g);
		if (!matches) return;

		matches.forEach((match) => {
			const varName = match
				.replace(/var\(\s*(--[\w\-]+)\s*,?.*?\)/, "$1")
				.trim();
			used.add(varName);
		});
	});

	return { defined, used };
}

/**
 * Determine which class names are being used in the component; this data is
 * used to generate the vars.css file containing only the variables used.
 *
 * @todo this should probably be handled by postcss
 *
 * @param {string} contents
 * @param {Object} options
 * @param {string} options.prefix [prefix="spectrum"] - the prefix to use for class names
 * @returns {Set<string>}
 */
function parseForClasses(contents, { prefix = "spectrum" } = {}) {
	// Pulls out all the variables used in the component and writes them to dist/vars.css & dist/vars.json
	const classNames = new Set();

	postcss.parse(contents).walkRules((rule) => {
		// Parse the selectors to find all the class names
		selectorParser((selectors) => {
			selectors.walk((s, idx) => {
				if (s.type !== "class") return;
				if (idx > 0) return;

				// This format matches our SUIT CSS naming conventions for root class names
				if (
					new RegExp(`^${prefix ? `${prefix}-` : ""}[A-Z][a-zA-Z]+$`).test(
						s.value
					)
				) {
					classNames.add(`.${s.value}`);
					return false;
				}
			}, true);
		}).processSync(rule.selector);
	});

	return classNames;
}

/**
 * For each color stop and scale, filter the variables into distinct buckets;
 * this data is used later to report on and document the available variables.
 *
 * @todo this should probably be handled by postcss
 *
 * @param {Set} used
 * @param {Object} options
 * @param {String} options.pkgName
 * @returns {{ mods: string[], a11y: string[], global: string[], component: string[] }}
 */
function filterVars(used, { pkgName }) {
	if (used.size === 0) return { mods: [], a11y: [], global: [], component: [] };

	const mods = [...used].filter((key) => key.startsWith("--mod")) ?? [];
	const a11y =
		[...used].filter((key) => key.startsWith("--highcontrast")) ?? [];

	const global = [...used].filter((key) => {
		if (mods.includes(key) || a11y.includes(key)) return false;
		const componentName = pkgName.split("/").pop().toLowerCase();

		const fm = new FuzzyMatching([componentName]);
		const keyCore = key.replace(/--spectrum-/, "").split("-");

		let corrected = fm.get(keyCore[0], { maxChanges: 1 });
		if (corrected?.value === componentName) return false;

		corrected = fm.get(`${keyCore[0]}-${keyCore[1]}`, { maxChanges: 1 });
		if (corrected?.value === componentName) return false;

		return (
			(key.includes("spectrum-global") ||
				key.includes("spectrum-alias") ||
				key.startsWith("--spectrum-")) ??
			[]
		);
	});

	/* Check all used variables to find those relevant to only this component */
	const component =
		[...used].filter(
			(key) =>
				!(global.includes(key) || mods.includes(key) || a11y.includes(key))
		) ?? [];

	/* Assign to a set to dedupe values, destructure to array, apply an alphabetical sort */
	return {
		mods: [...new Set(mods)].sort(),
		a11y: [...new Set(a11y)].sort(),
		global: [...new Set(global)].sort(),
		component: [...new Set(component)].sort(),
	};
}
