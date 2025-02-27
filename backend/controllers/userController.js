// NOTE: IMPORTS ----------------------------------------------------------------------------------
const userModel = require('../models/userModel')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

// RESEARCH / REFERENCE: https://youtu.be/MsudBMepwO8
const createToken = (_id) => {
    return jwt.sign({ _id: _id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

// RESEARCH / REFERENCE: https://mailtrap.io/blog/nodejs-email-validation/
// NOTE: FOR EMAIL VALIDATION USING REGULAR EXPRESSION (RegEx)
/*
    ^ "=>" BEGINING OF THE STRING 
    [^\s@]+ "=>" CHECKS FIRST PART FOR WHITE SPACES OR '@' SYMBOLS WHICH ARENT ALLOWED
    @ "=>" CHECKS FOR '@' SYMBOL
    [^\s@]+ "=>" CHECKS SECOND PART FOR WHITE SPACES OR '@' SYMBOLS WHICH ARENT ALLOWED
    \. "=>" CHECKS FOR PERIOD
    [^\s@]+ "=>" CHECKS THIRD PART FOR WHITE SPACES OR '@' SYMBOLS WHICH ARENT ALLOWED
    $ "=>" END OF STRING
*/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER USER ----------------------------------------------------------------------------------
const registerUser = async (req, res) => {
    
    const { username, email, password, confirmPassword } = req.body;
    const role = 'user';

// ------------------------- NOTE: VALIDATION -------------------------
    // NOTE: CHECKS IF USERNAME IS EMPTY
    if (username === '' || password === '' || confirmPassword === '') {
        return res.status(400).json({ error: 'Field cannot be empty.' })
    }

    if (password !== confirmPassword) {
        return res.status(401).json({ error: 'Password and confirm password does not match.' })
    }

    // NOTE: CHECKS IF EMAIL IS EMPTY
    if (email === '') {
        return res.status(400).json({ error: 'Email is required.' })
    }

    // NOTE: TEST EMAIL FORMAT USING 'emailRegex'
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' })
    }

    // NOTE: CHECKS IF USER EXISTS IN DB
    const alreadyRegisteredEmail = await userModel.findOne({ email })

    if (alreadyRegisteredEmail) {
        console.log(alreadyRegisteredEmail, email)
        return res.status(400).json({ error: 'Email is already registered.' })
    }

    // NOTE: ATTEMPTS TO CREATE USER IN DB  
    try {
        // NOTE: HASHING PASSWORD
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const user = await userModel.create({username, email, password: hash, role})

        if(!user) {
            // NOTE: RETURNS ERROR IF COULDN'T CREATE USER
            return res.status(409).json({ error: 'The request could not be completed due to a conflict with the current state of the resource.' })
        }

        // CREATING TOKEN
        const token = createToken(user._id)

        // NOTE: CREATES USER IF EVERYTHING IS OK
        res.status(201).json({ email, token })
    
    } catch (err) {
         // NOTE: RETURNS ERROR IF SOMETHING WENT WRONG
         return res.status(500).json({ error: err.message })
    }
}

// LOGIN USER -------------------------------------------------------------------------------------
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (email === '' || password === '') {
        return res.status(400).json({ error: 'Field cannot be empty.' })
    }

    // NOTE: TEST EMAIL FORMAT USING 'emailRegex'
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' })
    }

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({ error: 'Couldn\'t find user with matching email address.' })
        }

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials.' })
        }

        // NOTE: RETURNS USER TOKEN
        const token = createToken(user._id)

        // NOTE: RETURNS USER IF STATUS IS OK
        return res.status(200).json({ email, token })
    } catch(err) {
        // NOTE: RETURNS ERROR IF SOMETHING WENT WRONG
        return res.status(500).json({ error: err.message })
    }
}


module.exports = {
    loginUser,
    registerUser
}

// END OF DOCUMENT --------------------------------------------------------------------------------

// DEBUG: IN CASE ITS NEEDED
// // UPDATE USER ------------------------------------------------------------------------------------
// const updateUser = async (req, res) => {
//     const {id} = req.params

//     try {
//         // NOTE: VALIDATES ID FORMAT TO CHECK IF USER EXISTS
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ error: 'Invalid user ID.' })
//         }

//         const user = await userModel.findOneAndUpdate({_id: id}, {
//             ...req.body
//         })

//         // NOTE: CHECKS IF USER EXISTS IN DB
//         if (!user) {
//             return res.status(404).json({ error: 'Couldn\'t find user.' })
//         }

//         // NOTE: UPDATES USER IF STATUS IS OK
//         res.status(200).json(user)
//     } catch(err) {
//         // NOTE: CATCHES ERRORS AND RETURNS ERROR MESSAGE
//         return res.status(500).json({ error: err.message })
//     }
// }

// // GET ALL USERS ----------------------------------------------------------------------------------
// const getAllUsers = async (req, res) => {
//     // NOTE: FETCHES ALL USERS FROM DB
//     try {
//         const users = await userModel.find({})
        
//         // NOTE: VALIDATES IF THE USERS EXIST IN DB
//         if (!users) {
//             return res.status(404).json({ error: 'No users found.' })
//         }

//         // NOTE: RETURNS USERS IF STATUS IS OK
//         res.status(200).json(users)
//     } catch(err) {
//         return res.status(500).json({ error: err.message })
//     }
// }

// // GET SINGLE USER --------------------------------------------------------------------------------
// const getSingleUser = async (req, res) => {
//     const { id } = req.params

//     try {
//         // NOTE: VALIDATES ID FORMAT TO CHECK IF USER EXISTS
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ error: 'Invalid user ID.' })
//         }

//         const user = await userModel.findById(id)
        
//         // NOTE: CHECKS IF USER EXISTS IN DB
//         if (!user) {
//             return res.status(404).json({ error: 'Couldn\'t find user.' })
//         }

//         // NOTE: RETURNS USER IF STATUS IS OK
//         res.status(200).json(user)
//     } catch(err) {
//         // NOTE: RETURNS ERROR IF SOMETHING WENT WRONG
//         return res.status(500).json({ error: err.message })
//     }
// }
// // DELETE USER ------------------------------------------------------------------------------------
// const deleteUser = async (req, res) => {
//     const {id} = req.params

//     try {
//         // NOTE: VALIDATES ID FORMAT TO CHECK IF USER EXISTS
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({error: 'Invalid user ID.'})
//         }

//         const user = await userModel.findOneAndDelete({_id: id})
        
//         // NOTE: CHECKS IF USER EXISTS IN DB
//         if (!user) {
//             return res.status(404).json({error: 'Couldn\'t find user.'})
//         }
        
//         // NOTE: DELETES USER IF STATUS IS OK
//         res.status(200).json(user)
//     } catch(err) {
//         // NOTE: CATCHES ERRORS AND RETURNS ERROR MESSAGE
//         return res.status(500).json({ error: err.message })
//     }
// }