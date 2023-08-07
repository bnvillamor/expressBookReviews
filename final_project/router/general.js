const express = require('express');
const axios = require('axios');
const fs = require('fs');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
  
});

function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const data = await readFileAsync('./booksdb.js');
    res.send(JSON.stringify(books, null, 4));
  } catch (error) {
    res.status(500).send('Error fetching books');
  }
});

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    // Assuming booksdb is an object with ISBN as keys
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      resolve(null); // If the book with the given ISBN is not found
    }
  });
}

public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    if (book) {
      res.send(JSON.stringify(book, null, 4));
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching book details');
  }
});
  
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = [];
    for (let key of Object.keys(books)) {
      if (books[key]["author"] === author) {
        booksByAuthor.push(books[key]);
      }
    }
    resolve(booksByAuthor);
  });
}

public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await getBooksByAuthor(author);
    if (booksByAuthor.length > 0) {
      res.send(JSON.stringify(booksByAuthor, null, 4));
    } else {
      res.status(404).send("Author not found in books.");
    }
  } catch (error) {
    res.status(500).send('Error fetching books by author');
  }
});

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const booksWithTitle = [];
    for (let key of Object.keys(books)) {
      if (books[key]["title"] === title) {
        booksWithTitle.push(books[key]);
      }
    }
    resolve(booksWithTitle);
  });
}

public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksWithTitle = await getBooksByTitle(title);
    if (booksWithTitle.length > 0) {
      res.send(JSON.stringify(booksWithTitle, null, 4));
    } else {
      res.status(404).send("Title not found in books.");
    }
  } catch (error) {
    res.status(500).send('Error fetching books by title');
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]["reviews"]);
});

module.exports.general = public_users;
