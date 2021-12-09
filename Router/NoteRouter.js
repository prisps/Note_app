// Require the necessary modules for this file.
const express = require("express");

// Setup a NoteRouter class which takes the note service as a dependency, that was we can inject the NoteService when we use our Router. As this is not a hard coded value we will need to inject the noteService for every instance of the note router.
class NoteRouter {
  constructor(noteService) {
    this.noteService = noteService;
  }

  // This utilises the express Router method, basically we are binding the path/ request to each restful verb
  router() {
    let router = express.Router();
    router.get("/", this.get.bind(this));
    router.post("/", this.post.bind(this));
    router.put("/:id", this.put.bind(this));
    router.delete("/:id", this.delete.bind(this));
    return router;
  }

  // Here we handle what will occur when we have been sent down a particular path, this path is '/' - we will just list all of the notes, that match our(req.auth.user)
  get(req, res) {
    console.log("GET");

    return this.noteService
      .list(req.auth.user) // The method we use from the service, we pass in the user so we get back specific notes for that user.
      .then((notes) => {
        console.log(req.auth.user);
        console.log(notes);
        res.json(notes);
      }) // What we do with the information that we receive, here we send the notes back in JSON format.
      .catch((err) => res.status(500).json(err)); // This .catch is to handle any errors that may befall our project.
  }

  post(req, res) {
    console.log(req.body.note, req.auth.user);
    console.log("POST");
    console.log(2);
    return this.noteService.add(req.body.note, req.auth.user).then(() => {
      console.log("running");
      console.log(req.auth.user);
      return this.noteService
        .list(req.auth.user)
        .then((notes) => {
          console.log(6);
          console.log(notes);
          return res.json(notes);
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    });
  }

  // Here we handle our put request, which has an id as a parameter (req.params.id), the body of the updated note (req.body.note) and the user who's note we want to update (req.auth.user)
  put(req, res) {
    console.log("PUT");

    return this.noteService
      .update(req.params.id, req.body.note, req.auth.user) // The noteService fires the update command, this will update our note (and our JSON file)
      .then(() => this.noteService.list(req.auth.user)) // Then we fire list note from the same noteService which returns the array of notes for that user.
      .then((notes) => res.json(notes)) // Then we respond to the request with all of our notes in the JSON format back to our clients browser.
      .catch((err) => res.status(500).json(err));
  }

  delete(req, res) {
    console.log("DELETE");
    return this.noteService
      .remove(req.params.id, req.auth.user)
      .then(() => this.noteService.list(req.auth.user))
      .then((notes) => res.json(notes))
      .catch((err) => res.status(500).json(err));
  }
}

module.exports = NoteRouter;
