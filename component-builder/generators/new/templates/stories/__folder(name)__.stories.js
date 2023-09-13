// Import the component markup template
import { Template } from "./template";

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
	title: "Components/<%= name %>",
	description: "<%= description %>",
	component: "<%= pascalCase(name) %>",
	argTypes: {
		size: {
			name: "Size",
			type: { name: "string", required: true },
			defaultValue: "m",
			table: {
				type: { summary: "string" },
				category: "Component",
				defaultValue: { summary: "m" },
			},
			options: ["s", "m", "l", "xl"],
			control: "select",
		},
	},
	// More on args: https://storybook.js.org/docs/web-components/writing-stories/args
	args: {
		rootClass: "spectrum-<%= pascalCase(name) %>",
		size: "m",
	},
	parameters: {
		actions: {
			handles: [],
		},
		status: {
			type: process.env.MIGRATED_PACKAGES.includes("<%= folder(name) %>")
				? "migrated"
				: undefined,
		},
	},
};

export const Default = Template.bind({});
Default.args = {};
