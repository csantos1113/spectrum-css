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

const noMissingParenthesis = require("@spectrum-tools/stylelint-no-missing-parenthesis");
const noMissingVar = require("@spectrum-tools/stylelint-no-missing-var");
const suitNamingPattern = require("@spectrum-tools/stylelint-suit-naming-pattern");

module.exports = {
	extends: ["stylelint-config-standard", "stylelint-config-clean-order"],
	plugins: [
		"stylelint-use-logical",
		noMissingParenthesis,
		noMissingVar,
		suitNamingPattern,
		"stylelint-order",
	],
	rules: {
		"block-no-empty": null,
		"at-rule-no-unknown": null,
		"selector-class-pattern": null,
		"declaration-empty-line-before": null,
		"custom-property-empty-line-before": null,
		"no-unknown-custom-properties": [
			true,
			{
				ignoreProperties: ["/^--mod/"],
				/* this ensures we are only ever warned about this */
				disableFix: true,
				message: (property) => {
					return `Custom property "${property}" not defined.`;
				},
				severity: "warning",
			},
		],
		"no-vendor-prefix": [
			true,
			{
				disableFix: true,
				severity: "warning",
			},
		],
		"max-nesting-depth": 3,
		"csstools/use-logical": true,
		"spectrum-tools/no-missing-parenthesis": true,
		"spectrum-tools/no-missing-var": true,
		"spectrum-tools/suit-naming-pattern": true,
		"custom-property-pattern": "^[a-zA-Z0-9]+(-[a-z0-9]([a-zA-Z0-9]+)?)+$",
		"alpha-value-notation": "percentage",
		"color-function-notation": [
			"modern",
			{
				disableFix: true,
				severity: "warning",
			},
		],
		"import-notation": null,
		"property-no-unknown": [
			true,
			{
				checkPrefixed: true,
			},
		],
		"declaration-property-value-no-unknown": [
			true,
			{
				ignoreProperties: {
					transform: ["/^logical/"],
				},
			},
		],
		"value-keyword-case": [
			"lower",
			{
				camelCaseSvgKeywords: true,
			},
		],
		"selector-not-notation": "complex",
		"order/order": ["custom-properties", "declarations", "at-rules", "rules"],
		"order/properties-order": ["alphabetical"],
	},
};
