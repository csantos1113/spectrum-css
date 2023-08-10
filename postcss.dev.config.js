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
const path = require("path");

const postcss = require("postcss");
const camelCase = require("lodash/camelCase");
const upperFirst = require("lodash/upperFirst");

/**
 * @description This is the PostCSS config for our development code and
 * offers more verbose logging and reporting than the production config.
 * It retains most of the original comments and generates sourcemaps to
 * make debugging easier.
 * @type import('postcss-load-config').ConfigFn
 */
module.exports = (ctx) => {
	const {
		foldername,
		isTheme = false,
		isExpress = false,
		isLegacy = false,
		varsOnly = false,
		...options
	} = ctx.options;

	const tokens = isLegacy
		? [
				require.resolve("@spectrum-css/vars/dist/spectrum-global.css", {
					paths: [
						path.join(ctx.cwd, "node_modules"),
						path.join(__dirname, "node_modules"),
					],
				}),
				require.resolve("@spectrum-css/vars/dist/spectrum-medium.css", {
					paths: [
						path.join(ctx.cwd, "node_modules"),
						path.join(__dirname, "node_modules"),
					],
				}),
				require.resolve("@spectrum-css/vars/dist/spectrum-light.css", {
					paths: [
						path.join(ctx.cwd, "node_modules"),
						path.join(__dirname, "node_modules"),
					],
				}),
		  ]
		: [
				// require.resolve("@spectrum-css/tokens", {
				// 	paths: [path.join(ctx.cwd, "node_modules"), path.join(__dirname, "node_modules")],
				// }),
				path.join(__dirname, "tokens/dist/index.css"),
		  ];

	if (isLegacy) {
		/**
		 * Why a try/catch here? Because we aren't too concerned if the resolve fails
		 * we're basically guessing at what the file's name *might* be so it's okay if
		 * it doesn't exist.
		 */
		try {
			if (foldername) {
				tokens.push(
					require.resolve(
						`@spectrum-css/vars/dist/components/spectrum-${foldername}.css`,
						{
							paths: [
								path.join(ctx.cwd, "node_modules"),
								path.join(__dirname, "node_modules"),
							],
						}
					)
				);
			}
		} catch (error) {}

		if (isExpress) {
			tokens.push(
				require.resolve("@spectrum-css/expressvars/dist/spectrum-global.css", {
					paths: [
						path.join(ctx.cwd, "node_modules"),
						path.join(__dirname, "node_modules"),
					],
				}),
				require.resolve("@spectrum-css/expressvars/dist/spectrum-medium.css", {
					paths: [
						path.join(ctx.cwd, "node_modules"),
						path.join(__dirname, "node_modules"),
					],
				}),
				require.resolve("@spectrum-css/expressvars/dist/spectrum-light.css", {
					paths: [
						path.join(ctx.cwd, "node_modules"),
						path.join(__dirname, "node_modules"),
					],
				})
			);

			try {
				if (foldername) {
					tokens.push(
						require.resolve(
							`@spectrum-css/expressvars/dist/components/spectrum-${foldername}.css`,
							{
								paths: [
									path.join(ctx.cwd, "node_modules"),
									path.join(__dirname, "node_modules"),
								],
							}
						)
					);
				}
			} catch (error) {}
		}
	}

	const globalVariables = new Map();
	/**
	 * Read in the content for the global variables files
	 * and parse it for key/value pairs
	 */
	for (const file of tokens) {
		/* if the file doesn't exist, move on quietly */
		if (!fs.existsSync(file)) {
			console.debug(`Token file not found: ${file}.`);
			continue;
		}

		/* read in the file content */
		const content = fs.readFileSync(file);
		postcss
			.parse(content, {
				from: file,
			})
			.walkDecls((decl) => {
				if (decl.prop.startsWith("--")) {
					globalVariables.set(decl.prop, decl.value);
				}
			});
	}

	return {
		...options,
		plugins: {
			/* --------------------------------------------------- */
			/* ------------------- IMPORTS ---------------- */
			"postcss-import": {
				root: ctx.cwd,
				addModulesDirectories: [
					path.join(ctx.cwd, "node_modules"),
					path.join(__dirname, "node_modules"),
				],
			},
			/** @note used in *button, modal, picker, popover, quickaction, tooltip, underlay */
			"postcss-extend-rule": {
				onUnusedExtend: "warn",
			},
			/* --------------------------------------------------- */
			/* ------------------- POLYFILLS --------------------- */
			"postcss-preset-env": {
				/**
				 * @note stage 2 (default); stage 4 === stable
				 * @link https://preset-env.cssdb.org/features/#stage-2
				 */
				stage: 2,
			},
			/* --------------------------------------------------- */
			/* ------------------- KEY PROCESSING ---------------- */
			"postcss-each": {},
			/**
			 * @note custom plugin to transform transforms; might just hardcode these in future
			 * @used accordion, actionbutton, assetlist, breadcrumb, calendar, pagination, slider, treeview
			 **/
			"@spectrum-tools/postcss-transform-logical": {},
			/* --------------------------------------------------- */
			/* ------------------- ORGANIZE/DEDUPE --------------- */
			/**
			 * @note only used in migrated builds
			 *
			 * @todo could this be broken out into smaller, focused plugins?
			 *
			 * @note processIdentifier: this functions as a kind of style query polyfill
			 * @example @\container style(--spectrum: express) -> .spectrum--express
			 * @link https://blog.logrocket.com/new-css-style-queries/
			 * @link https://developer.chrome.com/blog/style-queries/
			 *
			 * @note noFlatVariables: used for dist/index-base.css
			 * @note noSelectors: used for themes/*.css
			 */
			"@spectrum-tools/postcss-splitinator": !isLegacy
				? {
						processIdentifier: (identifierValue, identifierName) => {
							if (identifierName !== "system") return identifierValue;
							if (identifierValue !== "spectrum") {
								return `spectrum--${identifierValue}`;
							}
							return identifierValue;
						},
						selectors: !isTheme,
						flatVariables: ctx.to
							? path.basename(ctx.to, ".css") !== "index-base"
							: false,
				  }
				: false,
			"postcss-use": {},
			"postcss-sorting": {
				order: ["custom-properties", "declarations", "at-rules", "rules"],
				"properties-order": "alphabetical",
			},
			"postcss-combine-duplicated-selectors": {},
			/** @note Merges _adjacent_ rules only; hense the sorting is first */
			"postcss-merge-rules": {},
			"postcss-combine-media-query": {},
			/* --------------------------------------------------- */
			/* ------------------- VARIABLE PARSING -------------- */
			/** @note this enables reporting of unused variables in a file */
			"@spectrum-tools/postcss-dropunusedvars": {
				fix: false,
				ignoreList: [/^--mod-/, /^--system/],
			},
			/** @note this enables reporting of duplicate variables in a file */
			"@spectrum-tools/postcss-dropdupedvars": {
				lint: true,
			},
			// "@spectrum-tools/postcss-custom-properties-mapping": {
			// 	lint: true,
			// 	globalVariables,
			// 	customPropertiesOnly: true,
			// },
			/** @todo do we need this still? */
			"@spectrum-tools/postcss-notnested": isLegacy
				? { replaceWith: ".spectrum" }
				: false,
			"@spectrum-tools/postcss-notnested": isLegacy ? {} : false,
			/**
			 * @note this is only running on updated components in the themes/express.css file
			 * it's somewhat heavy-handed as it will remove the previous selector
			 * @todo do we need this still?
			 */
			"@spectrum-tools/postcss-combininator":
				isExpress || varsOnly
					? {
							selector: isExpress
								? ".spectrum--express"
								: `.spectrum-${upperFirst(camelCase(foldername))}`,
					  }
					: false,
			/** @note [CSS-289] Coordinating with SWC */
			// "postcss-hover-media-feature": {},
			/* --------------------------------------------------- */
			/* ------------------- CLEAN-UP TASKS ---------------- */
			"postcss-discard-comments": {
				removeAll: true,
			},
			/* After cleaning up comments, remove all empty rules */
			"postcss-discard-empty": {},
			/* Ensure the license is at the top of the file */
			"postcss-licensing": {
				filename: "COPYRIGHT",
				cwd: __dirname,
				skipIfEmpty: true,
			},
			/* --------------------------------------------------- */
			/* ------------------- REPORTING --------------------- */
			"postcss-reporter": {
				clearReportedMessages: true,
			},
		},
	};
};
