const db = require("../../models");
const User = db.user;
const UserPersonalInfo = db.userPersonalInfo;
const UserFinancialInfo = db.userFinancialInfo;

const bcrypt = require("bcrypt");

// Create and Save a new User
// exports.create = (req, res) => {
//     // Validate request
//     if (!req.body) {
//         res.status(400).send({
//             message: "Content can not be empty!"
//         });
//         return;
//     }

//     let hash = null;
//     if(req.body.password) {
//         hash = bcrypt.hashSync(req.body.password.toString(), 10);
//     }

//     // Create a User
//     const user = {
//         username: req.body.username,
//         password: hash,
//         fullName: req.body.fullname,
//         role: "ROLE_EMPLOYEE",
//         active: false
//     };

//     // Save User in the database
//     User.findOne({ where: { username: user.username } })
//         .then(userExists => {
//             if (!userExists) {
//                 User.create(user)
//                     .then(data => {
//                         let userData = {
//                             userId: data.dataValues.id
//                         }
//                         UserPersonalInfo.create(userData)
//                         .then(data => {
//                             UserFinancialInfo.create(userData)
//                             .then(data => {
//                                 res.send(data)
//                             })
//                             .catch(err => {
//                                 console.log(err)
//                                 res.status(500).send({
//                                     message:
//                                         err.message || "Some error occurred while creating the User."
//                                 });
//                             })
//                         })
//                         .catch(err => {
//                             console.log(err)
//                             res.status(500).send({
//                                 message:
//                                     err.message || "Some error occurred while creating the User."
//                             });
//                         })
//                         res.send(data);
//                     })
//                     .catch(err => {
//                         res.status(500).send({
//                             message:
//                                 err.message || "Some error occurred while creating the User."
//                         });
//                     });
//             } else {
//                 res.status(403).send({
//                     message: "Username already exists"
//                 })
//             }
//         })
// };

exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }

  let hash = req.body.password
    ? bcrypt.hashSync(req.body.password.toString(), 10)
    : null;

  const user = {
    username: req.body.username,
    password: hash,
    fullName: req.body.fullname,
    role: "ROLE_EMPLOYEE",
    active: false,
    college: req.body.college || null, // Now optional
    departmentId: req.body.departmentId || null,
  };

  try {
    const userExists = await User.findOne({
      where: { username: user.username },
    });
    if (userExists) {
      return res.status(403).send({ message: "Username already exists" });
    }

    const data = await User.create(user);
    let userData = { userId: data.dataValues.id };

    await UserPersonalInfo.create(userData);
    await UserFinancialInfo.create(userData);

    return res.send(data); //  Only one response
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res
        .status(500)
        .send({
          message:
            err.message || "Some error occurred while creating the User.",
        });
    }
  }
};
