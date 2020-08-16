const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

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
			}
		
			input UserInput {
				email: String!
				password: String!
			}

			type RootQuery {
				users: [User!]!
			}

			type RootMutation {
				createUser(user: UserInput): User
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
			createUser: ({ user }) => {
				const { email, password } = user;
				const newUser = { 
					_id: Math.random().toString(), 
					email, 
					password 
				}
				users.push(newUser)
				return newUser;
			}
		},
		graphiql: true
}));



app.listen('8080', () => console.log('Server listening'));

