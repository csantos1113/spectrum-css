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

const { resolve, relative, basename } = require("path");

module.exports = (ctx) => {
	const inputFile = ctx.file;
	let plugins = [];
	const componentPath = resolve(__dirname, "../components");
	const folderName = inputFile
		? relative(componentPath, inputFile).split("/")[0]
		: undefined;

	if (["expressvars", "vars", "tokens"].includes(folderName)) {
		const isExpress = folderName === "expressvars";
		const modifier = inputFile
			? basename(inputFile, ".css").startsWith("spectrum")
				? basename(inputFile, ".css")
						.replace("spectrum-", "")
						.replace("global", "")
				: ""
			: "";

		plugins = [
			require("postcss-import")({
				resolve(id) {
					if (id.startsWith("@spectrum-css/")) {
						return resolve(componentPath, id.replace("@spectrum-css/", ""));
					}
					return id;
				},
			}),
			require("postcss-selector-replace")({
				before: [":root"],
				after: [
					`${isExpress ? ".spectrum--express" : ""}${
						modifier ? `.spectrum--${modifier}` : ""
					}${!isExpress && !modifier ? ".spectrum" : ""}`,
				],
			}),
			...(isExpress
				? [
						require("postcss-prefix-selector")({
							prefix: ".spectrum--express",
							transform(_prefix, selector, prefixedSelector) {
								if (selector.startsWith(".spectrum--express")) return selector;
								/* Smoosh the selectors together b/c they co-exist */
								return prefixedSelector.replace(" ", "");
							},
						}),
				  ]
				: []),
		];
	}

	return { plugins };
};
