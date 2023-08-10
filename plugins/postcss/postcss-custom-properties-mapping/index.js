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

const valueParser = require("postcss-value-parser");

/**
 * Notes about global variables json object - currently this is being
 * read in from a style dictionary json file; the token name is prefixed
 * but not with --. The values are either the value as a string or an
 * object with the name of the various states it supports. Each state
 * is a string with either the value or a reference to another token name.
 *
 * @typedef Options
 * @property {Map<string, string>} [globalVariables = new Map()] - a map global variables keyed on the property name
 * @property {boolean} [customPropertiesOnly = false] - whether to resolve var stacks for just custom properties or include vars assigned to other properties
 * @property {boolean} [lint = false] - whether to throw a warning when a variable is not found
 */
/** @type import('postcss').PluginCreator<Options> */
module.exports = ({
	globalVariables = new Map(),
	customPropertiesOnly = false,
	lint = false,
} = {}) => ({
	postcssPlugin: "postcss-custom-properties-mapping",
	prepare(result) {
		const varFunctionRegex = /var\(\s*(--[a-z][a-z|0-9|-]*)\s*\)/i;
		const localCache = new Map();
		const foundCache = new Map();
		const skipped = new Set();

		return {
			RuleExit(rule) {
				function lookupFallback(value, { source = rule } = {}) {
					if (!value) return;

					const parsed = valueParser(value);

					parsed.walk((node) => {
						if (
							node.type !== "function" ||
							node.value !== "var" ||
							!node.nodes
						) {
							return;
						}

						// Filter out any space or div nodes to decide if a fallback is needed
						if (
							node.nodes.filter((n) => n.type !== "space" && n.type !== "div")
								.length > 1
						) {
							return;
						}

						const lookup = node.nodes[0]?.value;
						if (!lookup) return;
						if (lookup.startsWith("--mod") || !lookup.startsWith("--")) {
							return;
						}

						if (skipped.has(lookup)) return;

						let found;
						// Start with the found cache to avoid circular references
						if (foundCache.has(lookup)) {
							found = foundCache.get(lookup);
							// } else if (localCache.has(lookup)) {
							// 	found = localCache.get(lookup);
						} else if (globalVariables.has(lookup)) {
							found = globalVariables.get(lookup);
						}

						if (!found) {
							skipped.add(lookup);

							if (lint) {
								source.warn(result, `Variable not found: ${lookup}`, {
									node: source,
								});
							}

							return;
						}

						if (varFunctionRegex.test(found)) {
							// @todo is this causing a loop??
							found = lookupFallback(found);
						}

						if (found !== lookup) {
							node.nodes = [
								...node.nodes,
								{
									type: "div",
									value: ", ",
								},
								{
									type: "word",
									value: found,
								},
							];
						}
					});

					return parsed.toString();
				}

				rule.walkDecls((decl) => {
					// Check if this declaration is a custom property
					const isProp = decl.prop.startsWith("--");
					const isMod = decl.prop.startsWith("--mod");
					// Check if this declaration uses a custom property
					const usesProp = varFunctionRegex.test(decl.value);

					// If this neither is a custom property nor uses a custom property, stop processing
					if ((!isProp || isMod) && !usesProp) return;

					// If the user has opted to only resolve stacks for custom properties, stop processing
					if (customPropertiesOnly && !isProp) return;

					const newValue = lookupFallback(decl.value, { source: decl });

					if (!newValue || newValue === decl.value) return;

					localCache.set(decl, newValue);

					// Update the values cache for faster lookups
					if (decl.prop.startsWith("--")) {
						foundCache.set(decl.prop, newValue);
					}
				});

				foundCache.clear();
			},
			OnceExit() {
				// Update all declarations at the end of the processing
				localCache.forEach((value, decl) => {
					decl.value = value;
				});
			},
		};
	},
});

module.exports.postcss = true;
