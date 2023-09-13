/*!
Copyright 2023. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require("fs");

/** @type import("postcss") */
const postcss = require("postcss");

/**
 * Notes about global variables json object - currently this is being
 * read in from a style dictionary json file; the token name is prefixed
 * but not with --. The values are either the value as a string or an
 * object with the name of the various states it supports. Each state
 * is a string with either the value or a reference to another token name.
 *
 * @typedef Options
 * @property {string[]} [globalVariables = []] - an array of files to read in that contain global variables
 */
/** @type import('postcss').PluginCreator<Options> */
module.exports = ({ globalVariables = [], lint = false } = {}) => ({
	postcssPlugin: "postcss-custom-properties-mapping",
	prepare() {
		// A cache of recently found values for faster lookups
		const valuesCache = new Map();
		const globalCache = new Map();

		/**
		 * Read in the content for the global variables files
		 * and parse it for key/value pairs
		 */
		for (const file of globalVariables) {
			/* if the file doesn't exist, move on quietly */
			if (!fs.existsSync(file)) continue;

			/* read in the file content */
			const content = fs.readFileSync(file);
			postcss
				.parse(content, {
					from: file,
				})
				.walkDecls((decl) => {
					if (decl.prop.startsWith("--")) {
						globalCache.set(decl.prop, decl.value);
					}
				});
		}

		return {
			/** @type import('postcss').Processors.Declaration */
			Declaration(decl) {
				// Check if this declaration is a custom property
				const isProp = decl.prop.startsWith("--");
				const isMod = decl.prop.startsWith("--mod");

				// Add this declaration to the cache if it's a custom property
				// in case a descendant declaration needs it
				if (isProp && !isMod) valuesCache.set(decl.prop, decl.value);
			},
			/**
			 * This needs to be run in Once or OnceExit so we don't report
			 * on the same line more than once
			 */
			OnceExit(root, { result }) {
				root.walkDecls((decl) => {
					// Check if this declaration is a custom property
					const isProp = decl.prop.startsWith("--");
					const isMod = decl.prop.startsWith("--mod");
					// Check if this declaration uses a custom property
					const usesProp = decl.value.match(/var\((--[a-z|-]+)[,|\)]/g);

					// If this neither is a custom property nor uses a custom property, stop processing
					if ((!isProp || isMod) && !usesProp) return;

					const matches = decl.value.matchAll(/var\(\s*(--[a-z|-]+)\s*(,|\))/g);
					if (matches) {
						[...matches].forEach((use) => {
							const lookup = use[1];
							if (!lookup || lookup.startsWith("--mod")) return;

							if (valuesCache.has(lookup)) {
								// do a thing
								return;
							} else if (globalCache.has(lookup)) {
								// do a thing
								return;
							} else if (lint) {
								console.log(valuesCache);
								decl.warn(result, `Variable not found: ${lookup}`, {
									node: decl,
								});
							}
						});
					}
				});
			},
		};
	},
});

module.exports.postcss = true;
