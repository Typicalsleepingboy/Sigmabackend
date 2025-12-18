const express = require('express');
const { getUsersCollection } = require('../models/User');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const usersCollection = await getUsersCollection();
        const users = await usersCollection.find({}).toArray();

        res.status(200).json({
            status: 'success',
            code: 200,
            data: users,
            metadata: {
                totalUsers: users.length
            }
        });
    } catch (error) {
        console.error('Error in GET /users:', error);
        res.status(500).json({
            status: 'failed',
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});


router.post('/', async (req, res) => {
    try {
        const { name, email, username, phone, website, address, company } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                status: 'failed',
                code: 400,
                message: 'Name and email are required'
            });
        }

        const usersCollection = await getUsersCollection();

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: 'failed',
                code: 409,
                message: 'User with this email already exists'
            });
        }

        const maxIdDoc = await usersCollection.find({}).sort({ id: -1 }).limit(1).toArray();
        const nextId = maxIdDoc.length > 0 ? maxIdDoc[0].id + 1 : 1;

        let addressObj;
        if (typeof address === 'object' && address !== null && !Array.isArray(address)) {
            addressObj = {
                street: address.street || "",
                suite: address.suite || "",
                city: address.city || "",
                zipcode: address.zipcode || "",
                geo: {
                    lat: address.geo?.lat || "",
                    lng: address.geo?.lng || ""
                }
            };
        } else {
            addressObj = {
                street: typeof address === 'string' ? address : "",
                suite: "",
                city: "",
                zipcode: "",
                geo: {
                    lat: "",
                    lng: ""
                }
            };
        }

        let companyObj;
        if (typeof company === 'object' && company !== null && !Array.isArray(company)) {
            companyObj = {
                name: company.name || "",
                catchPhrase: company.catchPhrase || "",
                bs: company.bs || ""
            };
        } else {
            companyObj = {
                name: typeof company === 'string' ? company : "",
                catchPhrase: "",
                bs: ""
            };
        }

        const newUser = {
            id: nextId,
            address: addressObj,
            category: companyObj.name || 'Uncategorized',
            company: companyObj,
            createdAt: new Date(),
            email,
            name,
            phone: phone || "",
            updatedAt: new Date(),
            username: username || "",
            website: website || ""
        };

        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
            status: 'success',
            code: 201,
            data: { ...newUser, _id: result.insertedId },
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Error in POST /users:', error);
        res.status(500).json({
            status: 'failed',
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, username, phone, website, address, company } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                status: 'failed',
                code: 400,
                message: 'Name and email are required'
            });
        }

        const usersCollection = await getUsersCollection();

        let addressObj;
        if (typeof address === 'object' && address !== null && !Array.isArray(address)) {
            addressObj = {
                street: address.street || "",
                suite: address.suite || "",
                city: address.city || "",
                zipcode: address.zipcode || "",
                geo: {
                    lat: address.geo?.lat || "",
                    lng: address.geo?.lng || ""
                }
            };
        } else {
            addressObj = {
                street: typeof address === 'string' ? address : "",
                suite: "",
                city: "",
                zipcode: "",
                geo: {
                    lat: "",
                    lng: ""
                }
            };
        }

        let companyObj;
        if (typeof company === 'object' && company !== null && !Array.isArray(company)) {
            companyObj = {
                name: company.name || "",
                catchPhrase: company.catchPhrase || "",
                bs: company.bs || ""
            };
        } else {
            companyObj = {
                name: typeof company === 'string' ? company : "",
                catchPhrase: "",
                bs: ""
            };
        }

        const updateData = {
            name,
            email,
            username: username || "",
            phone: phone || "",
            website: website || "",
            address: addressObj,
            company: companyObj,
            category: companyObj.name || 'Uncategorized',
            updatedAt: new Date()
        };

        const result = await usersCollection.updateOne(
            { id: parseInt(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: 'failed',
                code: 404,
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            code: 200,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error in PUT /users/:id:', error);
        res.status(500).json({
            status: 'failed',
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const usersCollection = await getUsersCollection();

        const result = await usersCollection.deleteOne({ id: parseInt(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: 'failed',
                code: 404,
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            code: 200,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /users/:id:', error);
        res.status(500).json({
            status: 'failed',
            code: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;