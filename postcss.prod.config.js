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

const path = require("path");

/**
 * @description This is the PostCSS config for our development code; this
 * includes assets **not** in the dist output, such as index.css or themes/*.css
 * @type import('postcss-load-config').ConfigFn
 */
module.exports = (ctx) => {
	const {
		foldername,
		isTheme = false,
		isExpress = false,
		isLegacy = false,
		...options
	} = ctx.options;

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
						processIdentifier: isTheme
							? (identifierName, identifierValue) => {
									if (identifierName !== "system") return;
									if (identifierValue !== "spectrum") {
										return `spectrum--${identifierValue}`;
									}
									return identifierValue;
							  }
							: undefined,
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
			"@spectrum-tools/postcss-combininator": isExpress ? {} : false,
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
