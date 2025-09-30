import express, { response } from 'express';
import bcrypt from 'bcrypt';
import devDb from './dbConfig.js';
import dotenv from 'dotenv';
import { fetchAndStoreShopifyData } from './Shopify_API/fetchAndStoreShopifyData.js';
import { authenticateUser } from './authenticateUser_jwt/authenticateUser_jwt.js';
import { fectchMetaAdSpent } from './Meta_API/metaDataFetcher.js';
import { fetchGoogleAdSpend } from './Google_Ads_API/google_ads_api.js';
import jwt from 'jsonwebtoken';

// Load enviroment variables from .env file
dotenv.config()

const app = express();

// build a base route to check if it's working properly
app.get('/', (req, res) => {
    res.json('Working!!')
});

// register route with validation, encrytion, and insertion data to database
app.post('/register', express.json(), async (req, res) => {
    const {name, email, password} = req.body;
    const saltRounds = 10;

    // Backend Validation: check if any important fields are empty
    if(!name || !email || !password) {
       return res.status(400).json('name, email, and password are required fields')
    }

    try {
        // hash the received password
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // inserting new user to database
        const [newUser] = await devDb('users').insert({
            name: name,
            email: email,
            password: hashedPassword
        }).returning(['id', 'name', 'email'])

        // response successful registration with User profile
        res.status(201).json({Message: 'user registered successfully', user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }})

    } catch(error) {
        // Backend Validation: if email already exists
        if (error.code === '23505') {
           return res.status(409).json('Email alredy exists!')
        }
       // handle other unexpected errors
       return res.status(500).json({message: 'Error Registering user'}) 
    }
});

// login route with proper authentication 
app.post('/login', express.json(), async (req, res) => {
    const {email, password} = req.body;

    // Backend Validation: if any important fields are empty
    if(!email || !password) {
        return res.status(400).json('Email and Password are required fields')
    }
    
    try {
        // selecting the user's id, email, and password, then matching the email from database
        const user = await devDb('users').select('id', 'email', 'password').where('email', email).first();
        
        // if email doesn't exist throw an error
        if(!user) {
            return res.status(401).json('Invalid Credentials')
        }

        // compare the provided password with the hashed password
        const matchPassword = await bcrypt.compare(password, user.password)

        // if hash password matchs, response with success
        if (matchPassword) {
            // generate a jwt token
            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'});
            res.status(201).json({message: 'Login Successful', token})
        } else {
            // if doesn't match response with an error
            res.status(401).json('Invalid Credentials')
        }
    } catch (error) {
        // handle other unexpected errors
        res.status(500).json('Internal Server Error')
    }
})

// === New Unified Route to Integrate and Process all API calls: '/api/dashboard/data' ===
app.get('/api/dashboard/data', authenticateUser, async(req, res) => {
    try{
        // fetch data from all api routes simultaneously
        const [shopifyData, metaData, googleData] = await Promise.all([
            fetchAndStoreShopifyData(req.userId),
            fectchMetaAdSpent(req.userId),
            fetchGoogleAdSpend(req.userId)
        ])
        
        // Data extraction and type converion
        const totalSales = shopifyData.totalSales;
        const metaAdSpend = metaData;
        const googleAdSpend = googleData;

        // Calculating total Ad Spend
        const total_Ad_Spend = metaAdSpend + googleAdSpend;

        // calculating ROAS
        let ROAS = 0
        if (totalSales > 0 && total_Ad_Spend > 0) {
            // ROAS
            ROAS = (totalSales / total_Ad_Spend);
        } else if (totalSales > 0 && total_Ad_Spend === 0) {
            // if store has revenue but no ad spend, then ROAS will become infinite, that's why we'll return ROAS = 0
            ROAS = 0;
        }
        

        const combinedData = {
            message: 'Dashboard data Retrived Successfully',
            dashBoardMetrics: {
                TimePeriod: shopifyData.timePeriod || 'Last 7 Days',
                TotalSales: totalSales,
                TotalAdSpend: total_Ad_Spend,
                ROAS: ROAS
            }
        }
        
        res.status(200).json(combinedData)
    } catch (error) {
        console.error('Error fetching combined dashboard data:', error);
        // centralized error handler catches failures from both APIs
        let errorMessage = 'An unexpected error occurred while fetching dashboard data.';
        
        // Custom error handling for Google Ads (e.g., if the token is still pending approval)
        if (error.message.includes('permission')) {
             errorMessage = "API Token Issue: Google Ads data retrieval failed due to permissions. (Likely still in Test mode or awaiting approval).";
        } else if (error.response && error.response.status === 401) {
            errorMessage = "Authentication failed. Please check credentials.";
        }
        
        res.status(500).json({ message: errorMessage, details: error.message });
    }
});

// server will listen to env port
const PORT = process.env.port || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})