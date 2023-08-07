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

exports.builder = path.resolve(__dirname, "..");
exports.siteResources = path.resolve(__dirname, "../../../site");
exports.topLevel = path.resolve(__dirname, "../../..");
exports.isTopLevel = process.cwd() === path.resolve(__dirname, "../../..");
exports.site = path.resolve(__dirname, "../../../site");
exports.components = path.join(__dirname, "../../../components");
exports.resolve = (component) =>
	path.join(exports.components, component.split("/").pop());
