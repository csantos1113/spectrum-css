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

const valueParser = require("postcss-value-parser");

module.exports = ({ fix = true, ignoreList = [] } = {}) => ({
	postcssPlugin: "postcss-dropunusedvars",
	prepare() {
		const usedAnywhere = new Set();
		const usedInProps = new Set();
		const variableRelationships = {};

		return {
			// Drop unused variable definitions
			Declaration(decl) {
				const usedInDecl = new Set();
				const isVar = decl.prop.startsWith("--");

				if (/var\(.*?\)/g.test(decl.value)) {
					// Parse value and get a list of variables used
					const parsed = valueParser(decl.value);
					parsed.walk((node) => {
						if (node.type === "function" && node.value === "var") {
							if (node.nodes.length) {
								const varName = node.nodes[0].value;

								usedInDecl.add(varName);
								usedAnywhere.add(varName);

								if (!isVar) usedInProps.add(varName);
							}
						}
					});
				}

				// Store every variable referenced by this var
				if (isVar && usedInDecl.size > 0) {
					for (let varName of usedInDecl) {
						variableRelationships[varName] =
							variableRelationships[varName] || [];
						variableRelationships[varName].push(decl.prop);
					}
				}
			},
			OnceExit(root, { result }) {
				root.walkDecls((decl) => {
					if (!decl.prop.startsWith("--")) return;

					const varName = decl.prop;
					if (!varName) return;

					// Note if it seems like this variable is unused
					if (
						!usedAnywhere.has(varName) &&
						!ignoreList.some((regex) => regex.test(varName))
					) {
						if (!fix) {
							decl.warn(
								result,
								`Possible unused variable definition: ${varName}`,
								{
									word: varName,
									index: decl.sourceIndex,
								}
							);
						} else {
							decl.remove();
						}

						return;
					}

					if (!usedInProps.has(varName)) {
						// Drop a variable if everything that references it has been removed
						const relatedVars = variableRelationships[varName];

						if (!relatedVars || relatedVars.length === 0) return;

						// Check if everything that references this variable has been removed
						const keep = Object.entries(relatedVars).reduce(
							(keep, [, relatedVar]) => {
								if (usedAnywhere.has(relatedVar)) return true;
								else return keep;
							},
							false
						);

						if (keep) return;

						if (fix) {
							decl.remove();
						} else if (!ignoreList.some((regex) => regex.test(varName))) {
							/** @todo account for passthroughs; don't warn for intentional passthroughs */
							decl.warn(
								result,
								`Possible unused variable definition: ${varName}`,
								{
									word: varName,
									index: decl.sourceIndex,
								}
							);
						}
					}
				});
			},
		};
	},
});
