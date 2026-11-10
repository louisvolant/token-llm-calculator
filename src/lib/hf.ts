/**
 * Hugging Face model ids look like "organization/model". Restricting the
 * allowed characters keeps user input from reaching unexpected Hub paths.
 */
const HF_MODEL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isValidHfModelName(modelName: string): boolean {
  return HF_MODEL_PATTERN.test(modelName);
}
