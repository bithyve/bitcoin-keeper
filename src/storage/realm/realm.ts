import Realm from 'realm';
import { captureError } from 'src/services/sentry';
import { RealmSchema } from './enum';
import schema from './schema';
import { runRealmMigrations } from './migrations';

export class RealmDatabase {
  private realm: Realm;

  public static file = 'keeper.realm';

  public static schemaVersion = 89;

  /**
   * initializes/opens realm w/ appropriate configuration
   * @param  {ArrayBuffer|ArrayBufferView|Int8Array} key
   * @returns Promise
   */
  public initializeDatabase = async (
    key: ArrayBuffer | ArrayBufferView | Int8Array
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // if the realm instance is already initialized, close it to prevent
      // Realm from getting stuck in a weird state (e.g. realm reference object
      // exists but the realm is closed)
      if (this.realm) {
        this.realm.close();
      }

      const realmConfig: Realm.Configuration = {
        path: RealmDatabase.file,
        schema,
        schemaVersion: RealmDatabase.schemaVersion,
        encryptionKey: key,
        onMigration: (oldRealm, newRealm) => {
          runRealmMigrations({ oldRealm, newRealm });
        },
      };
      this.realm = await Realm.open(realmConfig);
      return { success: true };
    } catch (err) {
      console.log('🚀 ~ RealmDatabase ~ err:', err);
      captureError(err);
      return { success: false, error: err.toString() };
    }
  };

  /**
   * fetches the current instance of the database
   */
  public getDatabase = (): Realm => {
    if (this.realm) return this.realm;
    throw new Error('database not initialized');
  };

  /**
   * deletes instance of the database
   */
  public deleteDatabase = (key: ArrayBuffer | ArrayBufferView | Int8Array): boolean => {
    const existingSchemaVersion = this.realm
      ? this.realm.schemaVersion
      : RealmDatabase.schemaVersion;
    if (this.realm) this.realm.close();
    this.realm = null;

    const realmConfig: Realm.Configuration = {
      path: RealmDatabase.file,
      schema,
      schemaVersion: existingSchemaVersion,
      encryptionKey: key,
    };
    Realm.deleteFile(realmConfig);
    return true;
  };

  /**
   * function that modifies objects in a realm(aka write transaction)
   * Write transactions let you create, modify, or delete Realm objects.
   * It handles operations in a single, idempotent update. A write transaction is all or nothing
   * @param  {} callback
   */
  public writeTransaction = (realm: Realm, callback) => realm.write(callback);

  /**
   * close the database when done with a realm instance to avoid memory leaks.
   */
  public closeDatabase = () => {
    if (this.realm) this.realm.close();
  };

  /**
   * creates an object corresponding to the provided schema
   * @param  {RealmSchema} schema
   * @param  {any} object
   * @param  {Realm.UpdateMode} updateMode
   */
  public create = (schema: RealmSchema, object: any, updateMode) => {
    const realm = this.getDatabase();
    try {
      this.writeTransaction(realm, () => {
        realm.create(schema, object, updateMode);
      });
      return true;
    } catch (err) {
      console.log({ err });
      return false;
    }
  };

  /**
   * creates an object corresponding to the provided schema
   * @param  {RealmSchema} schema
   * @param  {any[]} object
   * @param  {Realm.UpdateMode} updateMode
   */
  public createBulk = (schema: RealmSchema, objects: any[], updateMode) => {
    const realm = this.getDatabase();
    try {
      for (const object of objects) {
        this.writeTransaction(realm, () => {
          realm.create(schema, object, updateMode);
        });
      }

      return true;
    } catch (err) {
      console.log({ err });
      return false;
    }
  };

  /**
   * fetches objects corresponding to supplied schema
   * @param  {RealmSchema} schema
   */
  public get = (schema: RealmSchema) => {
    const realm = this.getDatabase();
    try {
      return realm.objects(schema);
    } catch (err) {
      console.log({ err });
    }
  };

  /**
   * generic write mechanism, modifies the database as per the callback
   * @param  {} callback
   */
  public write = (callback) => {
    const realm = this.getDatabase();
    try {
      this.writeTransaction(realm, callback);
    } catch (err) {
      console.log({ err });
    }
  };

  /**
   * removes the object from the database
   * @param  {any} object
   */
  public delete = (object: any) => {
    const realm = this.getDatabase();
    try {
      this.writeTransaction(realm, () => {
        realm.delete(object);
      });
    } catch (err) {
      console.log({ err });
    }
  };
}

export default new RealmDatabase();
