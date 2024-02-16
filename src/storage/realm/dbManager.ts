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
  return realm.initializeDatabase(key);
};

/**
 * delete realm
 * @returns Promise
 */
const deleteRealm = (key: ArrayBuffer | ArrayBufferView | Int8Array) => realm.deleteDatabase(key);

/**
 * generic :: creates an object corresponding to provided schema
 * @param  {RealmSchema} schema
 * @param  {any} object
 */
const createObject = (schema: RealmSchema, object: any, updateMode = Realm.UpdateMode.All) => {
  try {
    const hasCreated = realm.create(schema, object, updateMode);
    return hasCreated;
  } catch (err) {
    console.log(err);
  }
};

/**
 * generic :: creates objects corresponding to provided schema
 * @param  {RealmSchema} schema
 * @param  {any[]} objects
 */
const createObjectBulk = (
  schema: RealmSchema,
  objects: any[],
  updateMode = Realm.UpdateMode.All
) => {
  try {
    const hasCreated = realm.createBulk(schema, objects, updateMode);
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
  return objects[index];
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
 * generic :: fetches an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 * @param  {string} id
 */
const getObjectByPrimaryId = (schema: RealmSchema, name: string, primaryId: string) => {
  const objects = realm.get(schema);
  return objects.filtered(`${name} == '${primaryId}'`)[0];
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
 * generic :: updates the object, corresponding to provided schema and id, w/ supplied props
 * @param  {RealmSchema} schema
 * @param  {string} id
 * @param  {any} updateProps
 */
const updateObjectByPrimaryId = (
  schema: RealmSchema,
  name: string,
  primaryId: string,
  updateProps: any
) => {
  try {
    const object = getObjectByPrimaryId(schema, name, primaryId);
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

/**
 * generic :: deletes an object corresponding to provided schema and the supplied id
 * @param  {RealmSchema} schema
 */
const deleteObjectById = (schema: RealmSchema, id: string) => {
  try {
    const object = getObjectById(schema, id);
    realm.delete(object);
    return true;
  } catch (err) {
    console.error({ err });
    return false;
  }
};

export default {
  initializeRealm,
  deleteRealm,
  deleteObjectById,
  createObjectBulk,
  createObject,
  getObjectByIndex,
  getObjectById,
  getObjectByPrimaryId,
  updateObjectById,
  updateObjectByPrimaryId,
  getCollection,
  getObjectByField,
};
