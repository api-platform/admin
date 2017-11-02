/**
 * Gets the name of a field having the http://schema.org/name type or fallback to the id.
 *
 * @param {object} reference
 * @return {string}
 */
export default function(reference) {
  const field = reference.fields.find(
    field => 'http://schema.org/name' === field.id,
  );

  return field ? field.name : 'id';
}
