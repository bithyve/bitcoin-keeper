import { RealmSchema } from './enum';
import realm from './realm';

/**
 * intializes realm
 * @param  {ArrayBuffer|ArrayBufferView|Int8Array} key
 * @returns Promise
 */
const initializeRealm = async (
  key: ArrayBuffer | ArrayBufferView | Int8Array
): Promise<boolean> => {
  console.log('[Realm]: Database initialising...');
  return await realm.initializeDatabase(key);
};

/**
 * generic :: creates an object corresponding to provided schema
 * @param  {RealmSchema} schema
 * @param  {any} object
 */
const createObject = (schema: RealmSchema, object: any) => {
  try {
    const hasCreated = realm.create(schema, object);
    return hasCreated;
  } catch (err) {
    console.log(err);
  }
};

/**
 * generic :: fetches an object corresponding to provided schema and the supplied instance num
 * @param  {RealmSchema} schema
 */
const getObjectByIndex = (schema: RealmSchema, index: number = 0, all: boolean = false) => {
  const objects = realm.get(schema);
  if (all) return objects;
  else return objects[index];
};

/**
 * generic :: fetches an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 * @param  {string} id
 */
const getObjectById = (schema: RealmSchema, id: string) => {
  const objects = realm.get(schema);
  return objects.filtered(`id == '${id}'`)[0];
};

/**
 * generic :: updates the object, corresponding to provided schema and id, w/ supplied props
 * @param  {RealmSchema} schema
 * @param  {string} id
 * @param  {any} updateProps
 */
const updateObjectById = (schema: RealmSchema, id: string, updateProps: any) => {
  try {
    const object = getObjectById(schema, id);
    for (const [key, value] of Object.entries(updateProps)) {
      realm.write(() => {
        object[key] = value;
      });
    }
    return true;
  } catch (err) {
    console.error({ err });
    return false;
  }
};

/**
 * generic :: fetched the object corresponding to the fieldName and Value
 * @param  {RealmSchema} schema
 * @param  {any} value
 * @param  {string} fieldName
 */
const getObjectByField = (schema: RealmSchema, value: string, fieldName: string) => {
  const objects = realm.get(schema);
  return objects.filtered(`${fieldName} == '${value}'`);
};

/**
 * generic :: fetches an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 */
const getCollection = (schema: RealmSchema) => {
  const objects = realm.get(schema);
  return objects.toJSON();
};

export default {
  initializeRealm,
  createObject,
  getObjectByIndex,
  getObjectById,
  updateObjectById,
  getCollection,
  getObjectByField,
};
