const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const bcrypt = require('bcryptjs');

app.use(bodyParser.json());

const User = require('./models/user');
const Post = require('./models/post');

app.use(
	'/graphql',
	graphqlHTTP({
		schema: buildSchema(`
			type User {
				_id: String!
				email: String!
				password: String
				posts: [Post!]!
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

			type Post {
				_id: String!
				title: String!
				message: String!
				author: User!
				createdAt: String!
				updatedAt: String!
			}
		
			input CreatePostInput {
				title: String!
				message: String!
			}
		
			input UpdatePostInput {
				title: String!
				message: String!
			}

			type RootQuery {
				users: [User!]!
			}

			type RootMutation {
				createUser(input: CreateUserInput): User!
				updateUser(input: UpdateUserInput): User!
				createPost(input: CreatePostInput): Post!
				updatePost(input: UpdatePostInput): Post!
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
				return User.findOne({ email }).then(user => {
					if (user) {
						throw new Error('A user with that email address already exists.');
					}
					return bcrypt.hash(password, 12)
				}).then(hashedPassword => {
					const user = new User({
						email: email,
						password: hashedPassword
					});
					return user.save();
				}).then(result => {
					return { 
						...result._doc, 
						password: null, 
						_id: result.id 
					}
				}).catch(err => {
					throw err;
				});
			},
			updateUser: ({ input }) => {
				// const { email, password } = input;
				// find user and update email and pass...
				return input
			},
			posts: () => {
				return posts
			},
			createPost: ({ input }) => {
				const { title, message } = input;
				const post = new Post({
					...input,
					author: "5f3d3464afecb3a585c46eb0"
				});
				let createdPost;
				return post
					.save()
					.then(result => {
						createdPost = { ...result._doc, _id: result._doc._id.toString() };
						return User.findById('5f3d3464afecb3a585c46eb0')
					}).then(user => {
						if (!user) {
							throw new Error('User not found.')
						}
						user.posts.push(post);
						user.save();
					}).then(result => {
						return createdPost;
					})
					.catch(err => {
						console.log(err);
					})
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
