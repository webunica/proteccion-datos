/**
 * Build-time configuration constants.
 * The placeholder `__API_BASE_URL__` is replaced by the build pipeline
 * (e.g. esbuild --define:__API_BASE_URL__='"https://privacy.domain.com"').
 */
export const API_BASE_URL = '__API_BASE_URL__'; // replaced at build time
