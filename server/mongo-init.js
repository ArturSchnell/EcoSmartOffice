db.createUser(
    {
        user: process.env.MONGODB_USERNAME,
        pwd: process.env.MONGODB_PASSWORD,
        roles: [
            {
                role: "readWrite",
                db: MONGODB_DATABASE
            }
        ]
    }
);