const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

app.use(bodyParser.json());

const users = [];

app.use(
	'/graphql',
	graphqlHTTP({
		schema: buildSchema(`
			type User {
				_id: String!
				email: String!
				password: String!
				createdAt: String!
				updatedAt: String!
			}
		
			input CreateUserInput {
				email: String!
				password: String!
			}
		
			input UpdateUserInput {
				email: String!
				password: String!
			}

			type RootQuery {
				users: [User!]!
			}

			type RootMutation {
				createUser(input: CreateUserInput): User!
				updateUser(input: UpdateUserInput): User!
			}

			schema {
				query: RootQuery
				mutation: RootMutation
			}
		`),
		rootValue: {
			users: () => {
				return users
			},
			createUser: ({ input }) => {
				const { email, password } = input;
				const newUser = { 
					_id: Math.random().toString(),
					email,
					password,
					createdAt: new Date(),
					updatedAt: new Date()
				}
				users.push(newUser)
				return newUser;
			}
		},
		graphiql: true
}));


mongoose.connect(process.env.MONGODB_URI, { 
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	app.listen('8080', () => console.log('Server listening'));	
}).catch(err => console.log(err));
