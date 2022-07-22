import Realm from 'realm';
import { RealmSchema } from './enum';
import schema from './schema';

export class RealmDatabase {
  private realm: Realm;
  public static file = 'keeper.realm';
  public static schemaVersion = 17;

  /**
   * initializes/opens realm w/ appropriate configuration
   * @param  {ArrayBuffer|ArrayBufferView|Int8Array} key
   * @returns Promise
   */
  public initializeDatabase = async (
    key: ArrayBuffer | ArrayBufferView | Int8Array
  ): Promise<boolean> => {
    try {
      if (this.realm) return true; // database already initialized
      const realmConfig: Realm.Configuration = {
        path: RealmDatabase.file,
        schema,
        schemaVersion: RealmDatabase.schemaVersion,
        encryptionKey: key,
        migration: (oldRealm, newRealm) => {},
      };
      this.realm = await Realm.open(realmConfig);
      return true;
    } catch (err) {
      console.log('failed to initialize the database', { err });
      return false;
    }
  };

  /**
   * fetches the current instance of the database
   */
  public getDatabase = (): Realm => {
    if (this.realm) return this.realm;
    else throw new Error('database not initialized');
  };

  /**
   * function that modifies objects in a realm(aka write transaction)
   * Write transactions let you create, modify, or delete Realm objects.
   * It handles operations in a single, idempotent update. A write transaction is all or nothing
   * @param  {} callback
   */
  public writeTransaction = (realm: Realm, callback) => {
    return realm.write(callback);
  };

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
   */
  public create = (schema: RealmSchema, object: any) => {
    const realm = this.getDatabase();
    try {
      this.writeTransaction(realm, () => {
        realm.create(schema, object, Realm.UpdateMode.All);
      });
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
