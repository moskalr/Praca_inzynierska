export function capitalizeFirstLetter(value: string) {
  if (value && value.length > 0) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

export default capitalizeFirstLetter;
