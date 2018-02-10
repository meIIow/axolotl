const User = require('../data/userModel.js');

// Email API
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
    user: 'axolotl.codesmith@gmail.com',
    pass: 'ilovetesting',
  },
});

const userController = {};

// Return the entire list of users
userController.getUsers = (req, res) => {
  User.find({}, (err, userList) => {
    if (userList.length > 0) {
      res.status(200).json(userList);
    }
  });
};

// Add a user to the invite array
userController.invite = (req, res) => {
  const { username, target } = req.body;
  User.update({ username }, { $push: { invited: target } })
    .then(() => {
      User.find({}, (err, userList) => {
        res.status(200).json(userList);
      });
    })
    .catch((err) => {
      // Add error handling...
      console.log(err);
    });
};

// Accept a request to pair
userController.connect = (req, res) => {
  const { username, target } = req.body;
  let email = '';
  User.update({ username }, { $push: { connected: target } })
    .then(() => {
      User.find({}, (err, userList) => {
        if (err) throw err;
        res.status(200).json(userList);
      });
    })
    .then(() => {
      User.find({ username }, (err, result) => {
        if (err) throw err;
        email = result.email;
      });
    })
    .then(() => {
      User.find({ username: target }, (err, result) => {
        const mailOptions = {
          from: 'axolotl.codesmith@gmail.com',
          to: result[0].email,
          subject: 'New Pair Programming Connect',
          html: `Contact your potential abductor: ${username} (${email})`,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) throw err;
        });
      });
    })
    .catch((err) => {
      // Add error handling...
      console.log(err);
    });
};

// Update user info
userController.update = (req, res) => {
  // The post request includes a user property that stores the
  // contents of the user object with updates
  const { user } = req.body;
  const { password, location, bio, email, skills, intrests } = user;
  const updates = { password, email, location, bio, skills, intrests };
  User.update({ username: user.username }, updates)
    .then(() => {
      User.find({}, (err, userList) => {
        res.status(200).json(userList);
      });
    })
    .catch((err) => {
      // Add error handling...
      console.log(err);
    });
}

module.exports = userController;
