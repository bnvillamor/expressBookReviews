const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review; // Assuming the review is sent as a query parameter
  const username = req.session.authorization.username; // Retrieve the username from the session

  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty." });
  }

  // Check if the book exists in the database
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the book already has reviews
  if (!books[isbn]["reviews"]) {
    books[isbn]["reviews"] = {};
  }

  // Check if the current user has already posted a review for this book
  if (books[isbn]["reviews"][username]) {
    // If the user already posted a review, modify the existing review
    books[isbn]["reviews"][username] = review;
    return res.status(200).json({ message: "Review modified successfully." });
  } else {
    // If it's a new review from the user, add it to the reviews
    books[isbn]["reviews"][username] = review;
    return res.status(200).json({ message: "Review added successfully." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Retrieve the username from the session

  // Check if the book exists in the database
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (books[isbn]["reviews"][username]) {
    // If the user already posted a review, modify the existing review
    delete books[isbn]["reviews"][username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(200).json({ message: "No review to delete." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
