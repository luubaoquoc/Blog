const express = require('express');
const router = express.Router();
require('dotenv').config();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin'


// check Login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}


// GET 
// Admin - Login Page

router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: " simple ......................"
        }

        res.render('admin/index', { locals, layout: adminLayout })
    } catch (error) {
        console.log(error);
    }
})

// POST
// Admin - Login

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordvail = await bcrypt.compare(password, user.password);
        if (!isPasswordvail) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
})


// GET 
// Admin - DashBoard

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "DashBoard",
            description: " simple ......................"
        }
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);

    }
})


// GET
// Admin - Create New Post
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: " simple ......................"
        }
        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });

    } catch (error) {
        console.log(error);

    }
})


// POST
// Admin - Create New Post
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        console.log(req.body);
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and content are required' });
        }
        await Post.create({ title, body });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);

    }
})


// GET
// Admin - Edit Post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const locals = {
            title: "Edit Post",
            description: " simple ......................"
        }
        const data = await Post.findById(id);
        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);

    }
})



// PUT
// Admin - Edit Post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const { title, body } = req.body;
        const { id } = req.params;
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and content are required' });
        }
        await Post.findByIdAndUpdate(id, { title, body });
        res.redirect('/edit-post/' + id);
    } catch (error) {
        console.log(error);

    }
})


// router.post('/admin', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         if (req.body.username === 'admin' && req.body.password === 'password') {
//             res.send('You are logged in.');
//         } else {
//             res.send('Wrong username or password..')
//         }
//     } catch (error) {
//         console.log(error);
//     }
// })
// GET 
// Admin - Register

router.post('/register', async (req, res) => {

    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password: hashedpassword });
            res.status(201).json({ message: 'User Created', user })
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in user' });
            } else {
                res.status(500).json({ message: 'Internal server error' })
            }

        }

    } catch (error) {
        console.log(error);
    }
})



// DELETE
// Admin - Delete Post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);

    }
})

// GET
// Admin - logout
router.get('/logout', authMiddleware, async (req, res) => {
    try {
        res.clearCookie('token');
        res.redirect('/');
    } catch (error) {
        console.log(error);

    }
})


module.exports = router;