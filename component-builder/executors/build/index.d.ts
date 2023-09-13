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

export type { ComponentBuilderExecutorOptions } from './schema';

import type { PathLike } from 'fs';
import { ExecutorContext } from '@nx/devkit';

/** @description The category of the token */
export type TokenCategory = string;

/** @description The name of the token */
export type Token = string;

/** @description Metadata about a token */
export type TokenData = {
    fallback: Token|string[];
    file: PathLike;
    selector: string;
};

export type TokenMetadata = {
    [key: Token]: TokenData[];
};

/** @description Rules for assigning tokens to buckets */
export type BucketConfig = Map<TokenCategory, (string|RegExp)[]>;


/** @description Paths to all generated assets in the build process */
export interface Outputs {
    /** @description Concatenates all the source files and themes */
    index: PathLike;
    /** @description Copy of index.css for backwards compatibility */
    compat: PathLike;
    /** @description Pared down file with only the local custom properties' definitions */
    vars: PathLike;
    /**
     * @description Markdown file containing the list of modifiable custom properties
     * @deprecated Use customProperties instead; remove with S2 migration
     */
    markdown: PathLike;
    /** @description JSON file containing the list of all custom properties used by a component sorted into logical buckets for documentation purposes */
    customProperties: PathLike;
    /**
     * @description Only used by modern build tasks
     * @todo Isn't this the same as index?
     */
    base: PathLike;
    /** @description Concatenates all the theme files; Only used by modern build tasks */
    themes: PathLike;
};


/** @description Options added during normalization */
export type NormalizedOptions =
    Required<ComponentBuilderExecutorOptions> & {
        env: "production" | "development";
    };

/** @description An iterable build executor for Spectrum CSS components that reads in the provided source files, combines them, and runs them through PostCSS to generate the final output. */
export async function spectrumBuildExector(options: ComponentBuilderExecutorOptions, context: ExecutorContext): Promise<{ success: boolean; baseUrl?: string; }>;

/** @description Using the provided options and context, returns a cleaned-up and standardized set of results */
export function normalizedOptions(opts: ComponentBuilderExecutorOptions, context:ExecutorContext): NormalizedOptions;

/**
 * @description Pretty print the provided message with the colorized package prefix
 * @requires printPkg - this global variable holds the pretty-print format for the package name which is used as a prefix for all logged output
 * @requires logger - this utility function is sourced from @nx/devkit
*/
export function log(message: string): void;

/** @description Print the provided paths in human-readable format */
export function print(paths: PathLike[]|PathLike, bytes: number): string;

/** @description Read in the provided input files, combine, and run them through PostCSS */
export function readWrite(inputPaths: PathLike[], outputPath: PathLike): Promise<string>;

/** @description Write out the provided contents to the provided outputPath */
export function write(contents: string, outputPath: PathLike, { formatter = "css" }: { formatter?: string; }): Promise<string>;

export default spectrumBuildExector;
