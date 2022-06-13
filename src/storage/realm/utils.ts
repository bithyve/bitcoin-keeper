/**
 * Converts Realm Object(immutable, outside write transaction) into a javascript object(mutable everywhere)
 * @param  {any|Realm.Object} object
 */
export const getJSONFromRealmObject = (object: any | Realm.Object) =>
  (object as Realm.Object).toJSON();
