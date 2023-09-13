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
module.exports = (options) => {
	const {
		to = undefined,
		from = undefined,
		isTheme = false,
		isExpress = false,
		isLegacy = false,
		map = { inline: false },
	} = options;

	const fromPath = from?.split(path.sep);
	const idx = fromPath.indexOf("components");
	const foldername = fromPath[idx + 1];

	const tokens = [
		require.resolve("@spectrum-css/vars/dist/spectrum-global.css"),
		require.resolve("@spectrum-css/vars/dist/spectrum-medium.css"),
		require.resolve("@spectrum-css/vars/dist/spectrum-light.css"),
	];

	/**
	 * Why a try/catch here? Because we aren't too concerned if the resolve fails
	 * we're basically guessing at what the file's name *might* be so it's okay if
	 * it doesn't exist.
	 */
	try {
		if (foldername) {
			tokens.push(
				require.resolve(
					`@spectrum-css/vars/dist/components/spectrum-${foldername}.css`
				)
			);
		}
	} catch (error) {}

	if (isExpress) {
		tokens.push(
			require.resolve("@spectrum-css/expressvars/dist/spectrum-global.css"),
			require.resolve("@spectrum-css/expressvars/dist/spectrum-medium.css"),
			require.resolve("@spectrum-css/expressvars/dist/spectrum-light.css")
		);

		try {
			if (foldername) {
				tokens.push(
					require.resolve(
						`@spectrum-css/expressvars/dist/components/spectrum-${foldername}.css`
					)
				);
			}
		} catch (error) {}
	}

	tokens.push(require.resolve("@spectrum-css/tokens"));

	return {
		...options,
		map,
		plugins: {
			/* --------------------------------------------------- */
			/* ------------------- KEY PROCESSING ---------------- */
			"postcss-use": {}, // @note: when does postcss-use resolve the plugins? at the end?
			"postcss-each": {},
			"postcss-import": {},
			/** @note @inherit: used in *button, icon, modal, picker, popover, quickaction, table, tooltip, underlay */
			"postcss-inherit": {},
			/**
			 * @note custom plugin to transform transforms; might just hardcode these in future
			 * @used accordion, actionbutton, assetlist, breadcrumb, calendar, pagination, slider, treeview
			 **/
			"@spectrum-tools/postcss-transform-logical": {},
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
							? (identifierValue, identifierName) => {
									if (identifierName !== "system") return;
									if (identifierValue !== "spectrum") {
										return `spectrum--${identifierValue}`;
									}
									return identifierValue;
							  }
							: undefined,
						selectors: !isTheme,
						flatVariables: !(path.basename(to, "css") === "index-base"),
				  }
				: false,
			perfectionist: {
				format: "expanded",
				sourcemap: true,
			},
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
			"@spectrum-tools/postcss-dropdupedvars": {
				lint: true,
			},
			"@spectrum-tools/postcss-custom-properties-mapping": {
				lint: true,
				globalVariables: tokens,
			},
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
			// "postcss-combininator": !isLegacy && isExpress ? {} : false,
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
