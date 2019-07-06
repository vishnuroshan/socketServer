const express = require("express");
const router = express.Router();
var neo4j = require("neo4j-driver");
var driver = neo4j.v1.driver(
	"bolt://localhost",
	neo4j.v1.auth.basic("neo4j", "123")
);
// var type = 'Dir' | 'file';
// create user
router.get("/createuser", function(req, res) {
	createUser(req.query.username, req.query.email);
	res.status(200).json({ status: "SUCCESS" });
});

function createUser(username, email) {
	var session = driver.session();
	session
		.run(
			"CREATE (p:Person {username: {name_param}, email: {email} }) RETURN p",
			{
				name_param: username,
				email: email
			}
		)
		.subscribe({
			onNext: record => {
				console.log(record);
			},
			onCompleted: () => {
				console.log("user created");
				session.close();
				createRoot(username, email);
			},
			onError: err => {
				console.log(err);
			}
		});
}

function createRoot(username, email) {
	var session = driver.session();
	session
		.run(
			"CREATE (r:Directory {type: {type}, owner: {name}, email: {mail} }) RETURN r",
			{
				type: "Dir",
				name: username,
				mail: email
			}
		)
		.subscribe({
			onNext: record => {
				console.log(record);
			},
			onCompleted: () => {
				console.log("root created");
				session.close();
				setOwner(username);
			},
			onError: err => {
				console.log(err);
			}
		});
}

function setOwner(username) {
	var now = new Date().toISOString();
	var session = driver.session();
	session
		.run(
			"MATCH (a:Person),(b:Directory) WHERE " +
				"a.username={name} AND b.owner={name} AND b.type={type} CREATE (a)-[r:OWNES]->(b) RETURN a, b",
			{
				name: username,
				now: now,
				type: "Dir"
			}
		)
		.subscribe({
			onNext: record => {
				console.log(record);
			},
			onCompleted: () => {
				console.log("root linked with user");
				session.close();
			},
			onError: err => {
				console.log("error is ", err);
			}
		});
}

// upload file to root
router.get("/uploadfile", function(req, res) {
	var session = driver.session();
	session
		.run(
			"CREATE (a:file {name: {filename}, type: {type}, size: {size}, " +
				"created: {created_time}, modified: {modified_time}, owner:{username}, shared: false }) RETURN a",
			{
				filename: req.query.filename,
				type: "file",
				size: req.query.size,
				created_time: new Date().toISOString(),
				modified_time: new Date().toISOString(),
				username: req.query.username
			}
		)
		.subscribe({
			onNext: record => {
				console.log(record);
			},
			onCompleted: () => {
				console.log("file uploaded");
				session.close();
				setFileToRoot(req.query.username, req.query.filename);
				res.status(200).json({
					status: "SUCCESS"
				});
			},
			onError: err => {
				console.log(err);
				res.status(500).json({ status: "QUERY ERROR", error: err });
			}
		});
});

function setFileToRoot(username, filename) {
	var session = driver.session();
	session
		.run(
			"MATCH (a:Directory), (b:file) WHERE " +
				"a.owner={username} AND b.owner={username} AND b.name={filename} CREATE (a)-[r:CONTAIN]->(b) RETURN a, b, r",
			{
				username: username,
				filename: filename
			}
		)
		.subscribe({
			onNext: record => {
				console.log(record);
			},
			onCompleted: () => {
				console.log("file linked to root of user");
				session.close();
			},
			onError: err => {
				console.log(err);
			}
		});
}

// make friends
router.get("/makefriends", function(req, res) {
	var session = driver.session();
	session
		.run(
			"MATCH (a:Person)MATCH (b: Person) WHERE " +
				"a.username={user1} AND b.username={user2} CREATE (a)-[r: FRIENDS_WITH]->(b) RETURN a, b",
			{
				user1: req.query.user1,
				user2: req.query.user2
			}
		)
		.subscribe({
			onNext: record => {
				console.log(record);
			},
			onCompleted: () => {
				console.log(req.query.user1, "and", req.query.user2, "are now friends");
				res.status(200).json({
					status: "SUCCESS"
				});
			},
			onError: err => {
				console.log(err);
				res.status(500).json({
					status: "QUERY ERROR",
					error: err
				});
			}
		});
});

router.get("/sharefilewith", function(req, res) {
	// "MATCH (dir:Directory) MATCH (dir1:Directory) "+
	// "WHERE dir.owner={sharer} AND dir1.owner={sharee} MATCH (f:file) "+
	// "WHERE f.owner={sharer} AND f.name={file} CREATE (f)-[r1:SHARED_WITH {privilage: {privilage}, expiry: {expiry} }]->(dir1) RETURN r1"
	var session = driver.session();
	session
		.run(
			"MATCH (dir:Directory) MATCH (dir1:Directory) " +
				"WHERE dir.owner={sharer} AND dir1.owner={sharee} MATCH (f:file) " +
				"WHERE f.owner={sharer} AND f.name={file} CREATE (f)-[r1:SHARED_WITH {privilage: {privilage}, expiry: {expiry} }]->(dir1) RETURN r1",
			{
				sharer: req.query.sharer,
				sharee: req.query.sharee,
				file: req.query.filename,
				privilage: req.query.privilage,
				expiry: new Date().toISOString()
			}
		)
		.subscribe({
			onNext: record => {
				console.log(record);
			},
			onCompleted: () => {
				res.status(200).json({
					status: "SUCCESS"
				});
			},
			onError: err => {
				console.log(err);
				res.status(500).json({
					status: "SUCCESS"
				});
			}
		});
});

// router.get("/login", function(req, res) {
//   res.status(200).json({
//     status: "SUCCESS"
//   });
// });

// router.get("/passreset", function(req, res) {
//   res.status(200).json({
//     status: "SUCCESS",
//     data: "Password reset successful"
//   });
// });

module.exports = router;
