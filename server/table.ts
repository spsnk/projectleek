/*
* Class table, holds table information and methods
+
*/

class Table {
  name: string;
  database: string;
  connection: any;

  constructor(name: string, database: string, connection: any) {
    this.name = name;
    this.database = database;
    this.connection = connection;
  }

  get(fields: object, callback: void) {
    let query =
      "SELECT * FROM " + this.database + "." + this.name + " AS t0 WHERE ";
    let counter = 0;
    for (let field in fields) {
      query +=
        (counter > 0 ? " AND " : "") +
        " t0." +
        field +
        " = " +
        this.connection.escape(fields[field]);
      counter++;
    }
    if (typeof callback === typeof Function) {
      return this.connection.query(query, callback);
    } else {
      return this.connection.query(query);
    }
  }
}
