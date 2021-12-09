// Require the necessary modules for this file.

// const fs = require("fs");

// Create a new NoteService class which takes a file as a dependency, this means whenever we are creating new instances of the noteService, we need to pass in a path to a file (this is the file that we will read, write and edit etc.)
class NoteService {
    constructor(file, fs) {
      this.file = file;
      this.initPromise = null; // Define that the instance variable, initPromise is null.
      this.fs = fs;
      this.init(); // Call the init() method.
    }
  
    // The init promise only needs to run once, when it runs, this.read resolves with this.notes (the notes from our json file) as a globally available variable.
    // the init promise is not concerned with resolving data - it just needs to run once to ensure persistence of the notes within our JSON file.
    init() {
      if (this.initPromise === null) {
        this.initPromise = new Promise((resolve, reject) => {
          this.read()
            .then(() => {
              resolve();
            })
            .catch(() => {
              this.notes = {};
              this.write().then(resolve).catch(reject);
            });
        });
      }
      return this.initPromise;
    }
  
    // The method below is utilized to read out notes from our json file, once we have the data from the file, we store the parsed notes in an instance variable called this.notes the read method then resolves with this.notes
    read() {
      return new Promise((resolve, reject) => {
        this.fs.readFile(this.file, "utf-8", (err, data) => {
          if (err) {
            reject(err);
          }
          try {
            this.notes = JSON.parse(data);
            console.log(this.notes);
          } catch (e) {
            return reject(e);
          }
          return resolve(this.notes);
        });
      });
    }
  
    // The write method is used to update our JSON file. It resolves with this.notes, our full array of notes.
    write() {
      console.log(4);
      return new Promise((resolve, reject) => {
        this.fs.writeFile(this.file, JSON.stringify(this.notes), (err) => {
          if (err) {
            return reject(err);
          }
          resolve(this.notes);
        });
      });
    }
  
    // List note is a function which is very important for the application, it retrieves the notes for a specific user. The user is accessed via req.auth.user within our router.
    list(user) {
        console.log(5);
        console.log("Listing");
        if (typeof user !== "undefined") {
          return this.init() //just checks to see if it has run once.
            .then(() => {
              return this.read();
            })
            .then(() => {
              if (typeof this.notes[user] === "undefined") {
                return [];
              } else {
                console.log("success");
                return this.notes[user];
              }
            });
        } else {
          return this.init().then(() => {
            return this.read();
          });
        }
    }
  
    // This method add notes updates the users notes, by adding the new note to this.notes, it then calls this.write, to update our JSON file with the newest notes.
    add(note, user) {
      console.log(3);
      return this.init().then(() => {
        if (typeof this.notes[user] === "undefined") {
          this.notes[user] = [];
        }
        this.notes[user].push(note);
        return this.write();
      });
    }
  
    // This method will be used to update a specific note in our application, it also handles some errors for our application. Then it calls this.write to update the JSON file.
    update(index, note, user) {
      return this.init().then(() => {
        if (typeof this.notes[user] === "undefined") {
          throw new Error("Cannot update a note, if the user doesn't exist");
        }
        if (this.notes[user].length <= index) {
          throw new Error("Cannot update a note that doesn't exist");
        }
        this.notes[user][index] = note;
        return this.write();
      });
    }
  
    // This method will remove a particular note from our this.notes. Then it calls this.write to update our JSON file.
    remove(index, user) {
      return this.init().then(() => {
        if (typeof this.notes[user] === "undefined") {
          throw new Error("Cannot remove a note, if the user doesn't exist");
        }
        if (this.notes[user].length <= index) {
          throw new Error("Cannot remove a note that doesn't exist");
        }
        return this.read().then(() => {
          this.notes[user].splice(index, 1);
          return this.write();
        });
      });
    }
  }
  
  module.exports = NoteService;
  