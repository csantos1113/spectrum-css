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
 * @description This PostCSS config determines which file
 * to load based on env variable
 * @type import('postcss-load-config').ConfigFn
 */
module.exports = ({
	env = "development",
	file = undefined,
	from = undefined,
	to = undefined,
	cwd = undefined,
	options = {},
}) => {
	// Prefer the foldername provided by the NX_TASK_TARGET_PROJECT env variable
	options.foldername = process.env.NX_TASK_TARGET_PROJECT;

	// If that doesn't exist, try to guess the foldername from the `from` path
	if (!options.foldername && from) {
		const fromPath = from?.split(path.sep);
		const idx = fromPath ? fromPath.indexOf("components") : 0;
		options.foldername = fromPath[idx + 1];
	}

	// If we got a foldername from the interpretation above, use it to set the paths if they are empty
	if (options.foldername && typeof options.foldername === "string") {
		if (cwd === __dirname || !cwd) {
			cwd = path.join(__dirname, "components", options.foldername);
		}

		// If we haven't gotten a from path, try to interpolate the foldername
		if (typeof from === "undefined") {
			if (typeof file === "undefined") {
				from = path.join(cwd, "index.css");
			} else {
				from = path.join(file.dirname, file.basename);
			}
		}

		// If we haven't gotten a from path, try to interpolate the foldername
		if (typeof to === "undefined") {
			if (typeof file === "undefined") {
				to = path.join(cwd, "dist/index.css");
			} else {
				to = path.join(
					file.dirname,
					!file.dirname.includes("dist") ? "dist" : "",
					file.basename
				);
			}
		}
	}

	options.isLegacy = false;
	if (process.env.NX_TASK_TARGET_CONFIGURATION === "legacy") {
		options.isLegacy = true;
	} else {
		const pkg = require(path.join(cwd, "package.json")) ?? {};

		// Determine whether to use the legacy build process
		if (
			pkg &&
			pkg.peerDependencies &&
			Object.keys(pkg.peerDependencies).includes("@spectrum-css/vars")
		) {
			options.isLegacy = true;
		}
	}

	// Determine if this is an express file within themes
	options.isExpress = from && from.endsWith("/express.css");
	options.isTheme =
		options.isExpress || (from && from.endsWith("/spectrum.css"));
	options.varsOnly =
		(to && to.endsWith("/vars.css")) || (from && from.endsWith("/vars.css"));

	const configName = `./postcss.${
		env === "production" ? "prod" : "dev"
	}.config.js`;
	return require(configName)({
		env,
		file,
		from,
		cwd,
		options,
	});
};
