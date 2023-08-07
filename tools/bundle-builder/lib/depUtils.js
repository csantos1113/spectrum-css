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

const fsp = require("fs").promises;
const path = require("path");
const depSolver = require("dependency-solver");
const { existsSync } = require("fs");

/*
  Given a package path, get its dependencies

  @param {string} packages - package directory

  @return {Object} An object mapping the package name to its dependencies, or null if no dependencies
*/
async function getDependencies(package) {
	const { name, devDependencies } = await fsp
		.readFile(path.join(package, "package.json"))
		.then(JSON.parse);
	const dependencies = [];

	if (devDependencies) {
		dependencies.push(
			...Object.keys(devDependencies).filter((dep) => {
				return (
					dep.indexOf("@spectrum-css") === 0 &&
					dep !== "@spectrum-css/bundle-builder" &&
					dep !== "@spectrum-css/component-builder" &&
					dep !== "@spectrum-css/component-builder-simple"
				);
			})
		);
	}

	return { name, dependencies };
}

/*
  Given a list of package paths, solve the dependency order

  @param {string[]} packages - package directories

  @return {string[]} The solved dependency order
*/
async function solveDependencies(packages) {
	async function getDependenciesForSolver(package) {
		if (!existsSync(path.join(package, "package.json"))) return;

		const { name, dependencies } = await getDependencies(package);

		if (dependencies.length === 0) return;
		return { [name]: dependencies };
	}

	const depArray = (
		await Promise.all(packages.map(getDependenciesForSolver))
	).filter(Boolean);

	let d = {};
	depArray.forEach((dep) => {
		Object.assign(d, dep);
	});

	return depSolver.solve(d);
}

/**
 * Get the list of all packages in given directory
 * @param {string} packageDir - package directory
 * @return {string[]} An array of package names in dependency order
 */
async function getPackageDependencyOrder(packageDir) {
	if (!existsSync(path.join(packageDir, "package.json"))) return [];
	const { dependencies } = await getDependencies(packageDir);

	return solveDependencies(
		dependencies.map((dep) =>
			path.join(path.dirname(require.resolve(dep)), "..")
		)
	);
}

/**
 * Get the list of all packages in given directory
 * @param {string} packagesDir - directory of packages
 * @return {Object} An array of package names in dependency order
 */
async function getFolderDependencyOrder(packagesDir) {
	const packages = [];
	// Get list of all packages
	for (const dirent of (
		await fsp.readdir(packagesDir, { withFileTypes: true })
	).filter((dirent) => dirent.isDirectory() || dirent.isSymbolicLink())) {
		if (existsSync(path.join(packagesDir, dirent.name, "package.json"))) {
			packages.push(path.join(packagesDir, dirent.name));
		}
	}

	const solution = ((await solveDependencies(packages)) ?? []).filter(
		(p) => p !== "@spectrum-css/tokens"
	);

	// Build tokens first
	// This is because not every package relies on tokens, but the builder needs tokens to bake vars
	return ["@spectrum-css/tokens", "@spectrum-css/expressvars", ...solution];
}

exports.getDependencies = getDependencies;
exports.solveDependencies = solveDependencies;
exports.getFolderDependencyOrder = getFolderDependencyOrder;
exports.getPackageDependencyOrder = getPackageDependencyOrder;
